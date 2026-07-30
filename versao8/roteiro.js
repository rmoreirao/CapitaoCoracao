/* =========================================================
 *  Versão 8 — O Filme
 *  Dados do roteiro: espelho fiel de roteiro.md
 *
 *  Tudo o que define o filme (texto, tempo, câmera, céu, som,
 *  efeitos) está aqui. O motor apenas executa estes dados.
 *
 *  Unidades: tempo em segundos (dentro da cena),
 *            câmera em coordenadas do mundo SVG (4000 × 1200).
 * ========================================================= */
(function () {
  'use strict';

  /* ── Paleta por momento do dia (Apêndice do roteiro) ── */
  /* astroDX = deslocamento do astro em relação ao centro da câmera */
  var TEMAS = {
    noite:      { ceuTopo: '#050b1f', ceuBase: '#0d2a4d', mar: '#08182f', astro: '#e8eeff', lua: 1, astroY: 200, astroDX: -520, halo: 0.30, nuvens: 0.16 },
    amanhecer:  { ceuTopo: '#2b3a6b', ceuBase: '#ffb27a', mar: '#1b5a86', astro: '#ffd9a0', lua: 0, astroY: 520, astroDX: -680, halo: 0.95, nuvens: 0.70 },
    manha:      { ceuTopo: '#7ec8f0', ceuBase: '#cdeefc', mar: '#127fbd', astro: '#fff3c4', lua: 0, astroY: 330, astroDX: -600, halo: 0.75, nuvens: 0.95 },
    meiodia:    { ceuTopo: '#4fb3e8', ceuBase: '#bfe9ff', mar: '#1596d7', astro: '#fffbe6', lua: 0, astroY: 150, astroDX: -120, halo: 0.85, nuvens: 0.90 },
    tempestade: { ceuTopo: '#2b3742', ceuBase: '#5c6b75', mar: '#1d3a4a', astro: '#8fa0aa', lua: 0, astroY: 190, astroDX:  120, halo: 0.10, nuvens: 1.00 },
    neblina:    { ceuTopo: '#8fa3ad', ceuBase: '#c9d4d9', mar: '#4a6b7a', astro: '#e6ecee', lua: 0, astroY: 260, astroDX:  200, halo: 0.25, nuvens: 0.45 },
    tarde:      { ceuTopo: '#5fb2e0', ceuBase: '#ffe3b0', mar: '#0c82be', astro: '#ffd489', lua: 0, astroY: 380, astroDX:  560, halo: 0.90, nuvens: 0.85 },
    pordosol:   { ceuTopo: '#5a2a63', ceuBase: '#ff9350', mar: '#a8552c', astro: '#ff8b4a', lua: 0, astroY: 610, astroDX:  680, halo: 1.00, nuvens: 0.55 },
    crepusculo: { ceuTopo: '#241a4d', ceuBase: '#7a4a8c', mar: '#0a2850', astro: '#f2e2ff', lua: 1, astroY: 210, astroDX:  620, halo: 0.45, nuvens: 0.28 },
    porto:      { ceuTopo: '#0a1836', ceuBase: '#2b4a7a', mar: '#06213f', astro: '#e8eeff', lua: 1, astroY: 150, astroDX:  640, halo: 0.35, nuvens: 0.18 },
    alvorada:   { ceuTopo: '#1d2f5e', ceuBase: '#ffc79a', mar: '#134f7d', astro: '#ffd9a0', lua: 0, astroY: 560, astroDX: -560, halo: 0.95, nuvens: 0.62 }
  };

  /* ── Marcos do mundo (ver mapa de coordenadas no roteiro) ── */
  var MUNDO = {
    largura: 4000,
    altura: 1200,
    horizonte: 650,
    ilha: 700,
    boia: 1250,
    neblina: [2100, 2750],
    farol: 2500,
    molhe: 3100,
    cais: [3500, 3900],
    navioDe: 250,
    navioAte: 3500
  };

  /* ─────────────────────────────────────────────────────────
   *  CENAS
   *  camera : lista de keyframes { t, box:[x,y,w,h], easing }
   *  ceu    : lista de keyframes { t, tema }
   *  beats  : legendas { t, texto, estilo? }
   *  efeitos: eventos pontuais { t, tipo, ... }
   *  som    : keyframes de ganho { t, ondas, vento, motor, sino... }
   * ───────────────────────────────────────────────────────── */
  var cenas = [

    /* ───── Cena 0 — Abertura ───── */
    {
      id: 'abertura',
      titulo: 'Abertura',
      dur: 20,
      navio: { de: 700, ate: 800, escala: 0.55 },
      camera: [
        { t: 0,  box: [-300, -140, 2600, 1463], easing: 'easeInOutCubic' },
        { t: 20, box: [200, 260, 1600, 900] }
      ],
      ceu: [ { t: 0, tema: 'noite' }, { t: 13, tema: 'noite' }, { t: 20, tema: 'amanhecer' } ],
      beats: [
        { t: 1,  texto: 'Todo mar guarda uma história.' },
        { t: 7,  texto: 'Esta aqui começa muito antes do amanhecer.' },
        { t: 13, texto: 'O Capitão Coração', estilo: 'titulo' }
      ],
      efeitos: [
        { t: 0,  tipo: 'estrelas', valor: 1 },
        { t: 9,  tipo: 'cadente' },
        { t: 15, tipo: 'estrelas', valor: 0.15 }
      ],
      som: [
        { t: 0, acorde: 'Am', ondas: 0.00, vento: 0.00 },
        { t: 6, ondas: 0.35, vento: 0.15 }
      ]
    },

    /* ───── Cena 1 — Um homem muito querido ───── */
    {
      id: 'querido',
      titulo: 'Um homem muito querido',
      capitulo: 1,
      dur: 34,
      navio: { de: 800, ate: 1150, escala: 1 },
      camera: [
        { t: 0,  box: [200, 260, 1600, 900], easing: 'linear' },
        { t: 34, box: [520, 250, 1600, 900] }
      ],
      ceu: [ { t: 0, tema: 'amanhecer' } ],
      beats: [
        { t: 2,  texto: 'Era uma vez um homem muito querido.' },
        { t: 8,  texto: 'Daqueles que chegam a um lugar sem conhecer ninguém…' },
        { t: 13, texto: '…e, quando vão embora, já levam amigos para a vida inteira.' },
        { t: 19, texto: 'Daqueles que contam histórias, fazem todo mundo rir e transformam um encontro comum em lembrança.' },
        { t: 26, texto: 'Daqueles que reúnem a família em volta da mesa e fazem qualquer almoço virar festa.' },
        { t: 31, texto: 'Esse homem era conhecido como o Capitão Coração.', estilo: 'destaque' }
      ],
      efeitos: [
        { t: 0,  tipo: 'estrelas', valor: 0 },
        { t: 1,  tipo: 'gaivotas', valor: 2 },
        { t: 0,  tipo: 'ilha', valor: 1 },
        { t: 0,  tipo: 'fumaca', valor: 1 }
      ],
      som: [
        { t: 0,  acorde: 'F', ondas: 0.35, vento: 0.15 },
        { t: 3,  passaros: 1 },
        { t: 10, gaivota: 1 },
        { t: 17, passaros: 1 }
      ]
    },

    /* ───── Cena 2 — O navio valente ───── */
    {
      id: 'navio-valente',
      titulo: 'O navio valente',
      capitulo: 2,
      dur: 34,
      navio: { de: 1150, ate: 1380, escala: 1 },
      camera: [
        { t: 0,  box: [520, 250, 1600, 900], easing: 'easeInOutQuad' },
        { t: 34, box: [880, 380, 1000, 563] }
      ],
      ceu: [ { t: 0, tema: 'amanhecer' }, { t: 10, tema: 'manha' } ],
      beats: [
        { t: 2,  texto: 'O Capitão tinha um navio muito especial.' },
        { t: 8,  texto: 'Já havia passado por uma grande reforma, anos atrás…' },
        { t: 13, texto: '…e desde então seguia cruzando mares diferentes: ondas fortes, tempestades e dias de sol.' },
        { t: 21, texto: 'Os mecânicos do porto sempre repetiam a mesma coisa:' },
        { t: 26, texto: '— Capitão, esse navio é valente. Mas, para navegar por muitos anos ainda, ele precisa de combustível melhor, mais descanso e menos tempestades.', estilo: 'fala' }
      ],
      efeitos: [
        { t: 9,  tipo: 'varredura' },
        { t: 0,  tipo: 'boia', valor: 1 },
        { t: 21, tipo: 'vibracao', valor: 2 },
        { t: 26, tipo: 'fumaca', valor: 1.8 }
      ],
      som: [
        { t: 0,  acorde: 'C', ondas: 0.40, vento: 0.12, motor: 0.12 },
        { t: 16, sino: 1 },
        { t: 24, sino: 1 }
      ]
    },

    /* ───── Cena 3 — A viagem do jeito dele ───── */
    {
      id: 'jeito-dele',
      titulo: 'A viagem do jeito dele',
      capitulo: 3,
      dur: 32,
      navio: { de: 1380, ate: 2200, escala: 1, afunda: 16, incl: 3 },
      camera: [
        { t: 0,  box: [880, 380, 1000, 563], easing: 'linear' },
        { t: 32, box: [1560, 300, 1500, 844] }
      ],
      ceu: [ { t: 0, tema: 'manha' }, { t: 8, tema: 'meiodia' }, { t: 16, tema: 'meiodia' }, { t: 24, tema: 'tempestade' } ],
      beats: [
        { t: 2,  texto: 'O Capitão ouvia… sorria… fazia uma piada… e seguia viagem do mesmo jeito.' },
        { t: 10, texto: 'Às vezes colocava combustível demais, daqueles que deixam o navio pesado.' },
        { t: 17, texto: 'Às vezes exagerava na bebida da festa.' },
        { t: 23, texto: 'E muitas vezes esquecia de dar ao motor o descanso que ele tanto precisava.' }
      ],
      efeitos: [
        { t: 0,  tipo: 'ondas', amplitude: 18 },
        { t: 21, tipo: 'ondas', amplitude: 42 },
        { t: 0,  tipo: 'tremor', valor: 4 },
        { t: 0,  tipo: 'respingos', valor: 1 },
        { t: 21, tipo: 'chuva', valor: 0.6 },
        { t: 23, tipo: 'engasgo' },
        { t: 24, tipo: 'relampago' },
        { t: 29, tipo: 'relampago', duplo: true }
      ],
      som: [
        { t: 0,  acorde: 'Dm', ondas: 0.45, vento: 0.15, motor: 0.16 },
        { t: 20, ondas: 0.58, vento: 0.35, motor: 0.20, chuva: 0.35 },
        { t: 24.5, trovao: 0.7 },
        { t: 29.4, trovao: 1 }
      ]
    },

    /* ───── Cena 4 — A neblina e o compasso ───── */
    {
      id: 'neblina',
      titulo: 'A neblina e o compasso',
      capitulo: 4,
      dur: 38,
      navio: { de: 2200, ate: 2760, escala: 1, incl: 1 },
      camera: [
        { t: 0,  box: [1560, 300, 1500, 844], easing: 'easeInOutCubic' },
        { t: 14, box: [2000, 340, 1400, 788] },
        { t: 16, box: [2260, 520, 420, 236], easing: 'easeInOutCubic' },
        { t: 22, box: [2260, 520, 420, 236] },
        { t: 25, box: [2100, 330, 1350, 760], easing: 'easeInOutCubic' },
        { t: 38, box: [2180, 330, 1350, 760] }
      ],
      ceu: [ { t: 0, tema: 'tempestade' }, { t: 10, tema: 'neblina' } ],
      beats: [
        { t: 2,  texto: 'Até que, em certo momento, o navio pediu uma pausa.' },
        { t: 8,  texto: 'Primeiro veio uma neblina que apagou o horizonte.' },
        { t: 15, texto: 'Depois o motor perdeu o compasso — e lembrou ao Capitão que até as máquinas mais fortes precisam de manutenção.' },
        { t: 24, texto: 'Foi preciso atracar por alguns dias, para que tudo fosse cuidado com calma.' },
        { t: 31, texto: 'Uma pausa importante. Até os navios mais resistentes precisam de cuidado.' }
      ],
      efeitos: [
        { t: 0,  tipo: 'chuva', valor: 0.6 },
        { t: 2,  tipo: 'relampago' },
        { t: 5,  tipo: 'chuva', valor: 0 },
        { t: 4,  tipo: 'ondas', amplitude: 16 },
        { t: 6,  tipo: 'neblina', valor: 0.62 },
        { t: 6,  tipo: 'saturacao', valor: 0.4 },
        { t: 15, tipo: 'bussola', valor: 1 },
        { t: 15, tipo: 'motorFalha' },
        { t: 18, tipo: 'pulsoVinheta', vezes: 2 },
        { t: 10, tipo: 'farol', valor: 1 },
        { t: 15, tipo: 'fumaca', valor: 0 },
        { t: 22, tipo: 'bussola', valor: 0 }
      ],
      som: [
        { t: 0,  acorde: 'Am2', ondas: 0.58, vento: 0.40, motor: 0.20, chuva: 0.35 },
        { t: 2.4, trovao: 0.55 },
        { t: 6,  chuva: 0 },
        { t: 10, ondas: 0.20, vento: 0.30, motor: 0.10, abafado: 1 },
        { t: 16, motor: 0.00 },
        { t: 20, sino: 1 },
        { t: 28, sino: 1 }
      ]
    },

    /* ───── Cena 5 — O porto cheio de amor ───── */
    {
      id: 'porto-amor',
      titulo: 'O porto cheio de amor',
      capitulo: 5,
      dur: 36,
      navio: { de: 2760, ate: 3230, escala: 1, easing: 'easeOutCubic' },
      camera: [
        { t: 0,  box: [2180, 330, 1350, 760], easing: 'easeOutCubic' },
        { t: 36, box: [2900, 250, 1700, 956] }
      ],
      ceu: [ { t: 0, tema: 'neblina' }, { t: 6, tema: 'tarde' } ],
      beats: [
        { t: 2,  texto: 'Quando o Capitão voltou para casa, encontrou o porto cheio de amor.' },
        { t: 9,  texto: 'Estava lá sua esposa, que faz tudo por ele e nunca sai do seu lado.' },
        { t: 16, texto: 'Estavam lá seus quatro filhos.' },
        { t: 21, texto: 'Estavam lá suas três noras.' },
        { t: 26, texto: 'Estavam lá seus dois netos.' },
        { t: 30, texto: 'E estava lá uma família inteira que o ama profundamente.', estilo: 'destaque' }
      ],
      efeitos: [
        { t: 3,  tipo: 'neblina', valor: 0 },
        { t: 3,  tipo: 'saturacao', valor: 1 },
        { t: 5,  tipo: 'fumaca', valor: 1 },
        { t: 6,  tipo: 'ilha', valor: 1 },
        { t: 7,  tipo: 'lanternas', valor: 1 },
        { t: 9,  tipo: 'familia', grupo: 'esposa' },
        { t: 16, tipo: 'familia', grupo: 'filhos' },
        { t: 21, tipo: 'familia', grupo: 'noras' },
        { t: 26, tipo: 'familia', grupo: 'netos' },
        { t: 30, tipo: 'coracoes', valor: 1 },
        { t: 2,  tipo: 'gaivotas', valor: 3 }
      ],
      som: [
        { t: 0,  acorde: 'F', ondas: 0.25, vento: 0.25 },
        { t: 6,  acorde: 'C', passaros: 1 },
        { t: 8,  ondas: 0.40, vento: 0.10 },
        { t: 12, gaivota: 1 },
        { t: 30, sino: 1 }
      ]
    },

    /* ───── Cena 6 — O pedido da família ───── */
    {
      id: 'pedido',
      titulo: 'O pedido da família',
      capitulo: 6,
      dur: 32,
      navio: { de: 3230, ate: 3260, escala: 1, atracado: true },
      camera: [
        { t: 0,  box: [2900, 250, 1700, 956], easing: 'easeInOutQuad' },
        { t: 32, box: [3170, 372, 1100, 619] }
      ],
      ceu: [ { t: 0, tema: 'tarde' }, { t: 24, tema: 'pordosol' } ],
      beats: [
        { t: 2,  texto: 'Ninguém ali queria ver o Capitão correndo sem parar, gastando todas as forças.' },
        { t: 10, texto: 'Todo mundo queria uma coisa só: que ele continue navegando por muitos e muitos anos.' },
        { t: 18, texto: 'Por isso, a família fez um pedido:' },
        { t: 23, texto: '“Pai, agora é hora de cuidar do seu navio com o mesmo carinho com que você sempre cuidou de todo mundo.”', estilo: 'balao' }
      ],
      efeitos: [
        { t: 0,  tipo: 'acalmar', valor: 1 },
        { t: 6,  tipo: 'amarras', valor: 1 },
        { t: 0,  tipo: 'fumaca', valor: 0.4 }
      ],
      som: [ { t: 0, acorde: 'Dm7', ondas: 0.30, vento: 0.10 }, { t: 23, nota: 1 } ]
    },

    /* ───── Cena 7 — O mapa do bom cuidado ───── */
    {
      id: 'mapa',
      titulo: 'O mapa do bom cuidado',
      capitulo: 7,
      dur: 36,
      navio: { de: 3260, ate: 3300, escala: 1, atracado: true },
      camera: [
        { t: 0,  box: [3170, 372, 1100, 619], easing: 'easeInOutCubic', giro: 0 },
        { t: 36, box: [2875, 330, 1750, 984], giro: 2 }
      ],
      ceu: [ { t: 0, tema: 'pordosol' } ],
      beats: [
        { t: 3,  texto: '“Dormir um pouco mais não é fraqueza. É reparo.”', estilo: 'conselho' },
        { t: 10, texto: '“Comer melhor é combustível de qualidade.”', estilo: 'conselho' },
        { t: 16, texto: '“Diminuir a bebida é aliviar o peso da viagem.”', estilo: 'conselho' },
        { t: 22, texto: '“Escutar os médicos é ouvir quem entende do mapa.”', estilo: 'conselho' },
        { t: 29, texto: '“Se cuidar é uma forma de continuar com a gente.”', estilo: 'conselho' }
      ],
      efeitos: [
        { t: 1,  tipo: 'mapa', valor: 1 },
        { t: 3,  tipo: 'marco', indice: 0 },
        { t: 10, tipo: 'marco', indice: 1 },
        { t: 16, tipo: 'marco', indice: 2 },
        { t: 22, tipo: 'marco', indice: 3 },
        { t: 29, tipo: 'marco', indice: 4 }
      ],
      som: [ { t: 0, acorde: 'Bb', ondas: 0.30, vento: 0.10 }, { t: 29, sino: 1 } ]
    },

    /* ───── Cena 8 — Continue sendo você ───── */
    {
      id: 'continue',
      titulo: 'Continue sendo você',
      capitulo: 8,
      dur: 34,
      navio: { de: 3300, ate: 3320, escala: 1, atracado: true },
      camera: [
        { t: 0,  box: [2875, 330, 1750, 984], easing: 'easeInOutCubic', giro: 2 },
        { t: 34, box: [2845, 60, 1750, 984], giro: 0 }
      ],
      ceu: [ { t: 0, tema: 'pordosol' }, { t: 10, tema: 'crepusculo' }, { t: 28, tema: 'porto' } ],
      beats: [
        { t: 2,  texto: 'No fim das contas, o pedido não é para que ele mude quem é.' },
        { t: 8,  texto: 'Continue fazendo piadas.' },
        { t: 12, texto: 'Continue puxando conversa com desconhecidos.' },
        { t: 16, texto: 'Continue fazendo amigos por onde passar.' },
        { t: 20, texto: 'Continue reunindo a família e enchendo a casa de risadas.' },
        { t: 27, texto: 'Só queremos que você faça tudo isso… por muitos e muitos anos.', estilo: 'destaque' }
      ],
      efeitos: [
        { t: 1,  tipo: 'mapa', valor: 0 },
        { t: 8,  tipo: 'risada', indice: 0 },
        { t: 12, tipo: 'risada', indice: 1 },
        { t: 16, tipo: 'risada', indice: 2 },
        { t: 20, tipo: 'risada', indice: 3 },
        { t: 12, tipo: 'estrelas', valor: 1 },
        { t: 26, tipo: 'constelacao', valor: 1 },
        { t: 10, tipo: 'reflexos', valor: 1 }
      ],
      som: [
        { t: 0,  acorde: 'Am7', ondas: 0.25, vento: 0.20 },
        { t: 20, acorde: 'F' },
        { t: 27, sino: 1 }
      ]
    },

    /* ───── Cena 9 — Só existe um Capitão Coração ───── */
    {
      id: 'capitao',
      titulo: 'Só existe um Capitão Coração',
      capitulo: 9,
      dur: 40,
      navio: { de: 3320, ate: 3340, escala: 1, atracado: true },
      camera: [
        { t: 0,  box: [2845, 60, 1750, 984], easing: 'easeInOutCubic' },
        { t: 32, box: [2700, 120, 2000, 1125] },
        { t: 40, box: [2700, 120, 2000, 1125] }
      ],
      ceu: [ { t: 0, tema: 'porto' }, { t: 32, tema: 'porto' }, { t: 40, tema: 'alvorada' } ],
      beats: [
        { t: 2,  texto: 'Você transforma lugares em encontros.' },
        { t: 7,  texto: 'Você transforma conhecidos em amigos.' },
        { t: 12, texto: 'Você transforma momentos comuns em lembranças que ficam para sempre.' },
        { t: 19, texto: 'Porque o seu coração não bate só dentro do seu peito.' },
        { t: 24, texto: 'Ele bate um pouquinho dentro de cada um de nós.' },
        { t: 30, texto: 'O mundo tem muita gente comum. Mas só existe um Capitão Coração.', estilo: 'destaque' },
        { t: 35, texto: 'E a gente ainda precisa dele navegando ao nosso lado por muitos e muitos anos.' }
      ],
      efeitos: [
        { t: 0,  tipo: 'constelacao', valor: 1 },
        { t: 19, tipo: 'batimento', valor: 1 },
        { t: 19, tipo: 'ondaLuz', valor: 1 },
        { t: 34, tipo: 'estrelas', valor: 0.2 }
      ],
      som: [
        { t: 0,  acorde: 'C', ondas: 0.25, vento: 0.12 },
        { t: 19, batimento: 0.25 },
        { t: 34, acorde: 'G', passaros: 1 },
        { t: 36, ondas: 0.15, vento: 0.06 }
      ]
    },

    /* ───── Cena 10 — Epílogo ───── */
    {
      id: 'epilogo',
      titulo: 'O porto do amor',
      dur: 14,
      final: true,
      navio: { de: 3340, ate: 3340, escala: 1, atracado: true },
      camera: [
        { t: 0,  box: [2700, 120, 2000, 1125], easing: 'linear' },
        { t: 14, box: [2710, 126, 1980, 1114] }
      ],
      ceu: [ { t: 0, tema: 'alvorada' } ],
      beats: [
        { t: 2, texto: 'Chegamos ao porto do amor.', estilo: 'titulo' },
        { t: 6, texto: 'Com todo o amor, sua esposa, seus quatro filhos, suas três noras e seus dois netos.' }
      ],
      efeitos: [
        { t: 0, tipo: 'batimento', valor: 0.5 },
        { t: 0, tipo: 'lanternas', valor: 1 }
      ],
      som: [ { t: 0, acorde: 'F', ondas: 0.15, vento: 0.05, batimento: 0 }, { t: 1, passaros: 1 } ]
    }
  ];

  window.CAPITAO_ROTEIRO = {
    titulo: 'O Capitão Coração',
    subtitulo: 'O Filme',
    assinatura: 'Com todo o amor, sua esposa, seus quatro filhos, suas três noras e seus dois netos.',
    temas: TEMAS,
    mundo: MUNDO,
    cenas: cenas,
    duracaoTotal: cenas.reduce(function (s, c) { return s + c.dur; }, 0)
  };
})();
