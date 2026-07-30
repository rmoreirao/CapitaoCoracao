# 🎞️ O Capitão Coração — O Filme

### Roteiro e storyboard da Versão 8

> Este documento é ao mesmo tempo **a narrativa** e a **especificação técnica**
> da versão animada. O texto das legendas e os tempos daqui são espelhados em
> [`roteiro.js`](roteiro.js); mudar a história é mudar este arquivo e refletir
> no arquivo de dados.

---

## Visão geral

|                     |                                                        |
|---------------------|--------------------------------------------------------|
| **Formato**         | Filme automático em SVG animado, sem interação obrigatória |
| **Duração**         | ~5 minutos (11 cenas)                                  |
| **Narração**        | Legendas cinematográficas na tela (sem voz)            |
| **Trilha**          | Ambiente sintetizado no navegador (Web Audio), mudo por padrão |
| **Câmera**          | `viewBox` animado sobre um mundo SVG contínuo de 4000 × 1200 |
| **Fonte do texto**  | Narração ampliada, exclusiva desta versão              |

A grande diferença para a Versão 7: lá o cenário é um mosaico de emojis que
troca de cor a cada capítulo. Aqui existe **um único mundo desenhado**, e a
câmera viaja por ele de ponta a ponta — do mar aberto ao porto — sem cortes
bruscos. O navio não "pula" de posição: ele navega.

---

## O mundo (mapa de coordenadas)

Todo o filme acontece dentro de um `<svg viewBox="0 0 4000 1200">`. A câmera é
uma janela 16:9 (1600 × 900) que se desloca por esse mundo.

```
x:      0        800       1600      2400      3200      4000
        │         │         │         │         │         │
céu     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  y 0–650
        ·  ilha           névoa      farol     enseada   PORTO
mar     ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  y 650–1200
        ⛵ o navio viaja de x≈250 até x≈3500
```

| Marco              | x       | Observação                                   |
|--------------------|---------|----------------------------------------------|
| Horizonte          | y = 650 | linha d'água de todas as cenas               |
| Ilha distante      | 700     | palmeiras, aparece nas cenas 1 e 5           |
| Boia com sino      | 1250    | toca nas cenas 2 e 3                         |
| Banco de neblina   | 2100 – 2750 | densidade máxima em 2400                  |
| Farol              | 2500    | feixe rotativo a partir da cena 4            |
| Enseada / molhe    | 3100    | pedras, gaivotas                             |
| Cais e família     | 3400 – 3980 | casario, 6 lanternas, 10 silhuetas        |
| Constelação-coração| 3720, y 190 | aparece na cena 8                        |

### O trajeto do navio

| Cena | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7–10 |
|------|---|---|---|---|---|---|---|------|
| x    | 700→800 | 800→1150 | 1150→1380 | 1380→2200 | 2200→2760 | 2760→3230 | 3230→3260 | atracado |

### Camadas (do fundo para a frente) e parallax

| # | Camada            | Parallax | Conteúdo |
|---|-------------------|----------|----------|
| 1 | `#camada-ceu`     | 0.00     | gradiente do momento do dia |
| 2 | `#camada-astros`  | 0.15     | campo de estrelas |
| 3 | `#camada-nuvens`  | 0.25     | nuvens em três faixas |
| 4 | `#camada-ceu-mundo` | 1.00   | sol/lua, via láctea, estrela cadente, constelação |
| 5 | `#camada-horizonte` | 1.00   | ilha, boia, farol, molhe, cais, casario, família |
| 6 | `#camada-mar-fundo` | 1.00   | mar, rastro do astro, reflexos das lanternas |
| 7 | `#camada-navio`   | 1.00     | o navio (âncora da cena) |
| 8 | `#camada-mar-medio` | 1.15   | onda média |
| 9 | `#camada-mar-frente` | 1.40  | ondas da frente |
| 10 | `#camada-atmosfera` | 1.00  | neblina, gaivotas, bússola, mapa, onda de luz |

O parallax é aplicado como `translate` proporcional ao deslocamento da câmera:
`deslocamento = (centroDaCâmera − 2000) × (1 − fator)`.

Só recebem parallax as camadas **repetitivas** (estrelas, nuvens) e as **ondas
da frente**, que se movem mais rápido que o navio. Marcos do mundo — ilha,
farol, cais, família — ficam ancorados (fator 1) para que o enquadramento
projetado no roteiro seja exatamente o que aparece na tela.

---

## Paleta por momento do dia

| Momento      | Céu (topo → base)        | Mar         | Luz de cena |
|--------------|--------------------------|-------------|-------------|
| Noite        | `#050b1f` → `#0d2a4d`    | `#08182f`   | fria, tênue |
| Amanhecer    | `#2b3a6b` → `#ffb27a`    | `#1b5a86`   | dourada, rasante |
| Manhã        | `#7ec8f0` → `#cdeefc`    | `#127fbd`   | clara, alta |
| Meio-dia     | `#4fb3e8` → `#bfe9ff`    | `#1596d7`   | dura, vertical |
| Neblina      | `#8fa3ad` → `#c9d4d9`    | `#4a6b7a`   | difusa, sem sombra |
| Tarde        | `#5fb2e0` → `#ffe3b0`    | `#0c82be`   | quente, lateral |
| Pôr do sol   | `#5a2a63` → `#ff9350`    | `#b4501e`   | laranja intensa |
| Crepúsculo   | `#241a4d` → `#7a4a8c`    | `#0a2850`   | violeta |
| Porto (noite)| `#0a1836` → `#2b4a7a`    | `#06213f`   | âmbar das lanternas |

---

# ROTEIRO

Cada cena traz: **Narração** (o que aparece como legenda, em *beats*),
**Imagem**, **Câmera**, **Animação** e **Som**.
`[0:04]` indica o instante do beat dentro da cena.

---

## Cena 0 — Abertura
**Duração:** 20 s · **Céu:** noite → amanhecer · **Transição de saída:** clarão suave

### Narração
- `[0:01]` Todo mar guarda uma história.
- `[0:07]` Esta aqui começa muito antes do amanhecer.
- `[0:13]` **O CAPITÃO CORAÇÃO** *(título)*

### Imagem
Escuro quase total. Só o campo de estrelas e uma linha prateada onde o mar
encontra o céu. O navio é apenas uma silhueta minúscula, quase no centro do
quadro. O título surge letra a letra sobre o mar.

### Câmera
Começa alta e distante — `viewBox -300 -140 2600 1463` — e **desce e aproxima**
lentamente até `200 260 1600 900`, como um plano de helicóptero baixando até a
linha d'água. Easing suave nas duas pontas (`easeInOutCubic`), 20 s.

### Animação
- Estrelas cintilam em ritmos diferentes (opacidade 0.3 → 1, período 2–6 s).
- Uma estrela cadente cruza o quadro em `[0:09]`.
- O mar respira: as três faixas de onda deslizam em velocidades diferentes.
- O céu começa a clarear no último terço: o gradiente noturno interpola para o
  de amanhecer, e as estrelas desaparecem uma a uma.
- O título entra com escala 1.08 → 1.00 e desfoque 6 px → 0.

### Som
Ondas distantes entram do silêncio (ganho 0 → 0.35 em 6 s). Vento tênue.

---

## Cena 1 — Um homem muito querido
*(capítulo 1)* · **Duração:** 34 s · **Céu:** amanhecer · **Narrador:** Esposa

### Narração
- `[0:02]` Era uma vez um homem muito querido.
- `[0:08]` Daqueles que chegam a um lugar sem conhecer ninguém…
- `[0:13]` …e, quando vão embora, já levam amigos para a vida inteira.
- `[0:19]` Daqueles que contam histórias, fazem todo mundo rir e transformam um
  encontro comum em lembrança.
- `[0:26]` Daqueles que reúnem a família em volta da mesa e fazem qualquer almoço
  virar festa.
- `[0:31]` Esse homem era conhecido como o **Capitão Coração**.

### Imagem
O sol nasce à esquerda e pinta o mar de dourado. O navio entra pela borda
esquerda do quadro, inteiro, com a bandeira tremulando. Duas gaivotas cruzam em
diagonal. A ilha de palmeiras aparece pequena no horizonte.

### Câmera
Panorâmica lateral suave acompanhando o navio: `200 260 1600 900` →
`520 250 1600 900`. Movimento constante (`linear`), como um travelling.

### Animação
- **Navio:** balanço vertical de ±10 px (período 4 s) somado a rotação de ±1.5°.
- **Chaminé:** baforadas de fumaça a cada 2.2 s, subindo e dissipando.
- **Bandeira:** ondulação contínua por deformação do path.
- **Sol:** sobe 40 px ao longo da cena; o rastro dourado na água acompanha.
- **Gaivotas:** duas, em rota curva, com bater de asas (2 quadros alternados).
- Legendas entram por baixo com deslize de 12 px e *fade*.

### Som
Ondas em 0.35, vento 0.15. Uma gaivota isolada em `[0:10]`.

---

## Cena 2 — O navio valente
*(capítulo 2)* · **Duração:** 34 s · **Céu:** manhã · **Narrador:** Filho 1

### Narração
- `[0:02]` O Capitão tinha um navio muito especial.
- `[0:08]` Já havia passado por uma grande reforma, anos atrás…
- `[0:13]` …e desde então seguia cruzando mares diferentes: ondas fortes,
  tempestades e dias de sol.
- `[0:21]` Os mecânicos do porto sempre repetiam a mesma coisa:
- `[0:26]` — Capitão, esse navio é valente. Mas, para navegar por muitos anos
  ainda, ele precisa de combustível melhor, mais descanso e menos tempestades.

### Imagem
Primeiro plano geral e, na segunda metade, **aproximação no casco**: dá para ver
os rebites, um remendo de chapa mais clara, as vigias e o coração pintado na
proa. Nuvens brancas passam altas. Uma boia com sino balança à direita.

### Câmera
Zoom de aproximação: `520 250 1600 900` → `880 380 1000 563`, com uma leve
inclinação (rotação de 1.2° do grupo de câmera) na chegada. Easing
`easeInOutQuad`.

### Animação
- **Rebites e remendo** ganham brilho sequencial (varredura de luz) em `[0:09]`.
- **Motor:** o casco vibra sutilmente (2 px, 12 Hz) enquanto a fala dos mecânicos
  aparece.
- **Boia:** balança e o badalo bate; um anel de onda circular se expande.
- **Fumaça** fica mais espessa em `[0:26]`.
- Legendas dos mecânicos entram em itálico, com travessão, diferenciadas.

### Som
Ondas 0.4. Sino da boia em `[0:16]` e `[0:24]`. Ronco grave do motor (0.12).

---

## Cena 3 — A viagem do jeito dele
*(capítulo 3)* · **Duração:** 32 s · **Céu:** meio-dia · **Narrador:** Filho 2

### Narração
- `[0:02]` O Capitão ouvia… sorria… fazia uma piada… e seguia viagem do mesmo
  jeito.
- `[0:10]` Às vezes colocava combustível demais, daqueles que deixam o navio
  pesado.
- `[0:17]` Às vezes exagerava na bebida da festa.
- `[0:23]` E muitas vezes esquecia de dar ao motor o descanso que ele tanto
  precisava.

### Imagem
Sol a pino, luz dura, sombras curtas. O mar fica mais picado: as ondas ganham
amplitude e cristas brancas. O navio corre depressa e **afunda um pouco mais na
água** a cada frase — a linha de flutuação sobe visivelmente.

### Câmera
Travelling mais rápido, com balanço: `880 380 1000 563` → `1560 300 1500 844`.
Um leve *shake* vertical (±4 px, 0.8 s) acompanha as ondas.

### Animação
- **Ondas:** amplitude cresce de 18 px para 34 px ao longo da cena.
- **Navio:** afunda 16 px no total; a inclinação aumenta para ±3°.
- **Esteira:** rastro de espuma mais longo e mais opaco.
- **Respingos:** partículas brancas surgem na proa a cada choque de onda.
- Em `[0:23]`, a fumaça engasga: uma baforada falha e sai escura.

### Som
Ondas 0.55, com colisões acentuadas. Motor sobe para 0.2 e fica irregular.

---

## Cena 4 — A neblina e o compasso
*(capítulo 4)* · **Duração:** 38 s · **Céu:** neblina · **Narrador:** Filho 3

### Narração
- `[0:02]` Até que, em certo momento, o navio pediu uma pausa.
- `[0:08]` Primeiro veio uma neblina que apagou o horizonte.
- `[0:15]` Depois o motor perdeu o compasso — e lembrou ao Capitão que até as
  máquinas mais fortes precisam de manutenção.
- `[0:24]` Foi preciso atracar por alguns dias, para que tudo fosse cuidado com
  calma.
- `[0:31]` Uma pausa importante. Até os navios mais resistentes precisam de
  cuidado.

### Imagem
A cena **perde a cor**: saturação cai, o azul vira cinza-esverdeado. Bancos de
neblina entram pela frente e por trás do navio, encobrindo o horizonte. Em
close, uma **bússola** gira sem encontrar o norte. Ao longe, a primeira piscada
do farol.

### Câmera
Freia até quase parar: `1560 300 1500 844` → `2180 330 1350 760`. Micro-tremor
constante (±2 px) durante o trecho do motor. Em `[0:15]`, corte suave para um
**inserto** da bússola (zoom em `2260 520 420 236`), voltando ao plano geral em
`[0:22]`.

### Animação
- **Neblina:** três bancos com opacidade 0 → 0.62, deslizando em velocidades
  diferentes; desfoque aplicado às camadas de trás.
- **Saturação** da cena inteira cai para 40 % via filtro CSS.
- **Motor:** a vibração fica arrítmica e depois **para**; a fumaça cessa.
- **Bússola:** a agulha gira 3 voltas, desacelera, oscila e para tremendo.
- **Farol:** o feixe começa a girar (12 s por volta), aparecendo e sumindo na
  névoa.
- **Batimento cardíaco visual:** uma vinheta escura pulsa duas vezes em `[0:18]`.

### Som
Ondas caem para 0.2, abafadas (filtro passa-baixa). Vento sobe para 0.3. O motor
falha e silencia. Sino de névoa, distante, em `[0:20]` e `[0:28]`.

---

## Cena 5 — O porto cheio de amor
*(capítulo 5)* · **Duração:** 36 s · **Céu:** tarde · **Narrador:** Filho 4

### Narração
- `[0:02]` Quando o Capitão voltou para casa, encontrou o porto cheio de amor.
- `[0:09]` Estava lá sua esposa, que faz tudo por ele e nunca sai do seu lado.
- `[0:16]` Estavam lá seus quatro filhos.
- `[0:21]` Estavam lá suas três noras.
- `[0:26]` Estavam lá seus dois netos.
- `[0:30]` E estava lá uma família inteira que o ama profundamente.

### Imagem
A neblina se rasga e a cor volta de uma vez: luz quente de fim de tarde. À
direita aparece o **cais**, com lanternas acesas e dez silhuetas acenando. A
ilha reaparece atrás. É a cena mais luminosa do filme até aqui.

### Câmera
Panorâmica ampla e generosa, revelando o porto: `2180 330 1350 760` →
`2900 250 1700 956`. Movimento com `easeOutCubic` — começa firme e desacelera na
chegada, como quem enfim avista a casa.

### Animação
- **Saturação** volta de 35 % para 100 % em 3 s.
- **Neblina** sai por baixo, dissipando.
- As **silhuetas entram em ondas**, sincronizadas com a narração:
  1 esposa `[0:09]` → 4 filhos `[0:16]` → 3 noras `[0:21]` → 2 netos `[0:26]`.
  Cada grupo aparece com um pequeno salto elástico e começa a acenar.
- **Acenos:** braço girando ±25°, com fases diferentes por pessoa.
- **Lanternas:** acendem em cascata da esquerda para a direita.
- **Corações** pequenos sobem do cais e se dissolvem.

### Som
Ondas voltam a 0.4, claras. Vento cai. Gaivotas. Um acorde quente entra ao fundo.

---

## Cena 6 — O pedido da família
*(capítulo 6)* · **Duração:** 32 s · **Céu:** fim de tarde · **Narrador:** Nora 1

### Narração
- `[0:02]` Ninguém ali queria ver o Capitão correndo sem parar, gastando todas
  as forças.
- `[0:10]` Todo mundo queria uma coisa só: que ele continue navegando por muitos
  e muitos anos.
- `[0:18]` Por isso, a família fez um pedido:
- `[0:23]` *"Pai, agora é hora de cuidar do seu navio com o mesmo carinho com que
  você sempre cuidou de todo mundo."*

### Imagem
Close no cais. As silhuetas ganham detalhe. O navio está atracado, quieto, com
as amarras presas. Um balão de fala grande e claro ocupa o centro em `[0:23]`.

### Câmera
Aproximação e leve contra-plongée: `2900 250 1700 956` → `3170 372 1100 619`.

### Animação
- O navio **para de balançar** aos poucos (amplitude → 3 px).
- Amarras se tensionam com um estalo visual.
- O balão de fala entra com escala elástica e uma leve inclinação.
- A frase do pedido aparece **palavra por palavra**, mais lenta que as demais.
- O céu escurece continuamente rumo ao pôr do sol.

### Som
Ambiente calmo (0.3). Uma nota grave sustentada sob a frase do pedido.

---

## Cena 7 — O mapa do bom cuidado
*(capítulo 7)* · **Duração:** 36 s · **Céu:** pôr do sol · **Narrador:** Nora 2

### Narração
- `[0:03]` *"Dormir um pouco mais não é fraqueza. É reparo."*
- `[0:10]` *"Comer melhor é combustível de qualidade."*
- `[0:16]` *"Diminuir a bebida é aliviar o peso da viagem."*
- `[0:22]` *"Escutar os médicos é ouvir quem entende do mapa."*
- `[0:29]` *"Se cuidar é uma forma de continuar com a gente."*

### Imagem
Sobre o mar alaranjado do pôr do sol, **desenha-se um mapa náutico translúcido**
— rosa dos ventos, linhas de rumo, um pergaminho de bordas gastas. Cada conselho
acende um **marco** na rota, ligado ao anterior por uma linha tracejada.

### Câmera
Recua para caber o mapa inteiro: `3170 372 1100 619` → `2875 330 1750 984`, com
um giro suave de 2°, como quem gira a carta sobre a mesa.

### Animação
- **Mapa:** entra com `stroke-dasharray` sendo desenhado (2.5 s).
- **Rosa dos ventos:** gira até o norte e trava, com um brilho.
- **Marcos:** um por conselho, com pulso ao aparecer e a linha tracejada
  avançando até ele (`stroke-dashoffset` animado).
- **Sol:** desce até tocar o horizonte no fim da cena; o céu passa de laranja a
  violeta.
- **Silhuetas** do cais permanecem ao fundo, mais escuras, ainda acenando.

### Som
Ondas 0.3. Papel/pergaminho a cada marco. Sino suave no quinto conselho.

---

## Cena 8 — Continue sendo você
*(capítulo 8)* · **Duração:** 34 s · **Céu:** crepúsculo → noite estrelada · **Narrador:** Nora 3

### Narração
- `[0:02]` No fim das contas, o pedido não é para que ele mude quem é.
- `[0:08]` Continue fazendo piadas.
- `[0:12]` Continue puxando conversa com desconhecidos.
- `[0:16]` Continue fazendo amigos por onde passar.
- `[0:20]` Continue reunindo a família e enchendo a casa de risadas.
- `[0:27]` Só queremos que você faça tudo isso… por muitos e muitos anos.

### Imagem
A noite chega bonita, não triste. Lanternas do porto brilham na água. A cada
"continue", **uma risada vira uma estrela**: um pequeno brilho sobe do cais e se
fixa no céu, até formar uma constelação em forma de coração.

### Câmera
Sobe do cais para o céu: `2875 330 1750 984` → `2845 60 1750 984`. Movimento
lento e contínuo, terminando com o céu ocupando quase todo o quadro.

### Animação
- **Estrelas-risada:** quatro partículas (uma por "continue") sobem em arco,
  crescem, cintilam e se fixam.
- **Constelação:** ao fim, linhas finas ligam as estrelas formando um coração,
  desenhadas com `stroke-dashoffset`.
- **Reflexos** das lanternas ondulam na água.
- **Céu:** interpola de crepúsculo violeta para noite profunda; a via láctea
  aparece como uma faixa suave.

### Som
Vento sobe leve (0.2). Um brilho cristalino a cada estrela.

---

## Cena 9 — Só existe um Capitão Coração
*(capítulo 9)* · **Duração:** 40 s · **Céu:** noite → primeira luz · **Narrador:** Os dois netos

### Narração
- `[0:02]` Você transforma lugares em encontros.
- `[0:07]` Você transforma conhecidos em amigos.
- `[0:12]` Você transforma momentos comuns em lembranças que ficam para sempre.
- `[0:19]` Porque o seu coração não bate só dentro do seu peito.
- `[0:24]` Ele bate um pouquinho dentro de cada um de nós.
- `[0:30]` O mundo tem muita gente comum. Mas só existe **um Capitão Coração**.
- `[0:35]` E a gente ainda precisa dele navegando ao nosso lado por muitos e
  muitos anos.

### Imagem
A constelação-coração **pulsa** no ritmo de um batimento. A cada pulso, uma onda
de luz desce pelo céu, atravessa o mar e ilumina o cais — e cada silhueta da
família pulsa junto, no mesmo compasso. O farol varre a cena. No fim, a primeira
luz do dia toca o horizonte.

### Câmera
Recua para o plano mais amplo do filme, abraçando céu, mar e porto:
`2845 60 1750 984` → `2700 120 2000 1125`. Praticamente parada nos últimos 8 s.

### Animação
- **Batimento:** ciclo de 1.1 s (contração rápida, relaxamento lento) aplicado à
  constelação e, com atraso, a cada silhueta.
- **Onda de luz:** gradiente radial que desce do coração até o cais a cada
  batida.
- **Farol:** feixe completa duas voltas durante a cena.
- **Amanhecer:** nos últimos 6 s, uma faixa quente cresce no horizonte e as
  estrelas se apagam — menos as do coração.
- A palavra "**um**" em "só existe um Capitão Coração" recebe destaque em escala
  e cor.

### Som
Batimento cardíaco (0.25) entra em `[0:19]` e sustenta até o fim. Ondas calmas.
Tudo desce suavemente nos últimos 4 s.

---

## Cena 10 — Epílogo: o porto do amor
**Duração:** aberta (o filme para aqui) · **Céu:** amanhecer no porto

### Narração
- `[0:02]` **Chegamos ao porto do amor.**
- `[0:06]` Com todo o amor, sua esposa, seus quatro filhos, suas três noras e
  seus dois netos.

### Imagem
Plano fixo e sereno do porto ao amanhecer, com o navio atracado e a família
reunida no cais. Sobre ele, a assinatura da família e, logo abaixo, a **galeria
de fotos reais** — as mesmas da pasta `fotos/`. Dois botões: *ver novamente* e
*início*.

### Câmera
Parada em `2700 120 2000 1125`, com uma respiração muito lenta (zoom de 1 % em
20 s, em laço).

### Animação
- A constelação-coração continua pulsando, discreta, atrás do conteúdo.
- As fotos entram em cascata, com leve rotação alternada.
- Lanternas do cais oscilam.

### Som
Ambiente baixo (0.15), ondas calmas, sem batimento.

---

# Apêndice A — Correspondência com a história original

| Cena | Capítulo original | Narrador |
|------|-------------------|----------|
| 0    | — (criada para o filme) | — |
| 1    | 1. Um homem muito querido | Esposa |
| 2    | 2. O navio valente | Filho 1 |
| 3    | 3. A viagem do jeito dele | Filho 2 |
| 4    | 4. A neblina e o compasso | Filho 3 |
| 5    | 5. O porto cheio de amor | Filho 4 |
| 6    | 6. O pedido da família | Nora 1 |
| 7    | 7. O mapa do bom cuidado | Nora 2 |
| 8    | 8. Continue sendo você | Nora 3 |
| 9    | 9. Só existe um Capitão Coração | Os dois netos |
| 10   | — (assinatura + fotos) | — |

> O texto dos 9 capítulos originais continua intacto em `assets/js/story.js` e é
> o que as versões 1 a 7 exibem. A narração ampliada acima vive apenas na
> Versão 8.

---

# Apêndice B — Inventário de elementos SVG

| Elemento | `id` / classe | Notas de construção |
|----------|---------------|---------------------|
| Gradiente do céu | `#grad-ceu` | duas `<stop>` animadas por JS |
| Sol / lua | `#astro` | círculo + halo com `feGaussianBlur` |
| Campo de estrelas | `#estrelas` | ~90 círculos gerados por JS, cintilação por CSS |
| Estrela cadente | `#cadente` | linha com `stroke-dasharray` animado |
| Nuvens | `.nuvem` | união de 4–6 círculos, três faixas de profundidade |
| Ilha | `#ilha` | morro + 3 palmeiras (tronco curvo + folhas) |
| Farol | `#farol` | torre listrada, casa, lanterna, feixe em `<polygon>` rotativo |
| Cais | `#cais` | estacas, tábuas, 6 lanternas |
| Família | `#familia` | 10 `<g class="pessoa">` com cabeça, corpo e braço animável |
| Navio | `#navio` | casco, linha d'água, 6 vigias, cabine, chaminé, mastro, bandeira, coração na proa |
| Fumaça | `#fumaca` | círculos reciclados, sobem e dissipam |
| Esteira | `#esteira` | `path` com opacidade em degradê |
| Ondas | `#onda-fundo/medio/frente` | `path` senoidal recalculado a cada quadro |
| Neblina | `.banco-neblina` | elipses muito desfocadas, três velocidades |
| Bússola | `#bussola` | círculo, rosa dos ventos, agulha rotativa |
| Mapa | `#mapa` | pergaminho, linhas de rumo, 5 marcos |
| Coração-constelação | `#constelacao` | 7 estrelas + linhas ligando |
| Vinheta | `#vinheta` | retângulo com gradiente radial |

---

# Apêndice C — Comandos e acessibilidade

| Ação | Teclado | Botão |
|------|---------|-------|
| Iniciar | `Enter` / `Espaço` | ▶ Começar |
| Pausar / retomar | `Espaço` | ⏸ / ▶ |
| Cena anterior / próxima | `←` / `→` | ‹ / › |
| Tela cheia | `F` | ⛶ |
| Som ligado / desligado | `M` | 🔊 / 🔇 |

- Todo o SVG é `aria-hidden`; a narrativa é anunciada pelas legendas em uma
  região `aria-live="polite"`.
- Com `prefers-reduced-motion`, as animações contínuas (ondas, cintilação,
  parallax) são desligadas e a câmera passa a **cortar** entre cenas em vez de
  deslizar — mas a história continua avançando normalmente.
- O áudio começa **desligado** e só é criado após um clique, respeitando a
  política de autoplay dos navegadores.
