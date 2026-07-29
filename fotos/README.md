# 📸 Fotos da família

Coloque aqui as fotos reais da família. **Só isso.** A galeria das sete versões
do site se atualiza sozinha — não é preciso mexer em nenhum código.

## Como adicionar (ou remover) fotos

1. Copie os arquivos para esta pasta.
2. Nomeie cada arquivo começando pelo nome da pessoa:

   ```
   <pessoa>-<numero>.<extensão>
   ```

   Exemplos: `caio-05.jpg`, `mae-04.jpg`, `rodrigo-08.png`.

3. Faça `commit` e `push`. O workflow de deploy regera o manifesto
   (`fotos.js` / `fotos.json`) e publica o site automaticamente.

Para remover uma foto, basta apagar o arquivo e dar `push`.

## Legendas

A legenda exibida sob cada foto é o trecho **antes do primeiro `-` ou `_`**,
capitalizado:

| Arquivo          | Legenda   |
|------------------|-----------|
| `caio-01.jpg`    | Caio      |
| `felipe-02.jpg`  | Felipe    |
| `mae-03.jpg`     | Mãe       |
| `maria-01.jpg`   | Maria     |
| `rodrigo-07.jpg` | Rodrigo   |

Prefixos com acento ou grafia especial (`mae` → *Mãe*, `vo` → *Vó*,
`familia` → *Família*, …) estão no mapa `NOMES` em
[`../tools/gerar-fotos.mjs`](../tools/gerar-fotos.mjs) — é só acrescentar novos
nomes ali quando precisar. Um arquivo sem prefixo (ex.: `praia.jpg`) aparece
sem legenda.

## Formatos aceitos

`.jpg`, `.jpeg`, `.png`, `.webp` e `.gif`.

Evite espaços, acentos e letras maiúsculas nos nomes dos arquivos.
As fotos aparecem na **proporção original**, em uma colagem de colunas — não é
preciso recortar nada. Fotos muito pesadas (acima de ~2 MB) demoram a carregar
no celular; se puder, reduza antes de subir.

## Gerando o manifesto localmente

A lista de fotos fica em `fotos.js` (usado pelas páginas) e `fotos.json`, ambos
**gerados automaticamente** — não edite à mão. Depois de adicionar fotos, para
ver o resultado localmente:

```bash
node tools/gerar-fotos.mjs          # regera fotos.js e fotos.json
node tools/gerar-fotos.mjs --check  # só verifica se estão atualizados
```
