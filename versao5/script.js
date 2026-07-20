(function () {
  var story = window.CAPITAO_STORY;
  var indice = -1;
  var portos = document.getElementById("portos");
  var pergaminho = document.getElementById("pergaminho");
  var navio = document.getElementById("navio");
  var anterior = document.getElementById("anterior");
  var proximo = document.getElementById("proximo");

  story.capitulos.forEach(function (cap, i) {
    var botao = document.createElement("button");
    botao.className = "porto-mapa";
    botao.type = "button";
    botao.setAttribute("aria-label", "Abrir capítulo " + (i + 1) + ": " + cap.titulo);
    var icone = document.createElement("span");
    icone.className = "icone";
    icone.textContent = cap.emoji;
    botao.appendChild(icone);
    botao.appendChild(document.createTextNode("Porto " + (i + 1)));
    botao.addEventListener("click", function () { abrir(i); });
    portos.appendChild(botao);
  });

  function abrir(novoIndice) {
    indice = novoIndice;
    var cap = story.capitulos[indice];
    document.getElementById("capitulo").textContent = "Porto " + (indice + 1) + " de " + story.capitulos.length;
    document.getElementById("simbolo").textContent = cap.emoji;
    document.getElementById("titulo").textContent = cap.titulo;
    var texto = document.getElementById("texto");
    texto.textContent = "";
    cap.texto.forEach(function (linha) {
      var p = document.createElement("p");
      p.textContent = linha;
      texto.appendChild(p);
    });

    var botoes = document.querySelectorAll(".porto-mapa");
    botoes.forEach(function (botao) { botao.classList.remove("ativo"); });
    botoes[indice].classList.add("ativo");
    var mapa = document.querySelector(".mapa").getBoundingClientRect();
    var destino = botoes[indice].getBoundingClientRect();
    navio.style.left = (destino.left - mapa.left + destino.width / 2 - 25) + "px";
    navio.style.top = (destino.top - mapa.top - 42) + "px";
    anterior.disabled = indice === 0;
    proximo.textContent = indice === story.capitulos.length - 1 ? "Encontrar o tesouro 🎁" : "Próximo porto ➡";
    pergaminho.classList.remove("aberto");
    void pergaminho.offsetWidth;
    pergaminho.classList.add("aberto");
  }

  anterior.addEventListener("click", function () {
    if (indice > 0) abrir(indice - 1);
  });

  proximo.addEventListener("click", function () {
    if (indice < story.capitulos.length - 1) {
      abrir(indice + 1);
      return;
    }
    pergaminho.hidden = true;
    document.getElementById("assinatura").textContent = story.assinatura;
    renderGaleriaFamilia("galeria");
    document.getElementById("tesouro").hidden = false;
  });
})();
