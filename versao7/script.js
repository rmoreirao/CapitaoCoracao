/* =========================================================
 *  Versão 7 — Jornada Cinematográfica
 *  Timeline/state controller — plain JS, sem dependências
 *
 *  FLUXO:
 *    abertura → (botão) → cena[0] → cena[1] → … → cena[8] → final
 *
 *  FASES do Estado:
 *    'abertura'   – tela inicial, aguardando interação
 *    'transicao'  – fade entre cenas (timer e input bloqueados)
 *    'cena'       – reproduzindo ou pausado em um capítulo
 *    'final'      – tela de créditos / galeria
 * ========================================================= */
(function () {
  'use strict';

  /* ── Dados da história ── */
  var story = window.CAPITAO_STORY;
  if (!story || !story.capitulos || !story.capitulos.length) {
    console.error('[v7] CAPITAO_STORY não encontrado ou vazio.');
    return;
  }
  var TOTAL = story.capitulos.length;

  /* ─────────────────────────────────────────────────────────
   *  CONFIGURAÇÃO DE AMBIENTES POR CAPÍTULO
   *  (fallback seguro: qualquer capítulo extra usa o último)
   * ───────────────────────────────────────────────────────── */
  var AMBIENTES = [
    /* 0 – Capítulo 1: amanhecer */ {
      ceu: 'c-amanhecer', astro: '☀️', lua: false,
      estrelas: false, gaivota: false, ilha: true, farol: false, luzes: false,
      oceano: 'rgba(12,136,195,.82)', neblina: false
    },
    /* 1 – Capítulo 2: manhã */ {
      ceu: 'c-manha', astro: '☀️', lua: false,
      estrelas: false, gaivota: true, ilha: true, farol: false, luzes: false,
      oceano: 'rgba(14,145,205,.82)', neblina: false
    },
    /* 2 – Capítulo 3: meio-dia */ {
      ceu: 'c-meiodia', astro: '☀️', lua: false,
      estrelas: false, gaivota: true, ilha: false, farol: false, luzes: false,
      oceano: 'rgba(20,150,215,.82)', neblina: false
    },
    /* 3 – Capítulo 4: neblina */ {
      ceu: 'c-neblina', astro: '🌫️', lua: false,
      estrelas: false, gaivota: false, ilha: false, farol: true, luzes: false,
      oceano: 'rgba(74,107,122,.82)', neblina: true
    },
    /* 4 – Capítulo 5: tarde */ {
      ceu: 'c-tarde', astro: '☀️', lua: false,
      estrelas: false, gaivota: true, ilha: true, farol: false, luzes: false,
      oceano: 'rgba(12,130,190,.82)', neblina: false
    },
    /* 5 – Capítulo 6: pôr-do-sol */ {
      ceu: 'c-pordosol', astro: '🌅', lua: false,
      estrelas: false, gaivota: true, ilha: false, farol: true, luzes: false,
      oceano: 'rgba(180,80,30,.75)', neblina: false
    },
    /* 6 – Capítulo 7: crepúsculo */ {
      ceu: 'c-crepusculo', astro: '🌙', lua: true,
      estrelas: true, gaivota: false, ilha: false, farol: true, luzes: false,
      oceano: 'rgba(10,40,80,.9)', neblina: false
    },
    /* 7 – Capítulo 8: noite */ {
      ceu: 'c-noite', astro: '🌙', lua: true,
      estrelas: true, gaivota: false, ilha: false, farol: true, luzes: false,
      oceano: 'rgba(5,22,50,.95)', neblina: false
    },
    /* 8 – Capítulo 9: chegada ao porto */ {
      ceu: 'c-chegada', astro: '🌅', lua: false,
      estrelas: false, gaivota: true, ilha: true, farol: true, luzes: true,
      oceano: 'rgba(8,60,110,.88)', neblina: false
    }
  ];

  /* ─────────────────────────────────────────────────────────
   *  ESTADO GLOBAL
   * ───────────────────────────────────────────────────────── */
  var Estado = {
    fase: 'abertura',   // 'abertura' | 'transicao' | 'cena' | 'final'
    capitulo: 0,        // índice 0-based do capítulo atual
    paragrafo: 0,       // índice do próximo parágrafo a ser revelado
    reproduzindo: false,
    _timerId: null      // ID do setTimeout ativo (único de cada vez)
  };

  /* ─────────────────────────────────────────────────────────
   *  ELEMENTOS DOM
   * ───────────────────────────────────────────────────────── */
  function el(id) { return document.getElementById(id); }
  var Dom = {
    ceu:            el('ceu'),
    astro:          el('astro'),
    estrelas:       el('estrelas'),
    gv1:            document.querySelector('.gv1'),
    gv2:            document.querySelector('.gv2'),
    neblina:        el('neblina'),
    ilha:           el('ilha'),
    farol:          el('farol'),
    luzes:          el('luzes-porto'),
    navio:          el('navio'),
    fadeOverlay:    el('fade-cena'),
    telaAbertura:   el('tela-abertura'),
    telaCena:       el('tela-cena'),
    telaFinal:      el('tela-final'),
    cenaNumero:     el('cena-numero'),
    cenaNarrador:   el('cena-narrador'),
    cenaEmoji:      el('cena-emoji'),
    cenaTitulo:     el('cena-titulo'),
    cenaTexto:      el('cena-texto'),
    finalAssin:     el('final-assinatura'),
    btnIniciar:     el('btn-iniciar'),
    btnPlay:        el('btn-play'),
    btnAnterior:    el('btn-anterior'),
    btnProximo:     el('btn-proximo'),
    btnFullscreen:  el('btn-fullscreen'),
    btnReplay:      el('btn-replay'),
    player:         el('player'),
    progBarra:      el('progresso-barra'),
    progWrap:       el('progresso-wrap'),
    playerNum:      el('player-num'),
    srLive:         el('sr-live'),
    filme:          el('filme')
  };

  /* ─────────────────────────────────────────────────────────
   *  TIMER — garante que só um timer está ativo por vez
   * ───────────────────────────────────────────────────────── */
  function agendar(fn, ms) {
    clearTimeout(Estado._timerId);
    Estado._timerId = setTimeout(fn, ms);
  }
  function cancelar() {
    clearTimeout(Estado._timerId);
    Estado._timerId = null;
  }

  /* Duração do delay para anúncios de leitores de tela (ms) */
  var ANNOUNCE_DELAY_MS = 60;

  /* ─────────────────────────────────────────────────────────
   *  ACESSIBILIDADE — anuncia mudanças para leitores de tela
   * ───────────────────────────────────────────────────────── */
  function anunciar(msg) {
    Dom.srLive.textContent = '';
    setTimeout(function () { Dom.srLive.textContent = msg; }, ANNOUNCE_DELAY_MS);
  }

  /* ─────────────────────────────────────────────────────────
   *  DURAÇÃO DE LEITURA por parágrafo (ms)
   *  ≈ 900 ms base + 320 ms / palavra, entre 2 500 ms e 6 000 ms
   * ───────────────────────────────────────────────────────── */
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function tempoParagrafo(texto) {
    if (reducedMotion) return 1200; // leitura mais curta sem animações
    var palavras = texto.trim().split(/\s+/).length;
    return Math.max(2500, Math.min(6000, 900 + palavras * 320));
  }

  /* ─────────────────────────────────────────────────────────
   *  DURAÇÃO DO FADE DE TRANSIÇÃO (ms)
   * ───────────────────────────────────────────────────────── */
  var FADE_MS = reducedMotion ? 50 : 850;

  /* ─────────────────────────────────────────────────────────
   *  AMBIENTE VISUAL — aplica céu, navio e elementos de cena
   * ───────────────────────────────────────────────────────── */
  function aplicarAmbiente(idx) {
    var amb = AMBIENTES[Math.min(idx, AMBIENTES.length - 1)];

    /* Céu */
    Dom.ceu.className = 'camada-ceu ' + amb.ceu;

    /* Astro (sol/lua/pôr-do-sol) */
    Dom.astro.textContent = amb.astro;
    Dom.astro.classList.toggle('lua', !!amb.lua);

    /* Estrelas / gaivotas / neblina */
    Dom.estrelas.classList.toggle('visivel', !!amb.estrelas);
    if (Dom.gv1) Dom.gv1.classList.toggle('visivel', !!amb.gaivota);
    if (Dom.gv2) Dom.gv2.classList.toggle('visivel', !!amb.gaivota);
    Dom.neblina.classList.toggle('ativa', !!amb.neblina);

    /* Paisagem */
    Dom.ilha.classList.toggle('visivel',  !!amb.ilha);
    Dom.farol.classList.toggle('visivel', !!amb.farol);
    Dom.luzes.classList.toggle('visivel', !!amb.luzes);
    if (amb.luzes && !Dom.luzes.textContent.trim()) {
      Dom.luzes.textContent = '🏮 🏮 🏮';
    }

    /* Navio: desloca da esquerda (5 %) até perto da direita (78 %)
       proporcionalmente ao índice do capítulo */
    var posX = 5 + (idx / Math.max(1, TOTAL - 1)) * 73;
    Dom.navio.style.left = posX.toFixed(1) + '%';
  }

  /* ─────────────────────────────────────────────────────────
   *  BARRA DE PROGRESSO
   * ───────────────────────────────────────────────────────── */
  function atualizarProgresso() {
    if (Estado.fase !== 'cena' && Estado.fase !== 'transicao') return;
    var cap  = Estado.capitulo;
    var para = Estado.paragrafo;
    var tam  = story.capitulos[cap].texto.length;
    /* Progresso contínuo = capítulos completos + fração do capítulo atual */
    var p = ((cap + Math.min(para, tam) / tam) / TOTAL) * 100;
    Dom.progBarra.style.width = p.toFixed(1) + '%';
    Dom.progWrap.setAttribute('aria-valuenow', Math.round(p));
    Dom.playerNum.textContent = (cap + 1) + ' / ' + TOTAL;
  }

  /* ─────────────────────────────────────────────────────────
   *  REVELAR PARÁGRAFO
   * ───────────────────────────────────────────────────────── */
  function revelarParagrafo(idxPara) {
    var ps = Dom.cenaTexto.querySelectorAll('p');
    if (idxPara >= ps.length) return;
    /* Marca os anteriores como "passado" (opacidade reduzida) */
    for (var i = 0; i < ps.length; i++) {
      if (i < idxPara)  ps[i].classList.add('passado');
      if (i === idxPara) {
        ps[i].classList.remove('passado');
        ps[i].classList.add('visivel');
      }
    }
    /* Rola para manter o parágrafo atual visível */
    Dom.cenaTexto.scrollTop = Dom.cenaTexto.scrollHeight;
    atualizarProgresso();
  }

  /* ─────────────────────────────────────────────────────────
   *  PREENCHER DOM DO CAPÍTULO
   * ───────────────────────────────────────────────────────── */
  function montarCapituloNoDOM(idx) {
    var cap = story.capitulos[idx];
    Dom.cenaNumero.textContent  = 'Capítulo ' + (idx + 1) + ' de ' + TOTAL;
    Dom.cenaNarrador.textContent = cap.narrador || '';
    Dom.cenaEmoji.textContent   = cap.emoji || '';
    Dom.cenaTitulo.textContent  = cap.titulo || '';

    /* Recria os parágrafos (todos ocultos inicialmente) */
    Dom.cenaTexto.textContent = '';
    cap.texto.forEach(function (linha) {
      var p = document.createElement('p');
      p.textContent = linha;
      Dom.cenaTexto.appendChild(p);
    });
    Dom.cenaTexto.scrollTop = 0;

    aplicarAmbiente(idx);
    atualizarProgresso();
    anunciar('Capítulo ' + (idx + 1) + ': ' + cap.titulo + '. Narrador: ' + (cap.narrador || ''));
  }

  /* ─────────────────────────────────────────────────────────
   *  LOOP DE PARÁGRAFOS (coração do timeline automático)
   * ───────────────────────────────────────────────────────── */
  function loopParagrafo() {
    cancelar();
    if (!Estado.reproduzindo || Estado.fase !== 'cena') return;

    var cap = story.capitulos[Estado.capitulo];

    if (Estado.paragrafo >= cap.texto.length) {
      /* Todos os parágrafos revelados — pausa antes de avançar */
      agendar(function () {
        if (Estado.reproduzindo) avancarCapitulo();
      }, 2800);
      return;
    }

    revelarParagrafo(Estado.paragrafo);
    var tempo = tempoParagrafo(cap.texto[Estado.paragrafo]);
    Estado.paragrafo++;
    agendar(loopParagrafo, tempo);
  }

  /* ─────────────────────────────────────────────────────────
   *  AVANÇAR CAPÍTULO (com crossfade)
   * ───────────────────────────────────────────────────────── */
  function avancarCapitulo() {
    cancelar();

    if (Estado.capitulo >= TOTAL - 1) {
      mostrarFinal();
      return;
    }

    Estado.fase = 'transicao';
    Dom.fadeOverlay.classList.add('ativo');

    setTimeout(function () {
      Estado.capitulo++;
      Estado.paragrafo = 0;
      montarCapituloNoDOM(Estado.capitulo);
      Dom.fadeOverlay.classList.remove('ativo');
      Estado.fase = 'cena';

      /* Pequena pausa para o título aparecer antes dos parágrafos */
      agendar(loopParagrafo, 1100 + FADE_MS);
    }, FADE_MS);
  }

  /* ─────────────────────────────────────────────────────────
   *  TELA FINAL
   * ───────────────────────────────────────────────────────── */
  function mostrarFinal() {
    cancelar();
    Estado.fase = 'final';
    Estado.reproduzindo = false;

    Dom.fadeOverlay.classList.add('ativo');
    setTimeout(function () {
      Dom.telaCena.hidden  = true;
      Dom.telaFinal.hidden = false;
      Dom.finalAssin.textContent = story.assinatura || '';
      renderGaleriaFamilia('galeria-final');

      /* Ambiente de chegada */
      Dom.ceu.className = 'camada-ceu c-chegada';
      Dom.astro.textContent = '🌅';
      Dom.astro.classList.remove('lua');
      Dom.luzes.classList.add('visivel');
      if (!Dom.luzes.textContent.trim()) Dom.luzes.textContent = '🏮 🏮 🏮';
      Dom.farol.classList.add('visivel');
      Dom.navio.style.left = '82%';

      Dom.fadeOverlay.classList.remove('ativo');
      Dom.player.classList.add('oculto');
      syncBotaoPlay();
      anunciar('História concluída. Chegamos ao porto do amor!');
    }, FADE_MS);
  }

  /* ─────────────────────────────────────────────────────────
   *  INICIAR FILME
   * ───────────────────────────────────────────────────────── */
  function iniciarFilme() {
    Estado.fase         = 'cena';
    Estado.capitulo     = 0;
    Estado.paragrafo    = 0;
    Estado.reproduzindo = true;

    Dom.telaAbertura.hidden = true;
    Dom.telaCena.hidden     = false;

    Dom.fadeOverlay.classList.add('ativo');
    montarCapituloNoDOM(0);

    setTimeout(function () {
      Dom.fadeOverlay.classList.remove('ativo');
      agendar(loopParagrafo, 1200 + FADE_MS);
    }, FADE_MS);

    syncBotaoPlay();
    mostrarControles(false); /* exibe e agenda o auto-hide */
  }

  /* ─────────────────────────────────────────────────────────
   *  PAUSE / RETOMAR
   * ───────────────────────────────────────────────────────── */
  function pausar() {
    cancelar();
    Estado.reproduzindo = false;
    syncBotaoPlay();
    anunciar('Pausado no capítulo ' + (Estado.capitulo + 1));
  }

  function retomar() {
    if (Estado.fase !== 'cena') return;
    Estado.reproduzindo = true;
    syncBotaoPlay();
    loopParagrafo();
    anunciar('Retomando');
  }

  function togglePlay() {
    if (Estado.reproduzindo) pausar();
    else retomar();
  }

  function syncBotaoPlay() {
    Dom.btnPlay.textContent = Estado.reproduzindo ? '⏸' : '▶';
    Dom.btnPlay.setAttribute('aria-label', Estado.reproduzindo ? 'Pausar' : 'Retomar');
    /* Mantém o player visível quando pausado */
    if (!Estado.reproduzindo && Estado.fase !== 'final') {
      Dom.player.classList.remove('oculto');
    }
  }

  /* ─────────────────────────────────────────────────────────
   *  NAVEGAR PARA CAPÍTULO ESPECÍFICO
   * ───────────────────────────────────────────────────────── */
  function irParaCapitulo(idx) {
    if (idx < 0 || idx >= TOTAL) return;
    if (Estado.fase === 'transicao') return;

    var eraReproducindo = Estado.reproduzindo;
    cancelar();
    Estado.fase = 'transicao';

    Dom.fadeOverlay.classList.add('ativo');
    setTimeout(function () {
      Estado.capitulo  = idx;
      Estado.paragrafo = 0;
      Estado.fase      = 'cena';
      montarCapituloNoDOM(idx);
      Dom.fadeOverlay.classList.remove('ativo');

      if (eraReproducindo) {
        Estado.reproduzindo = true;
        agendar(loopParagrafo, 1000 + FADE_MS);
      }
      syncBotaoPlay();
    }, FADE_MS);
  }

  /* ─────────────────────────────────────────────────────────
   *  REPLAY
   * ───────────────────────────────────────────────────────── */
  function replay() {
    Dom.telaFinal.hidden = true;
    Dom.telaCena.hidden  = false;
    Estado.fase         = 'cena';
    Estado.capitulo     = 0;
    Estado.paragrafo    = 0;
    Estado.reproduzindo = true;

    Dom.fadeOverlay.classList.add('ativo');
    montarCapituloNoDOM(0);
    setTimeout(function () {
      Dom.fadeOverlay.classList.remove('ativo');
      agendar(loopParagrafo, 1200 + FADE_MS);
    }, FADE_MS);

    syncBotaoPlay();
    mostrarControles(false);
  }

  /* ─────────────────────────────────────────────────────────
   *  FULLSCREEN
   * ───────────────────────────────────────────────────────── */
  var emFullscreen = false;

  function toggleFullscreen() {
    var enabled = document.fullscreenEnabled || document.webkitFullscreenEnabled;
    if (!enabled) return;
    try {
      if (!emFullscreen) {
        var req = Dom.filme.requestFullscreen || Dom.filme.webkitRequestFullscreen;
        if (req) req.call(Dom.filme);
      } else {
        var sair = document.exitFullscreen || document.webkitExitFullscreen;
        if (sair) sair.call(document);
      }
    } catch (e) { /* ignora erros de API de fullscreen */ }
  }

  function onFullscreenChange() {
    emFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement);
    Dom.btnFullscreen.textContent = emFullscreen ? '⊡' : '⛶';
    Dom.btnFullscreen.setAttribute('aria-label', emFullscreen ? 'Sair da tela cheia' : 'Tela cheia');
  }
  document.addEventListener('fullscreenchange', onFullscreenChange);
  document.addEventListener('webkitfullscreenchange', onFullscreenChange);

  /* ─────────────────────────────────────────────────────────
   *  AUTO-HIDE DOS CONTROLES
   *  Aparecem ao interagir e somem 3.5 s depois (só durante
   *  reprodução); ficam fixos quando pausado.
   * ───────────────────────────────────────────────────────── */
  var _hideTimer = null;

  function mostrarControles(manter) {
    Dom.player.classList.remove('oculto');
    clearTimeout(_hideTimer);
    if (!manter && Estado.reproduzindo && Estado.fase === 'cena') {
      _hideTimer = setTimeout(function () {
        if (Estado.reproduzindo && Estado.fase === 'cena') {
          Dom.player.classList.add('oculto');
        }
      }, 3500);
    }
  }

  /* ─────────────────────────────────────────────────────────
   *  EVENTOS DOS BOTÕES
   * ───────────────────────────────────────────────────────── */
  Dom.btnIniciar.addEventListener('click', iniciarFilme);

  Dom.btnPlay.addEventListener('click', function () {
    togglePlay();
    mostrarControles(true);
  });

  Dom.btnAnterior.addEventListener('click', function () {
    if (Estado.fase === 'transicao') return;
    if (Estado.fase === 'final') {
      /* Volta ao último capítulo a partir da tela final */
      Dom.telaFinal.hidden = true;
      Dom.telaCena.hidden  = false;
      Estado.fase = 'cena';
    }
    irParaCapitulo(Estado.capitulo - 1);
    mostrarControles(true);
  });

  Dom.btnProximo.addEventListener('click', function () {
    if (Estado.fase === 'transicao') return;
    if (Estado.capitulo < TOTAL - 1) {
      irParaCapitulo(Estado.capitulo + 1);
    } else {
      mostrarFinal();
    }
    mostrarControles(true);
  });

  Dom.btnFullscreen.addEventListener('click', function () {
    toggleFullscreen();
    mostrarControles(true);
  });

  Dom.btnReplay.addEventListener('click', replay);

  /* Clicar na tela de cena → toggle play/pause */
  Dom.telaCena.addEventListener('click', function (e) {
    /* Ignora cliques que chegam de botões dentro da tela */
    if (e.target !== Dom.telaCena) return;
    if (Estado.fase !== 'cena') return;
    togglePlay();
    mostrarControles(true);
  });

  /* ─────────────────────────────────────────────────────────
   *  EXIBIR CONTROLES AO MOVER MOUSE / TOCAR NA TELA
   * ───────────────────────────────────────────────────────── */
  ['mousemove', 'touchstart', 'keydown'].forEach(function (ev) {
    document.addEventListener(ev, function () {
      if (Estado.fase === 'cena' || Estado.fase === 'transicao') {
        mostrarControles(false);
      }
    }, { passive: true });
  });

  /* ─────────────────────────────────────────────────────────
   *  TECLADO
   *  Espaço  → play/pause
   *  ←       → capítulo anterior
   *  →       → próximo capítulo
   *  F       → fullscreen
   * ───────────────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    /* Na abertura, Enter ou Espaço iniciam o filme */
    if (Estado.fase === 'abertura') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        iniciarFilme();
      }
      return;
    }

    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (Estado.fase === 'cena' || Estado.fase === 'transicao') togglePlay();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (Estado.fase !== 'transicao') {
          if (Estado.capitulo < TOTAL - 1) irParaCapitulo(Estado.capitulo + 1);
          else mostrarFinal();
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (Estado.fase !== 'transicao') {
          if (Estado.fase === 'final') {
            Dom.telaFinal.hidden = true;
            Dom.telaCena.hidden  = false;
            Estado.fase = 'cena';
          }
          irParaCapitulo(Estado.capitulo - 1);
        }
        break;
      case 'f':
      case 'F':
        toggleFullscreen();
        break;
    }
  });

  /* ─────────────────────────────────────────────────────────
   *  INICIALIZAÇÃO
   * ───────────────────────────────────────────────────────── */
  (function init() {
    /* Céu de abertura */
    Dom.ceu.className = 'camada-ceu c-abertura';

    /* Posição inicial do navio */
    Dom.navio.style.left = '5%';

    /* Garante que elementos de paisagem estejam ocultos */
    Dom.ilha.classList.remove('visivel');
    Dom.farol.classList.remove('visivel');
    Dom.luzes.classList.remove('visivel');
    Dom.estrelas.classList.remove('visivel');

    /* Esconde o player até o filme começar */
    Dom.player.classList.add('oculto');

    /* Foca o botão de início para acessibilidade */
    Dom.btnIniciar.focus();
  }());

}());
