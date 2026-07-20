# O Capitão Coração 💙⛴️

Uma homenagem lúdica, divertida e cheia de amor para o nosso **Capitão Coração**.

O projeto é um **site estático** (apenas HTML, CSS e JavaScript — sem build, sem
servidor) e pode ser hospedado **de graça no GitHub Pages**.

## 🌐 Site no ar

👉 **https://rmoreirao.github.io/CapitaoCoracao/**

> O site é publicado automaticamente no GitHub Pages a cada `push` na branch
> `main`, pelo workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
> Basta habilitar o Pages uma única vez (veja abaixo).

A mesma história é apresentada em **três versões** diferentes, para escolher a
que mais combina com o momento:

| Versão | Pasta | O que é |
|--------|-------|---------|
| 🌊 **Navegando** | [`versao1/`](versao1/index.html) | Site interativo: o navio flutua nas ondas e você avança capítulo a capítulo clicando em "Continuar navegando". |
| 📖 **Livro Ilustrado** | [`versao2/`](versao2/index.html) | Um livrinho infantil: vire as páginas (com botões ou as setas do teclado), uma ilustração por página. |
| ❤️ **A Família Conta** | [`versao3/`](versao3/index.html) | Cada membro da família narra um pedacinho da história, em balões de fala que aparecem conforme você rola a tela. |

A página inicial [`index.html`](index.html) reúne as três versões.

## 📸 Fotos da família

As três versões terminam com uma galeria de fotos da família. Os espaços já
estão prontos como **placeholders** (mostram "📷 Foto aqui"). Basta adicionar as
imagens reais na pasta [`fotos/`](fotos/) — veja as instruções em
[`fotos/README.md`](fotos/README.md).

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
index.html            # página inicial com as três versões
assets/
  css/common.css      # estilos compartilhados (tema, galeria de fotos)
  js/story.js         # texto da história (compartilhado pelas 3 versões)
  js/familia.js       # renderiza a galeria de fotos (placeholders)
versao1/              # site interativo "Navegando"
versao2/              # livro ilustrado
versao3/              # a família conta a história
fotos/                # coloque aqui as fotos reais da família
```

> O texto da história fica em um único lugar (`assets/js/story.js`), então
> qualquer ajuste no conteúdo aparece automaticamente nas três versões.

Feito com muito carinho. 🌊⚓
