# O Capitão Coração 💙⛴️

Uma homenagem lúdica, divertida e cheia de amor para o nosso **Capitão Coração**.

O projeto é um **site estático** (apenas HTML, CSS e JavaScript — sem build, sem
servidor) e pode ser hospedado **de graça no GitHub Pages**.

## 🌐 Site no ar

👉 **https://rmoreirao.github.io/CapitaoCoracao/**

> O site é publicado automaticamente no GitHub Pages a cada `push` na branch
> `main`, pelo workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
> Basta habilitar o Pages uma única vez (veja abaixo).

A página raiz redireciona automaticamente para a **Versão 8 — O Filme**, a versão
oficial e definitiva da história.

## 🎞️ Versão 8 — O Filme (versão oficial)

A Versão 8 é a história **totalmente animada**. Existe **um mundo desenhado em SVG**
(4000 × 1200) por onde a câmera viaja de ponta a ponta — do mar aberto ao porto
— sem cortes bruscos. São **11 cenas** (~6 min) e, no fim, as **fotos da
família passando uma a uma**.

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
| Recomeçar o filme | — | ⌂ na barra do player |

O som começa **desligado** (política de autoplay dos navegadores) e é gerado na
hora com Web Audio — não há nenhum arquivo de áudio no repositório. O acorde de
fundo acompanha a história: tenso na tempestade e na neblina, luminoso na
chegada ao porto.

### 🎥 Gravando em vídeo

Abra **[`versao8/index.html?video=1`](versao8/index.html?video=1)**: o filme roda
sem player, sem barra de progresso e sem rótulos — só a história. Basta apertar
**▶ Começar o filme** (o clique libera o som) e gravar a tela.

### Arquivos

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

As fotos ficam na pasta [`fotos/`](fotos/), nomeadas como `pessoa-01.jpg`. Para
atualizar as fotos do site, basta adicionar ou remover arquivos nessa pasta e dar
`push`: o workflow regera o manifesto `fotos/fotos.js` e republica o site.
Nenhuma edição de código é necessária — veja [`fotos/README.md`](fotos/README.md).

Na Versão 8 as fotos passam **uma a uma**, como um álbum em vídeo, e sem legenda.

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
index.html            # redireciona para versao8/index.html
assets/
  css/common.css      # estilos compartilhados (tema, galeria de fotos)
  js/story.js         # texto da história (compartilhado pelas versões 1–7)
  js/familia.js       # renderiza a galeria de fotos
tools/
  gerar-fotos.mjs     # gera fotos/fotos.js e fotos/fotos.json a partir de /fotos
versao8/              # o filme: versão oficial (ver seção acima)
fotos/                # fotos da família (+ fotos.js/fotos.json gerados)
```

## 📦 Arquivo histórico

As versões anteriores continuam no repositório e acessíveis por URL direta, mas
não são mais divulgadas na página principal:

| Versão | Pasta | O que é |
|--------|-------|---------|
| 🌊 **Navegando** | [`versao1/`](versao1/index.html) | Site interativo: avance capítulo a capítulo. |
| 📖 **Livro Ilustrado** | [`versao2/`](versao2/index.html) | Um livrinho infantil: vire as páginas. |
| ❤️ **A Família Conta** | [`versao3/`](versao3/index.html) | Cada membro da família narra um trecho. |
| 🎬 **Travessia Cinematográfica** | [`versao4/`](versao4/index.html) | O navio cruza ondas animadas a cada capítulo. |
| 🗺️ **Mapa da Grande Viagem** | [`versao5/`](versao5/index.html) | Rota interativa por nove portos. |
| 🌅 **Mar de Memórias** | [`versao6/`](versao6/index.html) | Narrativa vertical com navio, ondas e farol. |
| 🎥 **Jornada Cinematográfica** | [`versao7/`](versao7/index.html) | Filme automático com emojis animados. |

Feito com muito carinho. 🌊⚓
