/* =========================================================
 *  Versão 8 — O Filme
 *  slideshow.js — as fotos da família, uma a uma
 *
 *  Pensado para gravação em vídeo: as fotos passam sozinhas,
 *  sem legenda, com fade e um zoom lento (Ken Burns). Quando
 *  acabam, todas aparecem juntas em uma grade.
 *
 *  A lista vem de window.CAPITAO_FOTOS (fotos/fotos.js), gerada
 *  automaticamente a partir da pasta /fotos.
 * ========================================================= */
window.Slideshow = (function () {
  'use strict';

  var SEGUNDOS_POR_FOTO = 4;
  var reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var D = {};
  var fotos = [];
  var indice = -1;
  var timer = null;
  var rodando = false;
  var aoTerminar = null;

  function el(id) { return document.getElementById(id); }

  function caminho(f) {
    return f.src || ('../fotos/' + encodeURIComponent(f.arquivo));
  }

  /* deixa a próxima imagem já no cache do navegador */
  function preCarregar(i) {
    if (i >= fotos.length) return;
    var img = new Image();
    img.src = caminho(fotos[i]);
  }

  function montarFoto(f, i) {
    var fig = document.createElement('div');
    fig.className = 'foto-palco kb-' + (i % 4);
    var img = document.createElement('img');
    img.alt = '';                       /* decorativa: sem legenda */
    img.decoding = 'async';
    if (f.width && f.height) { img.width = f.width; img.height = f.height; }
    img.src = caminho(f);
    fig.appendChild(img);
    return fig;
  }

  function mostrar(i) {
    var anterior = D.palco.querySelector('.foto-palco');
    var nova = montarFoto(fotos[i], i);
    D.palco.appendChild(nova);

    requestAnimationFrame(function () {
      nova.classList.add('visivel');
      if (anterior) {
        anterior.classList.remove('visivel');
        setTimeout(function () { anterior.remove(); }, 1200);
      }
    });

    D.contador.textContent = (i + 1) + ' / ' + fotos.length;
    preCarregar(i + 2);
  }

  function passo() {
    indice++;
    if (indice >= fotos.length) { concluir(); return; }
    mostrar(indice);
    timer = setTimeout(passo, SEGUNDOS_POR_FOTO * 1000);
  }

  /* ── grade final com todas as fotos ── */
  function montarGrade() {
    D.grade.textContent = '';
    fotos.forEach(function (f, i) {
      var cel = document.createElement('div');
      cel.className = 'celula';
      cel.style.animationDelay = (i * 0.07).toFixed(2) + 's';
      var img = document.createElement('img');
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      if (f.width && f.height) { img.width = f.width; img.height = f.height; }
      img.src = caminho(f);
      cel.appendChild(img);
      D.grade.appendChild(cel);
    });
  }

  function concluir() {
    rodando = false;
    clearTimeout(timer);
    D.raiz.classList.add('concluido');
    if (D.tela) D.tela.classList.add('concluido');
    montarGrade();
    if (aoTerminar) aoTerminar();
  }

  /* ── API ── */

  function iniciar(callbackFim) {
    aoTerminar = callbackFim || null;
    fotos = (window.CAPITAO_FOTOS && window.CAPITAO_FOTOS.length)
      ? window.CAPITAO_FOTOS.slice()
      : [];

    parar();
    D.palco.textContent = '';
    D.grade.textContent = '';
    D.raiz.classList.remove('concluido');
    if (D.tela) D.tela.classList.remove('concluido');
    indice = -1;

    if (!fotos.length) { concluir(); return; }

    rodando = true;
    preCarregar(0);
    preCarregar(1);
    passo();
  }

  function parar() {
    rodando = false;
    clearTimeout(timer);
    timer = null;
  }

  function init() {
    D = {
      raiz: el('final-fotos'),
      tela: el('tela-final'),
      palco: el('foto-palco'),
      grade: el('foto-grade'),
      contador: el('foto-contador')
    };
    if (reduzido) D.raiz.classList.add('sem-movimento');
  }

  return {
    init: init,
    iniciar: iniciar,
    parar: parar,
    concluir: concluir,
    estaRodando: function () { return rodando; },
    duracao: function () {
      var n = (window.CAPITAO_FOTOS || []).length;
      return n * SEGUNDOS_POR_FOTO;
    }
  };
})();
