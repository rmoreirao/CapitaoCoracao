/* =========================================================
 *  Versão 8 — O Filme
 *  script.js — orquestração: roteiro + motor + cenário + UI
 * ========================================================= */
(function () {
  'use strict';

  var R = window.CAPITAO_ROTEIRO;
  if (!R || !R.cenas || !R.cenas.length) {
    console.error('[v8] CAPITAO_ROTEIRO não encontrado.');
    return;
  }

  function el(id) { return document.getElementById(id); }

  var D = {};
  var iniciado = false;
  var timerPlayer = null;

  /* ═════════ legendas ═════════ */

  function mostrarBeat(beat, cena) {
    var zona = D.legenda;
    zona.textContent = '';
    if (!beat) return;

    var p = document.createElement('p');
    p.className = 'fala' + (beat.estilo ? ' e-' + beat.estilo : '');

    if (beat.estilo === 'balao' || beat.estilo === 'titulo') {
      /* entrada palavra por palavra */
      beat.texto.split(' ').forEach(function (palavra, i) {
        var s = document.createElement('span');
        s.className = 'palavra';
        s.textContent = palavra;
        s.style.animationDelay = (i * 0.13).toFixed(2) + 's';
        p.appendChild(s);
        p.appendChild(document.createTextNode(' '));
      });
    } else {
      p.textContent = beat.texto;
    }

    zona.appendChild(p);
    D.narrador.textContent = cena && cena.narrador ? cena.narrador : '';
  }

  /* ═════════ cena ═════════ */

  function aoMudarCena(cena, idx) {
    D.rotulo.textContent = cena.capitulo
      ? 'Capítulo ' + cena.capitulo + ' · ' + cena.titulo
      : cena.titulo;
    D.narrador.textContent = cena.narrador || '';
    D.filme.setAttribute('data-cena', cena.id);
    anunciar('Cena ' + (idx + 1) + ' de ' + R.cenas.length + ': ' + cena.titulo +
             (cena.narrador ? '. Narração: ' + cena.narrador : ''));
  }

  function anunciar(msg) {
    D.srLive.textContent = '';
    setTimeout(function () { D.srLive.textContent = msg; }, 60);
  }

  /* ═════════ progresso ═════════ */

  function tempoTexto(s) {
    var m = Math.floor(s / 60), r = Math.floor(s % 60);
    return m + ':' + (r < 10 ? '0' : '') + r;
  }

  function aoProgresso(t, total) {
    var pct = (t / total) * 100;
    D.preenchido.style.width = pct.toFixed(2) + '%';
    D.barra.setAttribute('aria-valuenow', Math.round(pct));
    D.tempo.textContent = tempoTexto(t) + ' / ' + tempoTexto(total);
  }

  function montarMarcas() {
    R.cenas.forEach(function (cena, i) {
      if (i === 0) return;
      var m = document.createElement('span');
      m.className = 'marca';
      m.style.left = ((window.Motor.inicios[i] / window.Motor.total) * 100).toFixed(2) + '%';
      D.marcas.appendChild(m);
    });
  }

  /* ═════════ fim ═════════ */

  function aoFim() {
    D.telaFinal.hidden = false;
    requestAnimationFrame(function () { D.telaFinal.classList.add('visivel'); });
    D.assinatura.textContent = R.assinatura;
    if (window.renderGaleriaFamilia) window.renderGaleriaFamilia('galeria-final');
    D.legendaZona.classList.add('oculta');
    D.player.classList.add('oculto');
    D.filme.classList.add('terminou');
    anunciar('Fim do filme. Chegamos ao porto do amor.');
  }

  /* ═════════ controles ═════════ */

  function sincronizarPlay() {
    var rodando = window.Motor.estado.rodando;
    D.btnPlay.textContent = rodando ? '⏸' : '▶';
    D.btnPlay.setAttribute('aria-label', rodando ? 'Pausar' : 'Retomar');
    D.filme.classList.toggle('pausado', !rodando);
    if (rodando) esconderPlayerEmBreve(); else mostrarPlayer(true);
  }

  function mostrarPlayer(fixo) {
    D.player.classList.remove('oculto');
    clearTimeout(timerPlayer);
    if (!fixo) esconderPlayerEmBreve();
  }

  function esconderPlayerEmBreve() {
    clearTimeout(timerPlayer);
    timerPlayer = setTimeout(function () {
      if (window.Motor.estado.rodando && !D.filme.classList.contains('terminou')) {
        D.player.classList.add('oculto');
      }
    }, 3200);
  }

  function alternarPlay() {
    if (!iniciado) return;
    window.Motor.alternar();
    sincronizarPlay();
  }

  function telaCheia() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (D.filme.requestFullscreen) D.filme.requestFullscreen();
  }

  function alternarSom() {
    var ligado = window.AudioFilme.alternar();
    D.btnSom.textContent = ligado ? '🔊' : '🔇';
    D.btnSom.setAttribute('aria-pressed', ligado ? 'true' : 'false');
    D.btnSom.setAttribute('aria-label', ligado ? 'Desligar o som' : 'Ligar o som');
  }

  function iniciarFilme() {
    if (iniciado) return;
    iniciado = true;
    /* tira o foco do botão de abertura: senão a primeira tecla Espaço
       seria capturada por ele em vez de pausar o filme */
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    D.telaAbertura.classList.add('saiu');
    setTimeout(function () { D.telaAbertura.hidden = true; }, 900);
    D.legendaZona.classList.remove('oculta');
    window.Motor.buscar(0);
    window.Motor.iniciar();
    sincronizarPlay();
  }

  function reiniciar() {
    D.telaFinal.classList.remove('visivel');
    D.telaFinal.hidden = true;
    D.filme.classList.remove('terminou');
    D.legendaZona.classList.remove('oculta');
    window.Motor.buscar(0);
    window.Motor.retomar();
    sincronizarPlay();
  }

  function buscarPelaBarra(ev) {
    var r = D.barra.getBoundingClientRect();
    var x = (ev.clientX != null ? ev.clientX : ev.touches[0].clientX) - r.left;
    var k = Math.max(0, Math.min(1, x / r.width));
    if (D.filme.classList.contains('terminou')) {
      D.telaFinal.classList.remove('visivel');
      D.telaFinal.hidden = true;
      D.filme.classList.remove('terminou');
      D.legendaZona.classList.remove('oculta');
    }
    window.Motor.buscar(k * window.Motor.total);
    sincronizarPlay();
  }

  /* ═════════ teclado ═════════ */

  function aoTeclar(ev) {
    var alvo = ev.target;
    if (alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA')) return;

    if (!iniciado) {
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); iniciarFilme(); }
      return;
    }
    switch (ev.key) {
      case ' ':
        if (alvo && alvo.tagName === 'BUTTON') return;
        ev.preventDefault(); alternarPlay(); break;
      case 'ArrowRight': ev.preventDefault(); window.Motor.proxima(); sincronizarPlay(); mostrarPlayer(); break;
      case 'ArrowLeft':  ev.preventDefault(); window.Motor.anterior(); sincronizarPlay(); mostrarPlayer(); break;
      case 'f': case 'F': telaCheia(); break;
      case 'm': case 'M': alternarSom(); break;
    }
  }

  /* ═════════ arranque ═════════ */

  function pronto() {
    D = {
      filme: el('filme'),
      legendaZona: el('legenda-zona'),
      legenda: el('legenda'),
      narrador: el('cena-narrador'),
      rotulo: el('cena-rotulo'),
      telaAbertura: el('tela-abertura'),
      telaFinal: el('tela-final'),
      assinatura: el('final-assinatura'),
      player: el('player'),
      barra: el('player-barra'),
      preenchido: el('player-preenchido'),
      marcas: el('player-marcas'),
      tempo: el('player-tempo'),
      btnPlay: el('btn-play'),
      btnSom: el('btn-som'),
      srLive: el('sr-live')
    };

    window.Cenario.init();
    window.Motor.init();
    montarMarcas();

    window.Motor.on.beat = mostrarBeat;
    window.Motor.on.cena = aoMudarCena;
    window.Motor.on.progresso = aoProgresso;
    window.Motor.on.fim = aoFim;

    D.legendaZona.classList.add('oculta');

    el('btn-iniciar').addEventListener('click', iniciarFilme);
    el('btn-replay').addEventListener('click', reiniciar);
    D.btnPlay.addEventListener('click', alternarPlay);
    el('btn-proximo').addEventListener('click', function () { window.Motor.proxima(); sincronizarPlay(); mostrarPlayer(); });
    el('btn-anterior').addEventListener('click', function () { window.Motor.anterior(); sincronizarPlay(); mostrarPlayer(); });
    el('btn-tela').addEventListener('click', telaCheia);
    D.btnSom.addEventListener('click', alternarSom);
    if (!window.AudioFilme.disponivel()) D.btnSom.hidden = true;

    D.barra.addEventListener('click', buscarPelaBarra);
    D.barra.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        ev.preventDefault();
        window.Motor.buscar(window.Motor.estado.t + (ev.key === 'ArrowRight' ? 5 : -5));
        sincronizarPlay();
      }
    });

    document.addEventListener('keydown', aoTeclar);
    D.filme.addEventListener('mousemove', function () { if (iniciado) mostrarPlayer(); });
    D.filme.addEventListener('touchstart', function () { if (iniciado) mostrarPlayer(); }, { passive: true });

    /* clicar na cena pausa/retoma */
    el('palco').addEventListener('click', function () {
      if (iniciado && !D.filme.classList.contains('terminou')) alternarPlay();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pronto);
  else pronto();
})();
