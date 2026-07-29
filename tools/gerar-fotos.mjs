#!/usr/bin/env node
/*
 * Gera o manifesto da galeria de fotos a partir do conteúdo da pasta /fotos.
 *
 * Saídas:
 *   fotos/fotos.js   -> define window.CAPITAO_FOTOS (carregado pelas páginas;
 *                       funciona também abrindo o site direto do disco)
 *   fotos/fotos.json -> mesma lista, em JSON
 *
 * Uso:
 *   node tools/gerar-fotos.mjs           # (re)gera os arquivos
 *   node tools/gerar-fotos.mjs --check   # falha se estiverem desatualizados
 *
 * Convenção de nomes: <pessoa>-<n>.<ext>  (ex.: caio-01.jpg, mae-02.jpg)
 * O trecho antes do primeiro "-" ou "_" vira a legenda da foto.
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, openSync, readSync, closeSync } from "node:fs";
import { join, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const pastaFotos = join(raiz, "fotos");

const EXTENSOES = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

// Nomes de exibição para prefixos conhecidos (acentos, capitalização especial).
const NOMES = {
  mae: "Mãe",
  pai: "Pai",
  vo: "Vó",
  vovo: "Vovó",
  familia: "Família",
  avo: "Avô"
};

function semAcentos(txt) {
  return txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function legendaDe(arquivo) {
  const nome = basename(arquivo, extname(arquivo));
  const separador = nome.search(/[-_]/);
  if (separador <= 0) return "";
  const chave = semAcentos(nome.slice(0, separador)).toLowerCase();
  if (!chave) return "";
  if (NOMES[chave]) return NOMES[chave];
  return chave.charAt(0).toUpperCase() + chave.slice(1);
}

/* ---------- dimensões da imagem (sem dependências) ---------- */

function dimensoesPNG(buf) {
  // assinatura PNG + chunk IHDR: largura/altura são big-endian nos bytes 16..23
  if (buf.length < 24) return null;
  if (buf.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function dimensoesGIF(buf) {
  if (buf.length < 10 || buf.toString("ascii", 0, 3) !== "GIF") return null;
  return { width: buf.readUInt16LE(6), height: buf.readUInt16LE(8) };
}

function dimensoesWEBP(buf) {
  if (buf.length < 30) return null;
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const formato = buf.toString("ascii", 12, 16);
  if (formato === "VP8 ") {
    return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
  }
  if (formato === "VP8L") {
    const bits = buf.readUInt32LE(21);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  if (formato === "VP8X") {
    const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
    const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
    return { width: w, height: h };
  }
  return null;
}

// Orientação EXIF dentro de um segmento APP1; 5..8 significam foto girada 90°.
function orientacaoEXIF(buf, inicio, fim) {
  if (buf.toString("ascii", inicio, inicio + 6) !== "Exif\0\0") return null;
  const tiff = inicio + 6;
  if (tiff + 8 > fim) return null;
  const ordem = buf.toString("ascii", tiff, tiff + 2);
  if (ordem !== "II" && ordem !== "MM") return null;
  const le = ordem === "II";
  const u16 = (o) => (le ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (le ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > fim) return null;
  const entradas = u16(ifd);
  for (let e = 0; e < entradas; e++) {
    const off = ifd + 2 + e * 12;
    if (off + 12 > fim) break;
    if (u16(off) === 0x0112) return u16(off + 8);
  }
  return null;
}

function dimensoesJPEG(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  let orientacao = null;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marcador = buf[i + 1];
    // marcadores sem payload
    if (marcador === 0xd8 || marcador === 0x01 || (marcador >= 0xd0 && marcador <= 0xd7)) { i += 2; continue; }
    if (marcador === 0xd9 || marcador === 0xda) break; // fim / início dos dados comprimidos
    const tamanho = buf.readUInt16BE(i + 2);
    const ehSOF = marcador >= 0xc0 && marcador <= 0xcf &&
      marcador !== 0xc4 && marcador !== 0xc8 && marcador !== 0xcc;
    if (ehSOF) {
      const height = buf.readUInt16BE(i + 5);
      const width = buf.readUInt16BE(i + 7);
      // o navegador aplica a orientação EXIF; as medidas seguem a foto já girada
      return orientacao >= 5 && orientacao <= 8
        ? { width: height, height: width }
        : { width, height };
    }
    if (marcador === 0xe1 && orientacao === null) {
      orientacao = orientacaoEXIF(buf, i + 4, Math.min(i + 2 + tamanho, buf.length));
    }
    if (tamanho < 2) break;
    i += 2 + tamanho;
  }
  return null;
}

function dimensoes(caminho) {
  // lê só o início do arquivo (cabeçalhos ficam no começo); amplia se preciso
  for (const tamanho of [65536, 1048576]) {
    const fd = openSync(caminho, "r");
    const buf = Buffer.alloc(tamanho);
    let lidos = 0;
    try {
      lidos = readSync(fd, buf, 0, tamanho, 0);
    } finally {
      closeSync(fd);
    }
    const parte = buf.subarray(0, lidos);
    const d = dimensoesPNG(parte) || dimensoesGIF(parte) || dimensoesWEBP(parte) || dimensoesJPEG(parte);
    if (d && d.width && d.height) return d;
    if (lidos < tamanho) break; // arquivo inteiro já foi lido
  }
  return null;
}

/* ---------- montagem do manifesto ---------- */

function coletarFotos() {
  return readdirSync(pastaFotos)
    .filter((nome) => EXTENSOES.has(extname(nome).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true, sensitivity: "base" }))
    .map((arquivo) => {
      const item = { arquivo, legenda: legendaDe(arquivo) };
      const d = dimensoes(join(pastaFotos, arquivo));
      if (d) { item.width = d.width; item.height = d.height; }
      else { console.warn(`aviso: não foi possível ler as dimensões de ${arquivo}`); }
      return item;
    });
}

const fotos = coletarFotos();

const conteudoJSON = JSON.stringify({ fotos }, null, 2) + "\n";
const conteudoJS =
  "/* Arquivo gerado automaticamente por tools/gerar-fotos.mjs — não edite à mão. */\n" +
  "/* Para atualizar a galeria, basta adicionar ou remover imagens na pasta /fotos. */\n" +
  "window.CAPITAO_FOTOS = " + JSON.stringify(fotos, null, 2) + ";\n";

const destinoJSON = join(pastaFotos, "fotos.json");
const destinoJS = join(pastaFotos, "fotos.js");

const ler = (p) => (existsSync(p) ? readFileSync(p, "utf8") : null);

if (process.argv.includes("--check")) {
  const desatualizado = ler(destinoJSON) !== conteudoJSON || ler(destinoJS) !== conteudoJS;
  if (desatualizado) {
    console.error("Manifesto de fotos desatualizado. Rode: node tools/gerar-fotos.mjs");
    process.exit(1);
  }
  console.log(`Manifesto atualizado (${fotos.length} fotos).`);
} else {
  writeFileSync(destinoJSON, conteudoJSON, "utf8");
  writeFileSync(destinoJS, conteudoJS, "utf8");
  console.log(`Manifesto gerado com ${fotos.length} foto(s):`);
  for (const f of fotos) {
    console.log(`  ${f.arquivo}  ->  "${f.legenda}"  ${f.width || "?"}x${f.height || "?"}`);
  }
}
