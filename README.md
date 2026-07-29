# O Capitão Coração 💙⛴️

Uma homenagem lúdica, divertida e cheia de amor para o nosso **Capitão Coração**.

O projeto é um **site estático** (apenas HTML, CSS e JavaScript — sem build, sem
servidor) e pode ser hospedado **de graça no GitHub Pages**.

## 🌐 Site no ar

👉 **https://rmoreirao.github.io/CapitaoCoracao/**

> O site é publicado automaticamente no GitHub Pages a cada `push` na branch
> `main`, pelo workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
> Basta habilitar o Pages uma única vez (veja abaixo).

A mesma história é apresentada em **sete versões** diferentes, para escolher a
que mais combina com o momento:

| Versão | Pasta | O que é |
|--------|-------|---------|
| 🌊 **Navegando** | [`versao1/`](versao1/index.html) | Site interativo: o navio flutua nas ondas e você avança capítulo a capítulo clicando em "Continuar navegando". |
| 📖 **Livro Ilustrado** | [`versao2/`](versao2/index.html) | Um livrinho infantil: vire as páginas (com botões ou as setas do teclado), uma ilustração por página. |
| ❤️ **A Família Conta** | [`versao3/`](versao3/index.html) | Cada membro da família narra um pedacinho da história, em balões de fala que aparecem conforme você rola a tela. |
| 🎬 **Travessia Cinematográfica** | [`versao4/`](versao4/index.html) | O navio cruza ondas animadas e avança pelo cenário a cada novo capítulo. |
| 🗺️ **Mapa da Grande Viagem** | [`versao5/`](versao5/index.html) | Uma rota interativa por nove portos, com o barco navegando entre as memórias. |
| 🌅 **Mar de Memórias** | [`versao6/`](versao6/index.html) | Uma narrativa vertical com navio, ondas, farol, estrelas e céu em movimento. |
| 🎥 **Jornada Cinematográfica** | [`versao7/`](versao7/index.html) | Um filme automático: a história avança sozinha do amanhecer ao porto, com céu animado, navio em movimento e texto que aparece como legendas cinematográficas. |

A página inicial [`index.html`](index.html) reúne as sete versões.

## 📸 Fotos da família

As sete versões terminam com uma **galeria automática** montada a partir do
conteúdo da pasta [`fotos/`](fotos/). Para atualizar as fotos do site, basta
adicionar ou remover arquivos nessa pasta (nomeados como `pessoa-01.jpg`) e dar
`push`: o workflow regera o manifesto `fotos/fotos.js` e republica o site.
Nenhuma edição de código é necessária — veja [`fotos/README.md`](fotos/README.md).

A legenda de cada foto vem do prefixo do nome do arquivo (`mae-02.jpg` → *Mãe*)
e as imagens são exibidas na proporção original, com carregamento preguiçoso
(`loading="lazy"`).

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
index.html            # página inicial com as sete versões
assets/
  css/common.css      # estilos compartilhados (tema, galeria de fotos)
  js/story.js         # texto da história (compartilhado pelas 7 versões)
  js/familia.js       # renderiza a galeria de fotos
tools/
  gerar-fotos.mjs     # gera fotos/fotos.js e fotos/fotos.json a partir de /fotos
versao1/              # site interativo "Navegando"
versao2/              # livro ilustrado
versao3/              # a família conta a história
versao4/              # travessia cinematográfica
versao5/              # mapa interativo da viagem
versao6/              # mar de memórias em rolagem
versao7/              # jornada cinematográfica (filme automático)
fotos/                # fotos da família (+ fotos.js/fotos.json gerados)
```

> O texto da história fica em um único lugar (`assets/js/story.js`), então
> qualquer ajuste no conteúdo aparece automaticamente nas sete versões.
> A lista de fotos é gerada por `tools/gerar-fotos.mjs` — nunca edite
> `fotos/fotos.js` ou `fotos/fotos.json` à mão.

## 🎥 Versão 7 — Jornada Cinematográfica

A Versão 7 é um **filme automático** que reproduz a história sozinha, do
amanhecer ao porto, sem que o visitante precise rolar ou clicar.

### Controles

| Ação | Teclado | Botão |
|------|---------|-------|
| Iniciar o filme | `Enter` / `Espaço` (na abertura) | **▶ Começar o filme** |
| Pausar / retomar | `Espaço` | ⏸ / ▶ na barra inferior |
| Capítulo anterior | `←` | `‹` na barra |
| Próximo capítulo | `→` | `›` na barra |
| Tela cheia | `F` | ⛶ na barra |
| Voltar ao início | — | ⌂ na barra / `⬅ Início` na abertura |
| Clicar na cena | — | pausa ou retoma |

### Como funciona

- Pressione **"Começar o filme"** uma vez (necessário para contornar restrições
  do navegador).
- A história avança automaticamente, parágrafo a parágrafo, com tempo
  proporcional ao tamanho do texto (~320 ms por palavra).
- O céu muda do amanhecer → manhã → meio-dia → neblina → tarde →
  pôr-do-sol → crepúsculo → noite → chegada ao porto.
- O navio desloca-se da esquerda para a direita conforme a história progride.
- Ao final, aparece a galeria de fotos da família e botões para rever ou
  voltar ao início.
- Respeita `prefers-reduced-motion`: as animações contínuas são desativadas,
  mas a progressão automática é mantida.

Feito com muito carinho. 🌊⚓
