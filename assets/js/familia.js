/*
 * Renderiza a galeria de fotos da família (placeholders).
 * Se o arquivo de foto ainda não existir, mostra a moldura "📷 Foto aqui".
 * Basta colocar as imagens reais na pasta /fotos com os nomes indicados.
 */
window.renderGaleriaFamilia = function (containerId) {
  var el = document.getElementById(containerId);
  if (!el || !window.CAPITAO_STORY) return;
  var fotos = window.CAPITAO_STORY.fotos || [];
  el.classList.add("galeria-familia");
  el.innerHTML = fotos.map(function (f) {
    return (
      '<figure class="foto-familia">' +
        '<div class="moldura">' +
          '<img alt="' + f.legenda + '" ' +
               'data-src="' + f.arquivo + '" ' +
               'onload="this.style.opacity=1" ' +
               'onerror="this.remove()" ' +
               'style="opacity:0;transition:opacity .4s">' +
        '</div>' +
        '<figcaption class="legenda">' + f.legenda + '</figcaption>' +
      '</figure>'
    );
  }).join("");
  // tenta carregar as imagens; se não existirem, o onerror remove e a moldura fica visível
  el.querySelectorAll("img[data-src]").forEach(function (img) {
    img.src = img.getAttribute("data-src");
  });
};
