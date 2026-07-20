(function () {
  var story = window.CAPITAO_STORY;
  var indice = -1;
  var cena = document.getElementById("cena");
  var final = document.getElementById("final");
  var anterior = document.getElementById("anterior");
  var proximo = document.getElementById("proximo");
  var navio = document.getElementById("navio");

  function animarCena() {
    cena.classList.remove("troca");
    void cena.offsetWidth;
    cena.classList.add("troca");
    navio.classList.remove("viajando");
    void navio.offsetWidth;
    navio.classList.add("viajando");
  }

  function render() {
    var cap = story.capitulos[indice];
    document.getElementById("numero").textContent = "Capítulo " + (indice + 1) + " de " + story.capitulos.length;
    document.getElementById("emoji").textContent = cap.emoji;
    document.getElementById("titulo").textContent = cap.titulo;
    var texto = document.getElementById("texto");
    texto.textContent = "";
    cap.texto.forEach(function (linha, i) {
      var p = document.createElement("p");
      p.textContent = linha;
      p.style.animationDelay = (i * .08) + "s";
      texto.appendChild(p);
    });
    document.getElementById("progresso").style.width = ((indice + 1) / story.capitulos.length * 100) + "%";
    navio.style.setProperty("--destino", (8 + indice * 8.5) + "vw");
    anterior.disabled = indice === 0;
    proximo.textContent = indice === story.capitulos.length - 1 ? "Chegar ao porto 🏡" : "Continuar viagem ➡";
    animarCena();
  }

  proximo.addEventListener("click", function () {
    if (indice < story.capitulos.length - 1) {
      indice++;
      render();
      return;
    }
    cena.hidden = true;
    document.getElementById("assinatura").textContent = story.assinatura;
    renderGaleriaFamilia("galeria");
    final.hidden = false;
  });

  anterior.addEventListener("click", function () {
    if (indice > 0) {
      indice--;
      render();
    }
  });
})();
