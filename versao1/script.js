(function () {
  var story = window.CAPITAO_STORY;
  var caps = story.capitulos;
  var indice = 0;

  var abertura = document.getElementById("abertura");
  var cenaCap = document.getElementById("capitulo");
  var final = document.getElementById("final");

  var capEmoji = document.getElementById("cap-emoji");
  var capTitulo = document.getElementById("cap-titulo");
  var capTexto = document.getElementById("cap-texto");
  var progresso = document.getElementById("progresso");
  var btnVoltar = document.getElementById("btn-voltar");

  function mostra(cena) {
    [abertura, cenaCap, final].forEach(function (c) { c.classList.remove("ativa"); });
    cena.classList.add("ativa");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function render() {
    var cap = caps[indice];
    capEmoji.textContent = cap.emoji;
    capTitulo.textContent = cap.titulo;
    capTexto.textContent = "";
    cap.texto.forEach(function (linha, i) {
      var p = document.createElement("p");
      p.textContent = linha;
      p.style.animationDelay = (i * 0.18) + "s";
      capTexto.appendChild(p);
    });
    progresso.style.width = ((indice + 1) / caps.length * 100) + "%";
    btnVoltar.disabled = indice === 0;
    btnVoltar.style.visibility = indice === 0 ? "hidden" : "visible";
  }

  document.getElementById("btn-comecar").addEventListener("click", function () {
    indice = 0;
    render();
    mostra(cenaCap);
  });

  document.getElementById("btn-continuar").addEventListener("click", function () {
    if (indice < caps.length - 1) {
      indice++;
      render();
    } else {
      document.getElementById("assinatura").textContent = story.assinatura;
      renderGaleriaFamilia("galeria");
      mostra(final);
    }
  });

  btnVoltar.addEventListener("click", function () {
    if (indice > 0) { indice--; render(); }
  });

  document.getElementById("btn-reiniciar").addEventListener("click", function () {
    indice = 0;
    render();
    mostra(cenaCap);
  });
})();
