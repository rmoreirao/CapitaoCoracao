/* =========================================================
 *  Versão 8 — O Filme
 *  audio.js — ambiente sonoro sintetizado (Web Audio)
 *
 *  Sem arquivos de áudio: ondas e vento são ruído filtrado,
 *  o motor é um oscilador grave, o sino e o batimento são
 *  envelopes curtos. Começa MUDO — o contexto só é criado
 *  depois de um clique, respeitando a política de autoplay.
 * ========================================================= */
window.AudioFilme = (function () {
  'use strict';

  var ctx = null, pronto = false, ligado = false, falhou = false;
  var mestre, nos = {};
  var alvos = { ondas: 0, vento: 0, motor: 0 };
  var batimentoTimer = null;

  function agora() { return ctx ? ctx.currentTime : 0; }

  function bufferRuido(segundos) {
    var taxa = ctx.sampleRate, n = Math.floor(taxa * segundos);
    var buf = ctx.createBuffer(1, n, taxa), dados = buf.getChannelData(0);
    var b0 = 0, b1 = 0, b2 = 0, i, branco;
    for (i = 0; i < n; i++) {
      branco = Math.random() * 2 - 1;
      /* aproximação de ruído rosa (mais grave, som de mar) */
      b0 = 0.99765 * b0 + branco * 0.0990460;
      b1 = 0.96300 * b1 + branco * 0.2965164;
      b2 = 0.57000 * b2 + branco * 1.0526913;
      dados[i] = (b0 + b1 + b2 + branco * 0.1848) * 0.22;
    }
    return buf;
  }

  function fonteRuido(buf) {
    var s = ctx.createBufferSource();
    s.buffer = buf;
    s.loop = true;
    s.start(0);
    return s;
  }

  function construir() {
    var Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) { falhou = true; return false; }
    try {
      ctx = new Ctx();
      var ruido = bufferRuido(3);

      mestre = ctx.createGain();
      mestre.gain.value = 0;
      mestre.connect(ctx.destination);

      /* ── ondas: ruído rosa em passa-baixa com LFO de "respiração" ── */
      var ondasFiltro = ctx.createBiquadFilter();
      ondasFiltro.type = 'lowpass';
      ondasFiltro.frequency.value = 620;
      var ondasGanho = ctx.createGain();
      ondasGanho.gain.value = 0;
      fonteRuido(ruido).connect(ondasFiltro);
      ondasFiltro.connect(ondasGanho).connect(mestre);

      var lfo = ctx.createOscillator();
      lfo.frequency.value = 0.14;
      var lfoGanho = ctx.createGain();
      lfoGanho.gain.value = 0.45;
      lfo.connect(lfoGanho).connect(ondasGanho.gain);
      lfo.start(0);

      /* ── vento: ruído em passa-banda agudo ── */
      var ventoFiltro = ctx.createBiquadFilter();
      ventoFiltro.type = 'bandpass';
      ventoFiltro.frequency.value = 900;
      ventoFiltro.Q.value = 0.7;
      var ventoGanho = ctx.createGain();
      ventoGanho.gain.value = 0;
      fonteRuido(ruido).connect(ventoFiltro);
      ventoFiltro.connect(ventoGanho).connect(mestre);

      /* ── motor: oscilador grave ── */
      var motorOsc = ctx.createOscillator();
      motorOsc.type = 'sawtooth';
      motorOsc.frequency.value = 42;
      var motorFiltro = ctx.createBiquadFilter();
      motorFiltro.type = 'lowpass';
      motorFiltro.frequency.value = 180;
      var motorGanho = ctx.createGain();
      motorGanho.gain.value = 0;
      motorOsc.connect(motorFiltro).connect(motorGanho).connect(mestre);
      motorOsc.start(0);

      nos = {
        ondasGanho: ondasGanho, ondasFiltro: ondasFiltro,
        ventoGanho: ventoGanho, motorGanho: motorGanho, motorOsc: motorOsc
      };
      pronto = true;
      return true;
    } catch (e) {
      falhou = true;
      return false;
    }
  }

  function rampa(param, valor, segundos) {
    if (!ctx) return;
    try {
      param.cancelScheduledValues(agora());
      param.setValueAtTime(param.value, agora());
      param.linearRampToValueAtTime(valor, agora() + (segundos == null ? 1.5 : segundos));
    } catch (e) { /* silencioso */ }
  }

  function sincronizar(instantaneo) {
    if (!pronto) return;
    var s = instantaneo ? 0.05 : 1.6;
    rampa(nos.ondasGanho.gain, alvos.ondas * 0.9, s);
    rampa(nos.ventoGanho.gain, alvos.vento * 0.5, s);
    rampa(nos.motorGanho.gain, alvos.motor * 0.35, s);
  }

  /* ── sons pontuais ── */

  function envelope(freq, tipo, dur, pico) {
    if (!pronto || !ligado) return;
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = tipo || 'sine';
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, agora());
    g.gain.exponentialRampToValueAtTime(pico || 0.12, agora() + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, agora() + dur);
    osc.connect(g).connect(mestre);
    osc.start();
    osc.stop(agora() + dur + 0.05);
  }

  function sino() { envelope(880, 'sine', 2.6, 0.10); envelope(1320, 'sine', 1.8, 0.05); }
  function nota() { envelope(146.8, 'sine', 4.5, 0.09); envelope(220, 'sine', 4.0, 0.05); }

  function gaivota() {
    if (!pronto || !ligado) return;
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1250, agora());
    osc.frequency.exponentialRampToValueAtTime(720, agora() + 0.35);
    g.gain.setValueAtTime(0.0001, agora());
    g.gain.exponentialRampToValueAtTime(0.05, agora() + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, agora() + 0.4);
    osc.connect(g).connect(mestre);
    osc.start();
    osc.stop(agora() + 0.45);
  }

  function batida(forca) {
    envelope(58, 'sine', 0.35, 0.10 + forca * 0.3);
  }

  function batimento(forca) {
    pararBatimento();
    if (!forca) return;
    batimentoTimer = setInterval(function () {
      batida(forca);
      setTimeout(function () { batida(forca * 0.6); }, 260);
    }, 1100);
  }

  function pararBatimento() {
    if (batimentoTimer) { clearInterval(batimentoTimer); batimentoTimer = null; }
  }

  /* ── API ── */

  function aplicar(ev, instantaneo) {
    if (ev.ondas != null) alvos.ondas = ev.ondas;
    if (ev.vento != null) alvos.vento = ev.vento;
    if (ev.motor != null) alvos.motor = ev.motor;
    if (ev.abafado != null && pronto) {
      rampa(nos.ondasFiltro.frequency, ev.abafado ? 260 : 620, 2);
    }
    sincronizar(instantaneo);

    if (!instantaneo && ligado) {
      if (ev.sino) sino();
      if (ev.gaivota) gaivota();
      if (ev.nota) nota();
    }
    if (ev.batimento != null) {
      if (ligado) batimento(ev.batimento); else pararBatimento();
      alvos.batimento = ev.batimento;
    }
  }

  function ligar() {
    if (falhou) return false;
    if (!pronto && !construir()) return false;
    if (ctx.state === 'suspended') ctx.resume();
    ligado = true;
    rampa(mestre.gain, 0.9, 1.2);
    sincronizar(false);
    if (alvos.batimento) batimento(alvos.batimento);
    return true;
  }

  function desligar() {
    ligado = false;
    pararBatimento();
    if (pronto) rampa(mestre.gain, 0, 0.6);
  }

  function alternar() {
    if (ligado) { desligar(); return false; }
    return ligar();
  }

  function reset() {
    alvos = { ondas: 0, vento: 0, motor: 0, batimento: 0 };
    pararBatimento();
    sincronizar(true);
  }

  return {
    aplicar: aplicar, ligar: ligar, desligar: desligar, alternar: alternar,
    reset: reset,
    estaLigado: function () { return ligado; },
    disponivel: function () { return !falhou; }
  };
})();
