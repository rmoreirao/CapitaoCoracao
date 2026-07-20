(function () {
  var story = window.CAPITAO_STORY;
  var capitulos = document.getElementById("capitulos");
  var barco = document.getElementById("barco");

  story.capitulos.forEach(function (cap, i) {
    var artigo = document.createElement("article");
    artigo.className = "memoria";

    var icone = document.createElement("div");
    icone.className = "icone";
    icone.textContent = cap.emoji;
    artigo.appendChild(icone);

    var numero = document.createElement("span");
    numero.className = "numero";
    numero.textContent = "Memória " + (i + 1);
    artigo.appendChild(numero);

    var titulo = document.createElement("h2");
    titulo.textContent = cap.titulo;
    artigo.appendChild(titulo);

    cap.texto.forEach(function (linha) {
      var p = document.createElement("p");
      p.textContent = linha;
      artigo.appendChild(p);
    });
    capitulos.appendChild(artigo);
  });

  var memorias = document.querySelectorAll(".memoria");
  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) entrada.target.classList.add("visivel");
      });
    }, { threshold: .25 });
    memorias.forEach(function (memoria) { observador.observe(memoria); });
  } else {
    memorias.forEach(function (memoria) { memoria.classList.add("visivel"); });
  }

  function moverBarco() {
    var altura = document.documentElement.scrollHeight - window.innerHeight;
    var progresso = altura > 0 ? window.scrollY / altura : 0;
    barco.style.left = (6 + progresso * 68) + "%";
  }

  window.addEventListener("scroll", moverBarco, { passive: true });
  document.getElementById("assinatura").textContent = story.assinatura;
  renderGaleriaFamilia("galeria");
  moverBarco();
})();
