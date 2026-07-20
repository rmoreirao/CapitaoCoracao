(function () {
  var story = window.CAPITAO_STORY;

  // monta a lista de páginas: capa + capítulos + fotos + assinatura
  var paginas = [];
  paginas.push({ tipo: "capa" });
  story.capitulos.forEach(function (cap) { paginas.push({ tipo: "capitulo", cap: cap }); });
  paginas.push({ tipo: "fotos" });
  paginas.push({ tipo: "assinatura" });

  var atual = 0;
  var pagina = document.getElementById("pagina");
  var contador = document.getElementById("contador");
  var btnAnt = document.getElementById("btn-ant");
  var btnProx = document.getElementById("btn-prox");

  // helpers para criar elementos com segurança (texto via textContent)
  function el(tag, className, texto) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function construir(p) {
    var frag = document.createDocumentFragment();

    if (p.tipo === "capa") {
      var capa = el("div", "capa");
      capa.appendChild(el("div", "ilustra", "⛴️❤️"));
      capa.appendChild(el("h1", null, story.titulo));
      capa.appendChild(el("p", "sub", story.subtitulo));
      capa.appendChild(el("p", "sub", "📖 Vire a página para começar"));
      frag.appendChild(capa);
      return frag;
    }

    if (p.tipo === "capitulo") {
      frag.appendChild(el("div", "ilustra", p.cap.emoji));
      frag.appendChild(el("h2", null, p.cap.titulo));
      var linhas = el("div", "linhas");
      p.cap.texto.forEach(function (t) { linhas.appendChild(el("p", null, t)); });
      frag.appendChild(linhas);
      return frag;
    }

    if (p.tipo === "fotos") {
      frag.appendChild(el("div", "ilustra", "📸"));
      frag.appendChild(el("h2", null, "A nossa família"));
      var galeria = el("div");
      galeria.id = "galeria";
      frag.appendChild(galeria);
      return frag;
    }

    // assinatura
    frag.appendChild(el("div", "ilustra", "💙"));
    frag.appendChild(el("h2", null, "Com todo o amor"));
    frag.appendChild(el("p", "assinatura-livro", story.assinatura));
    frag.appendChild(el("p", "sub", "Fim 🌊"));
    return frag;
  }

  function render() {
    pagina.textContent = "";
    pagina.appendChild(construir(paginas[atual]));
    // reinicia a animação de virar página
    pagina.style.animation = "none";
    void pagina.offsetWidth;
    pagina.style.animation = "";
    if (paginas[atual].tipo === "fotos") renderGaleriaFamilia("galeria");
    contador.textContent = (atual + 1) + " / " + paginas.length;
    btnAnt.disabled = atual === 0;
    btnProx.disabled = atual === paginas.length - 1;
  }

  btnAnt.addEventListener("click", function () { if (atual > 0) { atual--; render(); } });
  btnProx.addEventListener("click", function () { if (atual < paginas.length - 1) { atual++; render(); } });

  document.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") btnProx.click();
    if (e.key === "ArrowLeft") btnAnt.click();
  });

  render();
})();
