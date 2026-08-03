# O Capitão Coração 💙⛴️

Uma homenagem lúdica, divertida e cheia de amor para o nosso **Capitão Coração**.

O projeto é um **site estático** (apenas HTML, CSS e JavaScript — sem build, sem
servidor) e pode ser hospedado **de graça no GitHub Pages**.

## 🌐 Site no ar

👉 **https://rmoreirao.github.io/CapitaoCoracao/**

> O site é publicado automaticamente no GitHub Pages a cada `push` na branch
> `main`, pelo workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
> Basta habilitar o Pages uma única vez (veja abaixo).

## 🎞️ A versão final: **O Filme**

Esta é a **versão final e definitiva** da história: a Versão 8, *O Filme*.
Abrir o site leva **direto ao filme** — o [`index.html`](index.html) da raiz
apenas redireciona para [`versao8/index.html`](versao8/index.html).

A Versão 8 é a história **totalmente animada**: existe **um mundo desenhado em
SVG** (4000 × 1200) por onde a câmera viaja de ponta a ponta — do mar aberto ao
porto — sem cortes bruscos. São **11 cenas** (~6 min), trilha sintetizada que
muda de humor a cada cena e, no fim, as **fotos da família passando uma a uma**.

O roteiro completo, cena a cena, está em
[`versao8/roteiro.md`](versao8/roteiro.md): narração, imagem, movimento de
câmera, coreografia das animações e som.

### Controles

| Ação | Teclado | Botão |
|------|---------|-------|
| Iniciar | `Enter` / `Espaço` | **▶ Começar o filme** |
| Pausar / retomar | `Espaço` | ⏸ / ▶ (ou clicar na cena) |
| Cena anterior / próxima | `←` / `→` | `‹` / `›` |
| Ligar o som | `M` | 🔇 / 🔊 |
| Tela cheia | `F` | ⛶ |
| Recomeçar o filme | — | ⟲ |

O som começa **desligado** (política de autoplay dos navegadores) e é gerado na
hora com Web Audio — não há nenhum arquivo de áudio no repositório. O acorde de
fundo acompanha a história: tenso na tempestade e na neblina, luminoso na
chegada ao porto.

### 🎥 Gravando em vídeo

Abra **[`versao8/index.html?video=1`](versao8/index.html?video=1)**: o filme roda
sem player, sem barra de progresso e sem rótulos — só a história. Basta apertar
**▶ Começar o filme** (o clique libera o som) e gravar a tela.

### Arquivos do filme

```
versao8/
  roteiro.md   # o roteiro/storyboard (fonte da verdade da narrativa)
  roteiro.js   # o mesmo roteiro em dados: cenas, beats, câmera, som
  index.html   # o mundo SVG + a interface do player
  motor.js     # relógio, timeline, câmera e interpolação de cores
  cenario.js   # ondas, estrelas, nuvens, gaivotas, chuva, família, partículas
  audio.js     # trilha e efeitos sintetizados
  slideshow.js # as fotos da família, uma a uma
  script.js    # orquestração e controles
  style.css    # legendas cinematográficas, telas e player
```

> Para mudar o texto ou o ritmo do filme, edite `roteiro.md` e reflita a
> alteração em `roteiro.js` — nenhuma animação precisa ser reescrita.
> As fotos do final vêm da pasta `fotos/`: acrescentar uma foto lá já a coloca
> no filme.

## 📸 Fotos da família

No fim do filme as fotos da pasta [`fotos/`](fotos/) passam **uma a uma**, como
um álbum em vídeo e sem legenda, e depois aparecem todas juntas em grade.

Para atualizar as fotos do site, basta adicionar ou remover arquivos nessa pasta
(nomeados como `pessoa-01.jpg`) e dar `push`: o workflow regera o manifesto
`fotos/fotos.js` e republica o site. Nenhuma edição de código é necessária —
veja [`fotos/README.md`](fotos/README.md).

## 🚀 Como publicar no GitHub Pages

A publicação é **automática** via GitHub Actions. Só é preciso habilitar o Pages
uma vez:

1. Faça o merge deste conteúdo na branch principal (`main`).
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, escolha **GitHub Actions**.
4. Pronto: a cada `push` na `main`, o workflow
   [`deploy.yml`](.github/workflows/deploy.yml) publica o site em
   **https://rmoreirao.github.io/CapitaoCoracao/**.

> Alternativa manual: em **Settings → Pages → Source**, escolha
> **Deploy from a branch**, branch `main` e pasta `/ (root)`.

## 🖥️ Como testar localmente

Como é tudo estático, basta abrir o `index.html` no navegador. Para as fotos e
os scripts carregarem sem restrições, o ideal é usar um servidor simples:

```bash
python3 -m http.server 8000
# depois abra http://localhost:8000
```

## 🗂️ Estrutura

```
index.html            # redireciona para o filme (versao8/)
versao8/              # O Filme — a versão final (+ roteiro.md)
fotos/                # fotos da família (+ fotos.js/fotos.json gerados)
assets/
  css/common.css      # estilos compartilhados (tema, galeria de fotos)
  js/story.js         # texto original da história (usado pelas versões antigas)
  js/familia.js       # galeria de fotos em grade (usada pelas versões antigas)
tools/
  gerar-fotos.mjs     # gera fotos/fotos.js e fotos/fotos.json a partir de /fotos
versao1/ … versao7/   # versões anteriores, mantidas como arquivo histórico
```

> A lista de fotos é gerada por `tools/gerar-fotos.mjs` — nunca edite
> `fotos/fotos.js` ou `fotos/fotos.json` à mão.

## 🗃️ Versões anteriores (arquivo)

As sete versões que vieram antes continuam no repositório e podem ser abertas
por URL direta, mas **não fazem mais parte do site oficial** — a versão que vale
é *O Filme*.

| Versão | Pasta | O que é |
|--------|-------|---------|
| 🌊 **Navegando** | [`versao1/`](versao1/index.html) | Site interativo: o navio flutua nas ondas e você avança capítulo a capítulo. |
| 📖 **Livro Ilustrado** | [`versao2/`](versao2/index.html) | Um livrinho infantil: vire as páginas, uma ilustração por página. |
| ❤️ **A Família Conta** | [`versao3/`](versao3/index.html) | Cada membro da família narra um pedacinho da história. |
| 🎬 **Travessia Cinematográfica** | [`versao4/`](versao4/index.html) | O navio cruza ondas animadas e avança a cada novo capítulo. |
| 🗺️ **Mapa da Grande Viagem** | [`versao5/`](versao5/index.html) | Uma rota interativa por nove portos de memórias. |
| 🌅 **Mar de Memórias** | [`versao6/`](versao6/index.html) | Narrativa vertical com navio, ondas, farol, estrelas e céu em movimento. |
| 🎥 **Jornada Cinematográfica** | [`versao7/`](versao7/index.html) | Um filme automático com cenário em emojis, do amanhecer ao porto. |

Essas versões usam o texto compartilhado de `assets/js/story.js` e a galeria em
grade de `assets/js/familia.js`. A Versão 8 tem narração própria, ampliada, em
`versao8/roteiro.js`.

Feito com muito carinho. 🌊⚓
