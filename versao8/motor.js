/* =========================================================
 *  Versão 8 — O Filme
 *  motor.js — relógio, timeline, câmera e interpolação
 *
 *  Diferente da Versão 7 (cadeia de setTimeout), aqui existe um
 *  relógio mestre em requestAnimationFrame. Isso permite:
 *    · pausar e retomar sem perder a posição
 *    · buscar qualquer instante do filme
 *    · interpolar câmera e cores de forma contínua
 *
 *  API:
 *    Motor.iniciar() / pausar() / retomar() / alternar()
 *    Motor.proxima() / anterior() / irParaCena(i) / buscar(t)
 *    Motor.on = { cena, beat, progresso, fim }
 * ========================================================= */
window.Motor = (function () {
  'use strict';

  var R = window.CAPITAO_ROTEIRO;
  var CENAS = R.cenas;
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* efeitos que não podem ser reaplicados ao buscar (são "one-shot") */
  var UNICOS = { cadente: 1, varredura: 1, pulsoVinheta: 1, engasgo: 1, coracoes: 1, motorFalha: 1, risada: 1 };

  /* ── tempos absolutos de início de cada cena ── */
  var inicios = [], total = 0, i;
  for (i = 0; i < CENAS.length; i++) { inicios.push(total); total += CENAS[i].dur; }

  var palco, cam, camadas = [], sk = {};

  var E = {
    t: 0,            // tempo global (s)
    tAnterior: 0,    // usado para disparar eventos no intervalo
    cena: -1,
    rodando: false,
    iniciado: false,
    beatAtual: -1,
    rafId: null,
    ultimoTs: 0
  };

  var on = { cena: null, beat: null, progresso: null, fim: null };

  /* ═════════ utilidades ═════════ */

  function limita(v, a, b) { return v < a ? a : (v > b ? b : v); }

  var EASINGS = {
    linear: function (k) { return k; },
    easeInOutCubic: function (k) { return k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; },
    easeInOutQuad: function (k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; },
    easeOutCubic: function (k) { return 1 - Math.pow(1 - k, 3); }
  };

  function hexRgb(h) {
    return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)];
  }
  function rgbHex(c) {
    return '#' + c.map(function (v) {
      var s = Math.round(limita(v, 0, 255)).toString(16);
      return s.length < 2 ? '0' + s : s;
    }).join('');
  }
  function misturaCor(a, b, k) {
    var x = hexRgb(a), y = hexRgb(b);
    return rgbHex([x[0] + (y[0] - x[0]) * k, x[1] + (y[1] - x[1]) * k, x[2] + (y[2] - x[2]) * k]);
  }
  function escurece(hex, k) {
    var c = hexRgb(hex);
    return rgbHex([c[0] * (1 - k), c[1] * (1 - k), c[2] * (1 - k)]);
  }

  /* interpola uma lista de keyframes {t, ...} no instante tl */
  function entre(lista, tl) {
    var i, a = lista[0], b = lista[0];
    for (i = 0; i < lista.length; i++) {
      if (lista[i].t <= tl) { a = lista[i]; b = lista[i + 1] || lista[i]; }
    }
    var span = b.t - a.t;
    var k = span > 0 ? limita((tl - a.t) / span, 0, 1) : 1;
    return { a: a, b: b, k: k };
  }

  /* ═════════ câmera ═════════ */

  var tela = { w: 16, h: 9 };
  function medirTela() {
    if (!palco) return;
    var r = palco.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) { tela.w = r.width; tela.h = r.height; }
  }

  /* Adapta o enquadramento 16:9 do roteiro à proporção real da tela.
     Em telas estreitas (celular em retrato) o corte lateral esconderia o
     navio, então a janela cresce na vertical em vez de cortar a horizontal. */
  function adaptarProporcao(box) {
    var aTela = tela.w / tela.h;
    var aBox = box[2] / box[3];
    if (aTela < aBox) {
      var fator = Math.min(aBox / aTela, 2.6);
      var nova = box[3] * fator;
      box[1] -= (nova - box[3]) * 0.55;
      box[3] = nova;
    } else if (aTela > aBox) {
      var largura = Math.min(box[3] * aTela, box[2] * 1.6);
      box[0] -= (largura - box[2]) / 2;
      box[2] = largura;
    }
    return box;
  }

  function aplicarCamera(cena, tl) {
    var r = entre(cena.camera, tl);
    var fn = EASINGS[r.b.easing || r.a.easing || 'easeInOutCubic'] || EASINGS.linear;
    var k = reduzido ? 1 : fn(r.k);
    var box = [0, 0, 0, 0], j;
    for (j = 0; j < 4; j++) box[j] = r.a.box[j] + (r.b.box[j] - r.a.box[j]) * k;
    adaptarProporcao(box);

    palco.setAttribute('viewBox', box.map(function (v) { return v.toFixed(1); }).join(' '));

    var cx = box[0] + box[2] / 2, cy = box[1] + box[3] / 2;

    /* giro sutil da câmera */
    var g0 = r.a.giro || 0, g1 = r.b.giro == null ? g0 : r.b.giro;
    var giro = reduzido ? 0 : g0 + (g1 - g0) * k;
    cam.setAttribute('transform', giro ? 'rotate(' + giro.toFixed(2) + ' ' + cx.toFixed(0) + ' ' + cy.toFixed(0) + ')' : '');

    /* parallax: camadas de fundo acompanham a câmera */
    if (!reduzido) {
      camadas.forEach(function (c) {
        var f = 1 - c.fator;
        var dx = (cx - 2000) * f;
        var dy = (cy - 600) * f * 0.7;
        c.no.setAttribute('transform', 'translate(' + dx.toFixed(1) + ' ' + dy.toFixed(1) + ')');
      });
    }

    return { camX: box[0], camY: box[1], camW: box[2], camH: box[3], cx: cx, cy: cy };
  }

  /* ═════════ céu ═════════ */

  function aplicarCeu(cena, tl, ctx) {
    var r = entre(cena.ceu, tl);
    var ta = R.temas[r.a.tema], tb = R.temas[r.b.tema], k = r.k;

    sk.ceuTopo.setAttribute('stop-color', misturaCor(ta.ceuTopo, tb.ceuTopo, k));
    sk.ceuBase.setAttribute('stop-color', misturaCor(ta.ceuBase, tb.ceuBase, k));

    var mar = misturaCor(ta.mar, tb.mar, k);
    sk.marTopo.setAttribute('stop-color', mar);
    sk.marBase.setAttribute('stop-color', escurece(mar, 0.45));

    var corAstro = misturaCor(ta.astro, tb.astro, k);
    sk.astroDisco.setAttribute('fill', corAstro);
    sk.halo1.setAttribute('stop-color', corAstro);
    sk.halo2.setAttribute('stop-color', corAstro);
    sk.rastro1.setAttribute('stop-color', corAstro);
    sk.rastro2.setAttribute('stop-color', corAstro);

    var halo = ta.halo + (tb.halo - ta.halo) * k;
    sk.halo1.setAttribute('stop-opacity', (halo * 0.85).toFixed(3));
    sk.halo2.setAttribute('stop-opacity', (halo * 0.22).toFixed(3));
    sk.rastro1.setAttribute('stop-opacity', (halo * 0.30).toFixed(3));

    var nuvens = (ta.nuvens == null ? 0.8 : ta.nuvens);
    nuvens += ((tb.nuvens == null ? 0.8 : tb.nuvens) - nuvens) * k;
    sk.nuvens.setAttribute('opacity', nuvens.toFixed(3));

    var lua = ta.lua + (tb.lua - ta.lua) * k;
    sk.cratera1.setAttribute('opacity', (lua * 0.12).toFixed(3));
    sk.cratera2.setAttribute('opacity', (lua * 0.12).toFixed(3));

    var ay = ta.astroY + (tb.astroY - ta.astroY) * k;
    var adx = ta.astroDX + (tb.astroDX - ta.astroDX) * k;
    var ax = ctx.cx + adx;
    sk.astro.setAttribute('transform', 'translate(' + ax.toFixed(0) + ' ' + ay.toFixed(0) + ')');
    sk.astro.dataset.x = ax.toFixed(0);
  }

  /* ═════════ eventos (beats e efeitos) ═════════ */

  function dispararIntervalo(t0, t1) {
    CENAS.forEach(function (cena, idx) {
      var base = inicios[idx];
      (cena.efeitos || []).forEach(function (ev) {
        var abs = base + ev.t;
        if (abs > t0 && abs <= t1) window.Cenario.efeito(ev);
      });
      (cena.som || []).forEach(function (ev) {
        var abs = base + ev.t;
        if (abs > t0 && abs <= t1 && window.AudioFilme) window.AudioFilme.aplicar(ev);
      });
    });
  }

  /* reconstrói o estado visual até o instante t (usado ao buscar) */
  function reconstruir(t) {
    window.Cenario.reset();
    if (window.AudioFilme) window.AudioFilme.reset();
    CENAS.forEach(function (cena, idx) {
      var base = inicios[idx];
      (cena.efeitos || []).forEach(function (ev) {
        if (base + ev.t <= t && !UNICOS[ev.tipo]) window.Cenario.efeito(ev);
      });
      (cena.som || []).forEach(function (ev) {
        if (base + ev.t <= t && window.AudioFilme) window.AudioFilme.aplicar(ev, true);
      });
    });
    window.Cenario.assentar();
  }

  function aplicarBeat(cena, tl, idxCena) {
    var beats = cena.beats || [], escolhido = -1, i;
    for (i = 0; i < beats.length; i++) if (beats[i].t <= tl) escolhido = i;
    var chave = idxCena + ':' + escolhido;
    if (chave !== E.beatAtual) {
      E.beatAtual = chave;
      if (on.beat) on.beat(escolhido >= 0 ? beats[escolhido] : null, cena, escolhido);
    }
  }

  /* ═════════ navio ═════════ */

  function aplicarNavio(cena, tl) {
    var n = cena.navio || {};
    var fn = EASINGS[n.easing || 'linear'] || EASINGS.linear;
    var k = fn(limita(tl / cena.dur, 0, 1));
    var x = (n.de || 0) + ((n.ate == null ? n.de : n.ate) - (n.de || 0)) * k;
    var afunda = (n.afunda || 0) * k;
    window.Cenario.navio(x, n.escala == null ? 1 : n.escala, afunda, n.incl);
  }

  /* ═════════ laço principal ═════════ */

  function quadro(ts) {
    E.rafId = requestAnimationFrame(quadro);
    if (!E.ultimoTs) E.ultimoTs = ts;
    var dt = Math.min(0.05, (ts - E.ultimoTs) / 1000);
    E.ultimoTs = ts;

    if (E.rodando) {
      E.t += dt;
      if (E.t >= total) {
        E.t = total;
        E.rodando = false;
        renderizar(dt);
        if (on.fim) on.fim();
        return;
      }
      dispararIntervalo(E.tAnterior, E.t);
      E.tAnterior = E.t;
    }
    renderizar(dt);
  }

  function renderizar(dt) {
    var idx = indiceDaCena(E.t);
    var cena = CENAS[idx];
    var tl = limita(E.t - inicios[idx], 0, cena.dur);

    if (idx !== E.cena) {
      E.cena = idx;
      if (on.cena) on.cena(cena, idx);
    }

    var ctx = aplicarCamera(cena, tl);
    aplicarCeu(cena, tl, ctx);
    aplicarNavio(cena, tl);
    aplicarBeat(cena, tl, idx);
    window.Cenario.quadro(E.t, dt, ctx);

    if (on.progresso) on.progresso(E.t, total, idx, cena);
  }

  function indiceDaCena(t) {
    var i;
    for (i = CENAS.length - 1; i >= 0; i--) if (t >= inicios[i]) return i;
    return 0;
  }

  /* ═════════ API ═════════ */

  function iniciar() {
    if (!E.iniciado) {
      E.iniciado = true;
      E.rafId = requestAnimationFrame(quadro);
    }
    E.rodando = true;
  }

  function pausar()  { E.rodando = false; }
  function retomar() { E.rodando = true; }
  function alternar() { E.rodando = !E.rodando; return E.rodando; }

  function buscar(t) {
    t = limita(t, 0, total - 0.01);
    E.t = t;
    E.tAnterior = t;
    E.beatAtual = -1;
    reconstruir(t);
    renderizar(0.016);
  }

  function irParaCena(i) {
    i = limita(i, 0, CENAS.length - 1);
    buscar(inicios[i] + 0.001);
  }

  function proxima() { irParaCena(indiceDaCena(E.t) + 1); }

  function anterior() {
    var i = indiceDaCena(E.t);
    /* se já passou de 3 s na cena, volta para o começo dela */
    if (E.t - inicios[i] > 3) irParaCena(i);
    else irParaCena(i - 1);
  }

  function init() {
    palco = document.getElementById('palco');
    cam = document.getElementById('cam');
    camadas = [].slice.call(palco.querySelectorAll('[data-parallax]')).map(function (no) {
      return { no: no, fator: parseFloat(no.getAttribute('data-parallax')) };
    });
    sk = {
      ceuTopo: document.getElementById('ceu-topo'),
      ceuBase: document.getElementById('ceu-base'),
      marTopo: document.getElementById('mar-topo'),
      marBase: document.getElementById('mar-base'),
      halo1: document.getElementById('halo-1'),
      halo2: document.getElementById('halo-2'),
      rastro1: document.getElementById('rastro-1'),
      rastro2: document.getElementById('rastro-2'),
      astro: document.getElementById('astro'),
      nuvens: document.getElementById('camada-nuvens'),
      astroDisco: document.getElementById('astro-disco'),
      cratera1: document.getElementById('astro-cratera-1'),
      cratera2: document.getElementById('astro-cratera-2')
    };
    medirTela();
    window.addEventListener('resize', function () {
      medirTela();
      renderizar(0.016);
    });
    buscar(0);
  }

  return {
    init: init, iniciar: iniciar, pausar: pausar, retomar: retomar, alternar: alternar,
    buscar: buscar, irParaCena: irParaCena, proxima: proxima, anterior: anterior,
    indiceDaCena: indiceDaCena, inicios: inicios, total: total, estado: E,
    on: on, reduzido: reduzido
  };
})();
