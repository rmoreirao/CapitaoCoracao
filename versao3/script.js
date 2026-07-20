(function () {
  var story = window.CAPITAO_STORY;
  var palco = document.getElementById("palco");

  // emoji de avatar para cada narrador
  var avatares = {
    "Esposa": "👵",
    "Filho 1": "🧑",
    "Filho 2": "👨",
    "Filho 3": "🧔",
    "Filho 4": "👨‍🦱",
    "Nora 1": "👩",
    "Nora 2": "👩‍🦰",
    "Nora 3": "👩‍🦳",
    "Os dois netos": "🧒👦"
  };

  function el(tag, className, texto) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (texto != null) e.textContent = texto;
    return e;
  }

  story.capitulos.forEach(function (cap) {
    var avatar = avatares[cap.narrador] || "🙂";

    var article = el("article", "fala");
    article.appendChild(el("div", "avatar", avatar));

    var balao = el("div", "balao");
    balao.appendChild(el("span", "quem", cap.narrador));
    balao.appendChild(el("div", "tema", cap.emoji + " " + cap.titulo));
    cap.texto.forEach(function (t) { balao.appendChild(el("p", null, t)); });

    article.appendChild(balao);
    palco.appendChild(article);
  });

  // revela cada fala conforme aparece na tela
  var falas = Array.prototype.slice.call(document.querySelectorAll(".fala"));
  var encerramento = document.getElementById("encerramento");

  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("visivel");
          obs.unobserve(e.target);
          if (e.target === falas[falas.length - 1]) revelaFinal();
        }
      });
    }, { threshold: 0.25 });
    falas.forEach(function (f) { obs.observe(f); });
  } else {
    falas.forEach(function (f) { f.classList.add("visivel"); });
    revelaFinal();
  }

  var finalPronto = false;
  function revelaFinal() {
    if (finalPronto) return;
    finalPronto = true;
    document.getElementById("assinatura").textContent = story.assinatura;
    renderGaleriaFamilia("galeria");
    encerramento.hidden = false;
  }
})();
