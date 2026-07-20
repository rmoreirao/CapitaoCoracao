/*
 * Renderiza a galeria de fotos da família (placeholders).
 * Se o arquivo de foto ainda não existir, mostra a moldura "📷 Foto aqui".
 * Basta colocar as imagens reais na pasta /fotos com os nomes indicados.
 *
 * Usa APIs de DOM (createElement / textContent / setAttribute) em vez de
 * innerHTML, evitando qualquer reinterpretação de texto como HTML.
 */
window.renderGaleriaFamilia = function (containerId) {
  var el = document.getElementById(containerId);
  if (!el || !window.CAPITAO_STORY) return;
  var fotos = window.CAPITAO_STORY.fotos || [];

  el.classList.add("galeria-familia");
  el.textContent = "";

  fotos.forEach(function (f) {
    var figure = document.createElement("figure");
    figure.className = "foto-familia";

    var moldura = document.createElement("div");
    moldura.className = "moldura";

    var img = document.createElement("img");
    img.alt = f.legenda;
    img.style.opacity = "0";
    img.style.transition = "opacity .4s";
    img.addEventListener("load", function () { img.style.opacity = "1"; });
    // se o arquivo ainda não existir, remove a imagem e a moldura placeholder aparece
    img.addEventListener("error", function () { img.remove(); });
    img.src = f.arquivo;
    moldura.appendChild(img);

    var legenda = document.createElement("figcaption");
    legenda.className = "legenda";
    legenda.textContent = f.legenda;

    figure.appendChild(moldura);
    figure.appendChild(legenda);
    el.appendChild(figure);
  });
};
