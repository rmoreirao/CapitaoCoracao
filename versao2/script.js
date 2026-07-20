(function () {
  var story = window.CAPITAO_STORY;

  // monta a lista de páginas: capa + capítulos + fotos + assinatura
  var paginas = [];

  paginas.push({ tipo: "capa" });

  story.capitulos.forEach(function (cap) {
    paginas.push({ tipo: "capitulo", cap: cap });
  });

  paginas.push({ tipo: "fotos" });
  paginas.push({ tipo: "assinatura" });

  var atual = 0;
  var pagina = document.getElementById("pagina");
  var contador = document.getElementById("contador");
  var btnAnt = document.getElementById("btn-ant");
  var btnProx = document.getElementById("btn-prox");

  function html(p) {
    if (p.tipo === "capa") {
      return (
        '<div class="capa">' +
          '<div class="ilustra">⛴️❤️</div>' +
          '<h1>' + story.titulo + '</h1>' +
          '<p class="sub">' + story.subtitulo + '</p>' +
          '<p class="sub">📖 Vire a página para começar</p>' +
        '</div>'
      );
    }
    if (p.tipo === "capitulo") {
      return (
        '<div class="ilustra">' + p.cap.emoji + '</div>' +
        '<h2>' + p.cap.titulo + '</h2>' +
        '<div class="linhas">' +
          p.cap.texto.map(function (t) { return "<p>" + t + "</p>"; }).join("") +
        '</div>'
      );
    }
    if (p.tipo === "fotos") {
      return (
        '<div class="ilustra">📸</div>' +
        '<h2>A nossa família</h2>' +
        '<div id="galeria"></div>'
      );
    }
    // assinatura
    return (
      '<div class="ilustra">💙</div>' +
      '<h2>Com todo o amor</h2>' +
      '<p class="assinatura-livro">' + story.assinatura + '</p>' +
      '<p class="sub">Fim 🌊</p>'
    );
  }

  function render() {
    pagina.innerHTML = html(paginas[atual]);
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
