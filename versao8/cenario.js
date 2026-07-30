/* =========================================================
 *  Versão 8 — O Filme
 *  cenario.js — geradores e animação procedural do mundo SVG
 *
 *  Responsável por tudo que "vive" na tela: ondas, estrelas,
 *  nuvens, gaivotas, fumaça, respingos, família, lanternas,
 *  constelação, mapa e bússola.
 *
 *  API:
 *    Cenario.init()                 monta os elementos gerados
 *    Cenario.quadro(t, dt, ctx)     anima um quadro
 *    Cenario.efeito(ev, cenaT)      aplica um efeito do roteiro
 *    Cenario.reset()                volta ao estado inicial
 *    Cenario.navio(x, escala)       posiciona o navio no mundo
 * ========================================================= */
window.Cenario = (function () {
  'use strict';

  var SVGNS = 'http://www.w3.org/2000/svg';
  var R = window.CAPITAO_ROTEIRO;
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* limites horizontais do mar desenhado */
  var X0 = -1200, X1 = 5600, PASSO = 90;

  function el(id) { return document.getElementById(id); }
  function cria(tag, attrs) {
    var n = document.createElementNS(SVGNS, tag);
    for (var k in attrs) if (attrs.hasOwnProperty(k)) n.setAttribute(k, attrs[k]);
    return n;
  }
  function aleatorio(a, b) { return a + Math.random() * (b - a); }

  /* ── elementos do palco ── */
  var D = {};

  /* ── estado animado ── */
  var st = {
    amplitude: 18, amplitudeAlvo: 18,
    fumaca: 1, fumacaProx: 0,
    respingos: 0, respingoProx: 0,
    chuva: 0, chuvaProx: 0,
    neblina: 0, neblinaAlvo: 0,
    estrelas: 1, estrelasAlvo: 1,
    farol: 0, farolAlvo: 0,
    vibracao: 0, tremor: 0,
    acenando: false, atracado: false,
    batimento: 0, ondaLuz: 0, ondaLuzT: 0,
    navioX: 300, navioEscala: 1, navioAfunda: 0, navioIncl: 1.5,
    bussola: 0, bussolaGiro: 0, bussolaVel: 0,
    mapa: 0, marcos: -1,
    constelacao: 0,
    motorFalha: 0
  };

  var particulas = { fumaca: [], respingos: [], coracoes: [], risadas: [], chuva: [] };
  var nuvens = [], gaivotas = [], estrelasNos = [], reflexos = [];
  var familiaNos = [], constelacaoEstrelas = [], marcosNos = [];
  var ultimoCtx = null;

  /* pontos do coração (constelação) */
  function pontosCoracao(n, cx, cy, escala) {
    var pts = [], i, t, x, y;
    for (i = 0; i < n; i++) {
      t = (i / n) * Math.PI * 2;
      x = 16 * Math.pow(Math.sin(t), 3);
      y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
      pts.push({ x: cx + x * escala, y: cy + y * escala });
    }
    return pts;
  }

  /* ═════════════════ CONSTRUÇÃO ═════════════════ */

  function montarEstrelas() {
    var g = D.estrelas, i, n = 110;
    for (i = 0; i < n; i++) {
      var c = cria('circle', {
        cx: aleatorio(-400, 5200), cy: aleatorio(-140, 620),
        r: aleatorio(2, 5.5), fill: '#ffffff'
      });
      c.style.animation = 'cintila ' + aleatorio(2.2, 6).toFixed(2) + 's ease-in-out ' +
                          (-aleatorio(0, 6)).toFixed(2) + 's infinite';
      g.appendChild(c);
      estrelasNos.push(c);
    }
  }

  function montarNuvens() {
    var g = D.nuvens, i;
    for (i = 0; i < 14; i++) {
      var faixa = i % 3;
      var x = aleatorio(-300, 5200);
      var y = 120 + faixa * 110 + aleatorio(-40, 40);
      var s = 0.7 + faixa * 0.35 + aleatorio(-0.1, 0.1);
      var nv = cria('g', { transform: 'translate(' + x + ' ' + y + ') scale(' + s.toFixed(2) + ')', opacity: 0.75 });
      var partes = [[0, 0, 62], [52, 10, 44], [-50, 12, 40], [22, -26, 42], [-18, -20, 36]];
      partes.forEach(function (p) {
        nv.appendChild(cria('ellipse', { cx: p[0], cy: p[1], rx: p[2], ry: p[2] * 0.66, fill: '#ffffff' }));
      });
      g.appendChild(nv);
      nuvens.push({ no: nv, x: x, y: y, s: s, v: 3 + faixa * 4 });
    }
  }

  function montarGaivotas() {
    var g = D.gaivotas, i;
    for (i = 0; i < 4; i++) {
      var no = cria('path', {
        d: 'M-22,0 q11,-13 22,0 q11,-13 22,0', fill: 'none',
        stroke: '#33424a', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0
      });
      g.appendChild(no);
      gaivotas.push({ no: no, x: aleatorio(0, 4000), y: aleatorio(200, 460), v: aleatorio(30, 60), f: aleatorio(0, 6) });
    }
  }

  function montarLanternas() {
    var g = D.lanternas, i, x;
    for (i = 0; i < 6; i++) {
      x = 3440 + i * 100;
      var lan = cria('g', { transform: 'translate(' + x + ' 612)', opacity: 0 });
      lan.appendChild(cria('rect', { x: -3, y: -70, width: 6, height: 70, fill: '#6b4a2a' }));
      lan.appendChild(cria('circle', { cx: 0, cy: -78, r: 40, fill: 'url(#grad-luz-lanterna)' }));
      lan.appendChild(cria('circle', { cx: 0, cy: -78, r: 10, fill: '#ffd166' }));
      g.appendChild(lan);
      reflexos.push({ no: lan, x: x, fase: aleatorio(0, 6) });

      var rf = cria('rect', { x: x - 7, y: 660, width: 14, height: 220, fill: '#ffc978', opacity: 0 });
      D.reflexos.appendChild(rf);
      reflexos[reflexos.length - 1].agua = rf;
    }
  }

  /* A família no cais, pessoa a pessoa.
     alt = altura relativa · vestido = silhueta de vestido · cabelo = cabelo
     comprido · bebe = proporção de bebê (cabeça grande, corpo curto) */
  var GRUPOS = [
    { grupo: 'esposa', cor: '#e8544a', alt: 1.00, vestido: true,  cabelo: true },

    { grupo: 'filhos', cor: '#2b6ca8', alt: 1.00 },
    { grupo: 'filhos', cor: '#2b6ca8', alt: 0.99 },
    { grupo: 'filhos', cor: '#2f7ab8', alt: 1.01 },
    /* a filha */
    { grupo: 'filhos', cor: '#2aa79b', alt: 0.97, vestido: true,  cabelo: true },

    { grupo: 'noras',  cor: '#c05fa0', alt: 0.96, vestido: true,  cabelo: true },
    { grupo: 'noras',  cor: '#a95fc0', alt: 0.95, vestido: true,  cabelo: true },
    { grupo: 'noras',  cor: '#d16aa8', alt: 0.97, vestido: true,  cabelo: true },

    /* o neto de 18 anos: já do tamanho dos adultos */
    { grupo: 'netos',  cor: '#5aa9e6', alt: 0.99 },
    /* a neta de 1 ano */
    { grupo: 'netos',  cor: '#f0a63c', alt: 0.52, vestido: true, bebe: true }
  ];

  /* desenha uma pessoa (origem nos pés) */
  function desenharPessoa(p, cfg) {
    var cabecaR = cfg.bebe ? 17 : 12;
    var corpoH  = cfg.bebe ? 30 : 44;
    var ombro   = cfg.bebe ? -24 : -40;
    var cabecaY = -(corpoH + cabecaR + (cfg.bebe ? 2 : 0));
    var meio    = cfg.bebe ? 11 : 15;
    var topo    = cfg.bebe ? 8 : 7;
    var alcance = cfg.bebe ? 13 : 20;

    /* corpo: vestido abre na base, calça é reta */
    var base = cfg.vestido ? meio + (cfg.bebe ? 5 : 7) : meio - 2;
    p.appendChild(cria('path', {
      d: 'M' + (-base) + ',0 L' + (-topo) + ',' + corpoH * -1 +
         ' L' + topo + ',' + corpoH * -1 + ' L' + base + ',0 Z',
      fill: cfg.cor
    }));
    /* braço parado */
    p.appendChild(cria('path', {
      d: 'M0,' + ombro + ' L' + (-alcance + 2) + ',' + (ombro + 20),
      stroke: cfg.cor, 'stroke-width': cfg.bebe ? 6 : 8, 'stroke-linecap': 'round', fill: 'none'
    }));
    /* braço que acena */
    var braco = cria('g', { class: 'braco', transform: 'translate(0 ' + ombro + ')' });
    braco.appendChild(cria('path', {
      d: 'M0,0 L' + alcance + ',' + (cfg.bebe ? -16 : -24),
      stroke: cfg.cor, 'stroke-width': cfg.bebe ? 6 : 8, 'stroke-linecap': 'round', fill: 'none'
    }));
    p.appendChild(braco);
    /* cabelo comprido por trás (não se aplica ao bebê) */
    if (cfg.cabelo && !cfg.bebe) {
      p.appendChild(cria('path', {
        d: 'M' + (-cabecaR) + ',' + (cabecaY - 2) +
           ' q-' + (cabecaR * 0.5) + ',' + (cabecaR * 1.9) + ' ' + (cabecaR * 0.28) + ',' + (cabecaR * 2.2) +
           ' L' + (cabecaR * 0.72) + ',' + (cabecaY + cabecaR * 2.2) +
           ' q' + (cabecaR * 0.78) + ',-' + (cabecaR * 0.3) + ' ' + (cabecaR * 0.28) + ',-' + (cabecaR * 2.2) + ' Z',
        fill: '#3a2b1e'
      }));
    }
    p.appendChild(cria('circle', { cx: 0, cy: cabecaY, r: cabecaR, fill: '#f5c9a2' }));

    if (cfg.bebe) {
      /* bebê: só um cachinho no alto da cabeça */
      p.appendChild(cria('path', {
        d: 'M-3,' + (cabecaY - cabecaR + 2) + ' q3,-11 9,-4 q-4,-2 -6,3',
        fill: 'none', stroke: '#3a2b1e', 'stroke-width': 4, 'stroke-linecap': 'round'
      }));
    } else {
      /* franja */
      p.appendChild(cria('path', {
        d: 'M' + (-cabecaR) + ',' + (cabecaY - cabecaR * 0.34) +
           ' q' + cabecaR + ',-' + (cabecaR * 1.2) + ' ' + (cabecaR * 2) + ',0' +
           ' q-' + cabecaR + ',-' + (cabecaR * 0.6) + ' -' + (cabecaR * 2) + ',0 Z',
        fill: '#3a2b1e'
      }));
    }
    return braco;
  }

  function montarFamilia() {
    var g = D.familia, x = 3452, i;
    for (i = 0; i < GRUPOS.length; i++) {
      var cfg = GRUPOS[i];
      /* o grupo externo guarda a posição no mundo; o interno recebe a
         animação CSS (transform do CSS sobrescreveria o atributo) */
      var p = cria('g', {
        class: 'pessoa', 'data-grupo': cfg.grupo,
        transform: 'translate(' + x + ' 612) scale(' + cfg.alt + ')', opacity: 0
      });
      var corpo = cria('g', { class: 'corpo' });
      var braco = desenharPessoa(corpo, cfg);
      p.appendChild(corpo);
      g.appendChild(p);
      familiaNos.push({
        no: p, corpo: corpo, braco: braco, grupo: cfg.grupo,
        ombro: cfg.bebe ? -24 : -40, ritmo: cfg.bebe ? 4.2 : 3.1,
        amplitude: cfg.bebe ? 34 : 26, fase: aleatorio(0, 6), visivel: false
      });
      x += cfg.bebe ? 30 : 40;
    }
  }

  function montarConstelacao() {
    var g = D.constelacao;
    var pts = pontosCoracao(7, 3720, 190, 15);
    var linhas = cria('path', {
      d: 'M' + pts.map(function (p) { return p.x.toFixed(1) + ',' + p.y.toFixed(1); }).join(' L') + ' Z',
      fill: 'none', stroke: '#ffd7e2', 'stroke-width': 3.5, opacity: 0.6
    });
    var comp = 1600;
    linhas.setAttribute('stroke-dasharray', comp);
    linhas.setAttribute('stroke-dashoffset', comp);
    g.appendChild(linhas);
    D.constLinhas = linhas;
    pts.forEach(function (p) {
      var e = cria('circle', { cx: p.x, cy: p.y, r: 13, fill: '#fff0f4', filter: 'url(#f-brilho)', opacity: 0 });
      g.appendChild(e);
      constelacaoEstrelas.push({ no: e, x: p.x, y: p.y });
    });
  }

  function montarMarcos() {
    var rota = el('mapa-rota'), comp = rota.getTotalLength(), i;
    for (i = 0; i < 5; i++) {
      var pt = rota.getPointAtLength((comp * (i + 0.5)) / 5);
      var m = cria('g', { transform: 'translate(' + pt.x.toFixed(1) + ' ' + pt.y.toFixed(1) + ')', opacity: 0 });
      var interno = cria('g', { class: 'corpo' });
      interno.appendChild(cria('circle', { r: 20, fill: '#c0563f' }));
      interno.appendChild(cria('circle', { r: 11, fill: '#f4e6c6' }));
      m.appendChild(interno);
      D.mapaMarcos.appendChild(m);
      marcosNos.push({ no: m, corpo: interno, x: pt.x });
    }
  }

  /* ═════════════════ ONDAS ═════════════════ */

  function pathOnda(base, amp, comp, fase) {
    var d = 'M' + X0 + ',1900 L' + X0 + ',' + base.toFixed(1), x;
    for (x = X0; x <= X1; x += PASSO) {
      d += ' L' + x + ',' + (base + amp * Math.sin(x / comp + fase)).toFixed(1);
    }
    return d + ' L' + X1 + ',1900 Z';
  }

  function atualizarOndas(t) {
    var a = st.amplitude;
    D.ondaFundo.setAttribute('d',  pathOnda(672, a * 0.45, 420, t * 0.30));
    D.ondaMedio.setAttribute('d',  pathOnda(716, a * 0.80, 300, -t * 0.52 + 1.4));
    D.ondaFrente.setAttribute('d', pathOnda(806, a * 1.15, 230, t * 0.78 + 2.6));
    D.ondaFrente2.setAttribute('d', pathOnda(900, a * 1.45, 180, -t * 1.05 + 0.7));
  }

  /* ═════════════════ PARTÍCULAS ═════════════════ */

  function novaParticula(grupo, no, dados) {
    D[grupo].appendChild(no);
    dados.no = no;
    particulas[grupo].push(dados);
  }

  function passoParticulas(dt) {
    ['fumaca', 'respingos', 'coracoes', 'risadas', 'chuva'].forEach(function (nome) {
      var lista = particulas[nome], i, p;
      for (i = lista.length - 1; i >= 0; i--) {
        p = lista[i];
        p.vida += dt;
        var k = p.vida / p.total;
        if (k >= 1) { p.no.remove(); lista.splice(i, 1); continue; }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.g) p.vy += p.g * dt;
        var s = p.s0 + (p.s1 - p.s0) * k;
        p.no.setAttribute('transform', 'translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ') scale(' + s.toFixed(3) + ')');
        p.no.setAttribute('opacity', (p.o0 + (p.o1 - p.o0) * k).toFixed(3));
      }
    });
  }

  function soltarFumaca(escura) {
    var g = cria('g', {});
    g.appendChild(cria('circle', { r: 16, fill: escura ? '#4a4a4a' : '#e9eef2' }));
    novaParticula('fumaca', g, {
      x: 33 * st.navioEscala, y: -168 * st.navioEscala,
      vx: -26, vy: -34, s0: 0.5, s1: 2.3, o0: 0.55, o1: 0, vida: 0, total: 3.6
    });
  }

  function soltarRespingo() {
    var g = cria('g', {});
    g.appendChild(cria('circle', { r: 7, fill: '#ffffff' }));
    novaParticula('respingos', g, {
      x: 150 * st.navioEscala, y: 6, vx: aleatorio(30, 90), vy: aleatorio(-90, -40), g: 190,
      s0: 1, s1: 0.4, o0: 0.85, o1: 0, vida: 0, total: 1.1
    });
  }

  function soltarCoracao() {
    var g = cria('g', {});
    g.appendChild(cria('path', {
      d: 'M0,6 c-8,-9 -20,-15 -20,-26 c0,-8 7,-13 13,-13 c4,0 7,2 7,6 c0,-4 3,-6 7,-6 c6,0 13,5 13,13 c0,11 -12,17 -20,26 Z',
      fill: '#ff6b8a'
    }));
    novaParticula('coracoes', g, {
      x: aleatorio(3460, 3940), y: 600, vx: aleatorio(-14, 14), vy: -52,
      s0: 0.4, s1: 1.5, o0: 0.9, o1: 0, vida: 0, total: 4.2
    });
  }

  function soltarChuva() {
    if (!ultimoCtx) return;
    var g = cria('g', {});
    g.appendChild(cria('line', {
      x1: 0, y1: 0, x2: -9, y2: 34,
      stroke: '#cfe4f0', 'stroke-width': 3, 'stroke-linecap': 'round'
    }));
    novaParticula('chuva', g, {
      x: ultimoCtx.camX + aleatorio(-150, ultimoCtx.camW + 150),
      y: ultimoCtx.camY - 60,
      vx: -170, vy: 900, s0: 1, s1: 1, o0: 0.55, o1: 0.35,
      vida: 0, total: (ultimoCtx.camH + 200) / 900
    });
  }

  /* uma risada que sobe do cais e vira estrela */  function soltarRisada(indice) {
    var alvo = constelacaoEstrelas[indice % constelacaoEstrelas.length];
    var g = cria('g', {});
    g.appendChild(cria('circle', { r: 8, fill: '#fff3c4', filter: 'url(#f-brilho)' }));
    var x0 = 3560 + indice * 60, y0 = 590;
    var dur = 2.6;
    novaParticula('risadas', g, {
      x: x0, y: y0, vx: (alvo.x - x0) / dur, vy: (alvo.y - y0) / dur,
      s0: 0.5, s1: 1.4, o0: 0.95, o1: 0.2, vida: 0, total: dur, fixa: alvo
    });
    setTimeout(function () { alvo.no.setAttribute('opacity', 1); }, dur * 1000);
  }

  /* ═════════════════ QUADRO ═════════════════ */

  function suavizar(atual, alvo, dt, vel) {
    var k = 1 - Math.exp(-vel * dt);
    return atual + (alvo - atual) * k;
  }

  function quadro(t, dt, ctx) {
    ultimoCtx = ctx;
    /* transições suaves de estado */
    st.amplitude  = suavizar(st.amplitude,  st.amplitudeAlvo,  dt, 1.2);
    st.neblina    = suavizar(st.neblina,    st.neblinaAlvo,    dt, 0.55);
    st.estrelas   = suavizar(st.estrelas,   st.estrelasAlvo,   dt, 0.8);
    st.farol      = suavizar(st.farol,      st.farolAlvo,      dt, 0.8);

    if (!reduzido) atualizarOndas(t);

    /* ── navio ── */
    var balanco = reduzido ? 0 : Math.sin(t * 1.55) * 10 * (st.atracado ? 0.28 : 1);
    var incl = reduzido ? 0 : Math.sin(t * 1.15 + 0.6) * st.navioIncl * (st.atracado ? 0.25 : 1);
    var vib = st.vibracao > 0 && !reduzido ? Math.sin(t * 62) * st.vibracao : 0;
    D.navioPos.setAttribute('transform', 'translate(' + st.navioX.toFixed(1) + ' ' + (650 + st.navioAfunda).toFixed(1) + ')');
    D.navioBalanco.setAttribute('transform',
      'translate(' + vib.toFixed(2) + ' ' + balanco.toFixed(2) + ') rotate(' + incl.toFixed(2) + ')');
    D.navio.setAttribute('transform', 'scale(' + st.navioEscala + ')');

    /* fumaça */
    if (st.fumaca > 0 && !reduzido) {
      st.fumacaProx -= dt * st.fumaca;
      if (st.fumacaProx <= 0) { soltarFumaca(st.motorFalha > 0); st.fumacaProx = 2.2 / Math.max(0.2, st.fumaca); }
    }
    /* respingos */
    if (st.respingos > 0 && !reduzido && !st.atracado) {
      st.respingoProx -= dt;
      if (st.respingoProx <= 0) { soltarRespingo(); st.respingoProx = aleatorio(0.18, 0.5); }
    }
    /* chuva */
    if (st.chuva > 0 && !reduzido) {
      st.chuvaProx -= dt;
      while (st.chuvaProx <= 0) {
        soltarChuva();
        st.chuvaProx += 0.028 / Math.max(0.1, st.chuva);
      }
    }
    passoParticulas(dt);

    /* ── nuvens ── */
    if (!reduzido) {
      nuvens.forEach(function (n) {
        n.x -= n.v * dt;
        if (n.x < X0) n.x = X1;
        n.no.setAttribute('transform', 'translate(' + n.x.toFixed(1) + ' ' + n.y + ') scale(' + n.s.toFixed(2) + ')');
      });
    }

    /* ── gaivotas ── */
    gaivotas.forEach(function (g, i) {
      if (g.ativa) {
        g.x += g.v * dt;
        if (g.x > (ctx.camX + ctx.camW + 400)) g.x = ctx.camX - 400;
        var asa = reduzido ? 0 : Math.sin(t * 6 + g.f) * 6;
        g.no.setAttribute('transform',
          'translate(' + g.x.toFixed(1) + ' ' + (g.y + Math.sin(t * 0.7 + i) * 14).toFixed(1) + ')');
        g.no.setAttribute('d', 'M-22,0 q11,' + (-13 - asa).toFixed(1) + ' 22,0 q11,' + (-13 - asa).toFixed(1) + ' 22,0');
        g.no.setAttribute('opacity', 0.85);
      } else {
        g.no.setAttribute('opacity', 0);
      }
    });

    /* ── estrelas / céu noturno ── */
    D.estrelas.setAttribute('opacity', st.estrelas.toFixed(3));
    D.viaLactea.setAttribute('opacity', (st.estrelas * 0.9).toFixed(3));

    /* ── neblina ── */
    D.neblina.setAttribute('opacity', st.neblina.toFixed(3));
    if (st.neblina > 0.01 && !reduzido) {
      D.neblina.setAttribute('transform', 'translate(' + (Math.sin(t * 0.12) * 90).toFixed(1) + ' ' + (Math.sin(t * 0.19) * 16).toFixed(1) + ')');
    }

    /* ── farol ── */
    D.farol.setAttribute('opacity', st.farol.toFixed(3));
    /* o feixe só aparece quando a torre está (quase) em quadro */
    var faroX = 2500, dentro = ctx
      ? (faroX > ctx.camX - 200 && faroX < ctx.camX + ctx.camW + 200) : true;
    D.farolFeixe.setAttribute('opacity', (st.farol * (dentro ? 0.75 : 0)).toFixed(3));
    if (!reduzido) {
      D.farolFeixe.setAttribute('transform', 'translate(2500 352) rotate(' + ((t * 30) % 360).toFixed(1) + ')');
    }

    /* ── bússola ── */
    if (st.bussola > 0) {
      st.bussolaVel = Math.max(0, st.bussolaVel - dt * 190);
      st.bussolaGiro += st.bussolaVel * dt;
      var oscila = st.bussolaVel < 12 ? Math.sin(t * 7) * 9 * (st.bussolaVel / 12 + 0.15) : 0;
      D.bussolaAgulha.setAttribute('transform', 'rotate(' + (st.bussolaGiro + oscila).toFixed(1) + ')');
    }
    D.bussola.setAttribute('opacity', st.bussola.toFixed(3));

    /* ── família acenando ── */
    familiaNos.forEach(function (p) {
      if (!p.visivel) return;
      var a = reduzido ? 0 : Math.sin(t * p.ritmo + p.fase) * p.amplitude;
      p.braco.setAttribute('transform', 'translate(0 ' + p.ombro + ') rotate(' + a.toFixed(1) + ')');
    });

    /* ── lanternas e reflexos ── */
    reflexos.forEach(function (r) {
      if (!r.aceso) return;
      var brilho = 0.55 + Math.sin(t * 1.7 + r.fase) * 0.2;
      r.no.setAttribute('opacity', Math.min(1, brilho + 0.35).toFixed(3));
      r.agua.setAttribute('opacity', (brilho * 0.35).toFixed(3));
      r.agua.setAttribute('height', (190 + Math.sin(t * 2.3 + r.fase) * 34).toFixed(0));
    });

    /* ── constelação e batimento ── */
    if (st.constelacao > 0) {
      D.constelacao.setAttribute('opacity', st.constelacao.toFixed(3));
      var pulso = 1;
      if (st.batimento > 0) {
        var fase = (t % 1.1) / 1.1;
        pulso = 1 + (fase < 0.16 ? Math.sin(fase / 0.16 * Math.PI) * 0.12 : 0) * st.batimento;
      }
      D.constelacao.setAttribute('transform',
        'translate(3720 190) scale(' + pulso.toFixed(4) + ') translate(-3720 -190)');
    }

    /* onda de luz do batimento */
    if (st.ondaLuz > 0) {
      st.ondaLuzT += dt;
      if (st.ondaLuzT > 1.1) st.ondaLuzT = 0;
      var k = st.ondaLuzT / 1.1;
      D.ondaLuz.setAttribute('r', (60 + k * 900).toFixed(0));
      D.ondaLuz.setAttribute('opacity', ((1 - k) * 0.5 * st.ondaLuz).toFixed(3));
    }

    /* batimento também nas silhuetas */
    if (st.batimento > 0 && !reduzido) {
      var fase2 = ((t + 0.25) % 1.1) / 1.1;
      var e = 1 + (fase2 < 0.16 ? Math.sin(fase2 / 0.16 * Math.PI) * 0.06 : 0);
      D.familia.setAttribute('transform', 'translate(3700 612) scale(' + e.toFixed(4) + ') translate(-3700 -612)');
    }

    /* rastro do astro na água */
    var ax = parseFloat(D.astro.dataset.x || 400);
    D.rastroAstro.setAttribute('d',
      'M' + (ax - 26) + ',652 L' + (ax + 26) + ',652 L' + (ax + 190) + ',1500 L' + (ax - 190) + ',1500 Z');
  }

  /* ═════════════════ EFEITOS DO ROTEIRO ═════════════════ */

  function efeito(ev) {
    switch (ev.tipo) {
      case 'estrelas':   st.estrelasAlvo = ev.valor; break;
      case 'neblina':    st.neblinaAlvo = ev.valor; break;
      case 'farol':      st.farolAlvo = ev.valor; break;
      case 'fumaca':     st.fumaca = ev.valor; break;
      case 'respingos':  st.respingos = ev.valor; break;
      case 'chuva':      st.chuva = ev.valor; break;
      case 'relampago':  relampago(ev.duplo); break;
      case 'vibracao':   st.vibracao = ev.valor; break;
      case 'tremor':     st.tremor = ev.valor; break;
      case 'ondas':      st.amplitudeAlvo = ev.amplitude; break;
      case 'saturacao':  document.documentElement.style.setProperty('--saturacao', ev.valor); break;

      case 'ilha':       D.ilha.setAttribute('opacity', ev.valor); break;
      case 'boia':       D.boia.setAttribute('opacity', ev.valor); break;

      case 'cadente':    estrelaCadente(); break;
      case 'varredura':  varreduraCasco(); break;

      case 'motorFalha':
        st.motorFalha = 1; st.vibracao = 3;
        setTimeout(function () { st.vibracao = 0; st.fumaca = 0; }, 2600);
        break;

      case 'engasgo':
        st.motorFalha = 1;
        setTimeout(function () { st.motorFalha = 0; }, 2200);
        break;

      case 'bussola':
        st.bussola = ev.valor;
        if (ev.valor) { st.bussolaVel = 900; st.bussolaGiro = 0; }
        break;

      case 'pulsoVinheta': pulsarVinheta(ev.vezes || 1); break;

      case 'lanternas':
        D.porto.setAttribute('opacity', 1);
        D.molhe.setAttribute('opacity', 1);
        reflexos.forEach(function (r, i) {
          setTimeout(function () { r.aceso = true; }, i * 260);
        });
        break;

      case 'familia':
        D.porto.setAttribute('opacity', 1);
        familiaNos.filter(function (p) { return p.grupo === ev.grupo; })
          .forEach(function (p, i) {
            setTimeout(function () {
              p.visivel = true;
              p.no.setAttribute('opacity', 1);
              p.corpo.classList.add('entra');
            }, i * 220);
          });
        break;

      case 'coracoes':
        var n = 0, timer = setInterval(function () {
          soltarCoracao();
          if (++n > 14) clearInterval(timer);
        }, 420);
        break;

      case 'gaivotas':
        gaivotas.forEach(function (g, i) { g.ativa = i < ev.valor; });
        break;

      case 'acalmar':   st.atracado = true; break;
      case 'amarras':   D.amarras.setAttribute('opacity', ev.valor); break;

      case 'mapa':
        st.mapa = ev.valor;
        D.mapa.classList.toggle('visivel', !!ev.valor);
        D.mapa.setAttribute('opacity', ev.valor);
        if (!ev.valor) {
          D.clipRota.setAttribute('width', 0);
          marcosNos.forEach(function (m) { m.no.setAttribute('opacity', 0); });
        }
        break;

      case 'marco':
        var m = marcosNos[ev.indice];
        if (m) {
          m.no.setAttribute('opacity', 1);
          m.corpo.classList.add('entra');
          D.clipRota.setAttribute('width', Math.max(0, m.x + 620));
        }
        break;

      case 'risada':      soltarRisada(ev.indice); break;
      case 'constelacao':
        st.constelacao = ev.valor;
        D.constelacao.setAttribute('opacity', ev.valor);
        constelacaoEstrelas.forEach(function (e, i) {
          setTimeout(function () { e.no.setAttribute('opacity', ev.valor); }, i * 90);
        });
        D.constLinhas.style.transition = 'stroke-dashoffset 2.4s ease';
        D.constLinhas.setAttribute('stroke-dashoffset', ev.valor ? 0 : 1600);
        break;

      case 'batimento':   st.batimento = ev.valor; break;
      case 'ondaLuz':     st.ondaLuz = ev.valor; st.ondaLuzT = 0; break;
      case 'reflexos':    reflexos.forEach(function (r) { r.aceso = true; }); break;
    }
  }

  function estrelaCadente() {
    if (reduzido) return;
    var cx = ultimoCtx ? ultimoCtx.cx : 1000, cw = ultimoCtx ? ultimoCtx.camW : 1600;
    var x = cx + aleatorio(-cw * 0.35, cw * 0.2), y = aleatorio(40, 240);
    var c = D.cadente;
    c.setAttribute('x1', x); c.setAttribute('y1', y);
    c.setAttribute('x2', x); c.setAttribute('y2', y);
    c.setAttribute('opacity', 1);
    var i = 0, timer = setInterval(function () {
      i++;
      c.setAttribute('x2', x + i * 26);
      c.setAttribute('y2', y + i * 11);
      c.setAttribute('opacity', Math.max(0, 1 - i / 26));
      if (i > 26) { clearInterval(timer); c.setAttribute('opacity', 0); }
    }, 26);
  }

  function relampago(duplo) {
    if (reduzido) return;
    var v = document.getElementById('relampago');
    if (!v) return;
    var lampejo = function () {
      v.classList.remove('acende');
      /* força o reinício da animação */
      void v.offsetWidth;
      v.classList.add('acende');
    };
    lampejo();
    if (duplo) setTimeout(lampejo, 260);
  }

  function varreduraCasco() {
    D.navio.classList.add('varre');
    setTimeout(function () { D.navio.classList.remove('varre'); }, 2200);
  }

  function pulsarVinheta(vezes) {
    var v = document.getElementById('vinheta'), n = 0;
    var timer = setInterval(function () {
      v.classList.add('pulso');
      setTimeout(function () { v.classList.remove('pulso'); }, 520);
      if (++n >= vezes) clearInterval(timer);
    }, 1100);
  }

  /* ═════════════════ API ═════════════════ */

  function navio(x, escala, afunda, incl) {
    st.navioX = x;
    if (escala != null) st.navioEscala = escala;
    st.navioAfunda = afunda || 0;
    st.navioIncl = incl == null ? 1.5 : incl;
  }

  function reset() {
    st.amplitude = st.amplitudeAlvo = 18;
    st.neblina = st.neblinaAlvo = 0;
    st.estrelas = st.estrelasAlvo = 1;
    st.farol = st.farolAlvo = 0;
    st.fumaca = 1; st.respingos = 0; st.vibracao = 0; st.motorFalha = 0;
    st.chuva = 0; st.chuvaProx = 0;
    st.atracado = false; st.batimento = 0; st.ondaLuz = 0;
    st.bussola = 0; st.constelacao = 0; st.navioAfunda = 0; st.navioIncl = 1.5;
    document.documentElement.style.setProperty('--saturacao', 1);

    ['fumaca', 'respingos', 'coracoes', 'risadas', 'chuva'].forEach(function (nome) {
      particulas[nome].forEach(function (p) { p.no.remove(); });
      particulas[nome] = [];
    });
    familiaNos.forEach(function (p) {
      p.visivel = false;
      p.no.setAttribute('opacity', 0);
      p.corpo.classList.remove('entra');
    });
    reflexos.forEach(function (r) {
      r.aceso = false;
      r.no.setAttribute('opacity', 0);
      r.agua.setAttribute('opacity', 0);
    });
    marcosNos.forEach(function (m) { m.no.setAttribute('opacity', 0); m.corpo.classList.remove('entra'); });
    constelacaoEstrelas.forEach(function (e) { e.no.setAttribute('opacity', 0); });
    gaivotas.forEach(function (g) { g.ativa = false; });
    D.constLinhas.style.transition = 'none';
    D.constLinhas.setAttribute('stroke-dashoffset', 1600);
    D.clipRota.setAttribute('width', 0);
    ['ilha', 'boia', 'farol', 'porto', 'molhe', 'mapa', 'bussola', 'constelacao', 'amarras']
      .forEach(function (k) { D[k].setAttribute('opacity', 0); });
    D.ondaLuz.setAttribute('opacity', 0);
    D.familia.removeAttribute('transform');
  }

  /* após uma busca, os valores suavizados precisam assentar de imediato */
  function assentar() {
    st.amplitude = st.amplitudeAlvo;
    st.neblina = st.neblinaAlvo;
    st.estrelas = st.estrelasAlvo;
    st.farol = st.farolAlvo;
  }

  function init() {
    D = {
      estrelas: el('estrelas'), viaLactea: el('via-lactea'), cadente: el('cadente'),
      astro: el('astro'), nuvens: el('nuvens'), gaivotas: el('gaivotas'),
      ilha: el('ilha'), boia: el('boia'), farol: el('farol'), farolFeixe: el('farol-feixe'),
      molhe: el('molhe'), porto: el('porto'), lanternas: el('lanternas'),
      familia: el('familia'), coracoes: el('coracoes'), reflexos: el('reflexos'),
      navioPos: el('navio-pos'), navioBalanco: el('navio-balanco'), navio: el('navio'),
      fumaca: el('fumaca'), respingos: el('respingos'), amarras: el('amarras'),
      ondaFundo: el('onda-fundo'), ondaMedio: el('onda-medio'),
      ondaFrente: el('onda-frente'), ondaFrente2: el('onda-frente-2'),
      rastroAstro: el('rastro-astro'), neblina: el('neblina'),
      bussola: el('bussola'), bussolaAgulha: el('bussola-agulha'),
      mapa: el('mapa'), mapaMarcos: el('mapa-marcos'), clipRota: el('clip-rota-rect'),
      constelacao: el('constelacao'), risadas: el('risadas'), ondaLuz: el('onda-luz'),
      chuva: el('chuva')
    };
    st.farolAlvo = 0;
    montarEstrelas();
    montarNuvens();
    montarGaivotas();
    montarLanternas();
    montarFamilia();
    montarConstelacao();
    montarMarcos();
    atualizarOndas(0);
    reset();
  }

  return { init: init, quadro: quadro, efeito: efeito, reset: reset, assentar: assentar, navio: navio, estado: st };
})();
