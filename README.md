# O Capitão Coração 💙⛴️

Uma homenagem lúdica, divertida e cheia de amor para o nosso **Capitão Coração**.

O projeto é um **site estático** (HTML, CSS e JavaScript, sem build) publicado no
GitHub Pages. A entrada principal do site agora redireciona direto para a
**Versão 8 — O Filme**, que passa a ser a versão oficial.

## 🌐 Site no ar

👉 **https://rmoreirao.github.io/CapitaoCoracao/**

Ao abrir a raiz do site, o visitante é enviado para
[`versao8/index.html`](versao8/index.html).

## 🎞️ Versão 8 — O Filme

A versão oficial é um **filme animado**: cenário desenhado em SVG, câmera em
movimento, narração ampliada, trilha sintetizada e, no final, as fotos da
família passando uma a uma.

O roteiro completo, cena a cena, está em
[`versao8/roteiro.md`](versao8/roteiro.md). Ele é a fonte da verdade da
narrativa; [`versao8/roteiro.js`](versao8/roteiro.js) espelha esse conteúdo em
dados para o motor do filme.

### Controles

| Ação | Teclado | Botão |
|------|---------|-------|
| Iniciar | `Enter` / `Espaço` | **▶ Começar o filme** |
| Pausar / retomar | `Espaço` | ⏸ / ▶ |
| Cena anterior / próxima | `←` / `→` | `‹` / `›` |
| Ligar o som | `M` | 🔇 / 🔊 |
| Tela cheia | `F` | ⛶ |
| Recomeçar o filme | — | ↺ |

O som começa **desligado** por causa das políticas de autoplay dos navegadores e
é gerado na hora com Web Audio — não há arquivos de áudio no repositório.

### 🎥 Gravando em vídeo

Abra **[`versao8/index.html?video=1`](versao8/index.html?video=1)**: o filme
roda sem player, sem barra de progresso e sem rótulos. Basta clicar em
**▶ Começar o filme** e gravar a tela.

### 📸 Fotos da família

As fotos da Versão 8 vêm da pasta [`fotos/`](fotos/). No final do filme elas
passam **uma a uma**; depois aparecem em grade.

Para atualizar a galeria, basta adicionar ou remover arquivos com nomes como
`pessoa-01.jpg` e dar `push`: o workflow regenera `fotos/fotos.js` e
`fotos/fotos.json` automaticamente. Veja [`fotos/README.md`](fotos/README.md).

### 🗂️ Arquivos

```text
index.html            # redireciona a raiz para a versão oficial
versao8/
  index.html          # o player do filme
  roteiro.md          # roteiro/storyboard (fonte da verdade da narrativa)
  roteiro.js          # roteiro em dados
  motor.js            # relógio, timeline, câmera e interpolações
  cenario.js          # cenário, ondas, clima, família e partículas
  audio.js            # trilha e efeitos sintetizados
  slideshow.js        # fotos finais, uma a uma
  style.css           # interface, legendas e telas
fotos/                # fotos da família (+ manifestos gerados)
tools/gerar-fotos.mjs # gera fotos/fotos.js e fotos/fotos.json
```

## 🗃️ Arquivo histórico

As versões anteriores continuam no repositório e seguem acessíveis por URL
direta, mas agora ficam apenas como arquivo histórico:

- [Versão 1 — Navegando](versao1/index.html)
- [Versão 2 — Livro Ilustrado](versao2/index.html)
- [Versão 3 — A Família Conta](versao3/index.html)
- [Versão 4 — Travessia Cinematográfica](versao4/index.html)
- [Versão 5 — Mapa da Grande Viagem](versao5/index.html)
- [Versão 6 — Mar de Memórias](versao6/index.html)
- [Versão 7 — Jornada Cinematográfica](versao7/index.html)

O texto compartilhado dessas versões continua em
[`assets/js/story.js`](assets/js/story.js), e a galeria antiga segue em
[`assets/js/familia.js`](assets/js/familia.js).

## 🚀 Como publicar no GitHub Pages

A publicação é automática via GitHub Actions:

1. Faça o merge na branch principal (`main`).
2. No repositório, vá em **Settings → Pages**.
3. Em **Source**, escolha **GitHub Actions**.
4. A cada `push` na `main`, o workflow
   [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) publica o site
   em **https://rmoreirao.github.io/CapitaoCoracao/**.

> Alternativa manual: em **Settings → Pages → Source**, escolha
> **Deploy from a branch**, branch `main` e pasta `/ (root)`.

## 🖥️ Como testar localmente

Como é tudo estático, o jeito mais seguro de testar é servir a raiz do
repositório com um servidor simples:

```bash
python3 -m http.server 8000
# depois abra http://localhost:8000
```

## Feito com carinho

Nada foi apagado: da `versao1/` à `versao7/`, além de
`assets/js/story.js` e `assets/js/familia.js`, tudo continua publicado junto com
o restante do site.
