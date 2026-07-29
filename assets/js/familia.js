/*
 * Renderiza a galeria de fotos da família.
 *
 * A lista de fotos vem de `window.CAPITAO_FOTOS` (arquivo `fotos/fotos.js`,
 * gerado automaticamente por `tools/gerar-fotos.mjs` a partir do conteúdo da
 * pasta /fotos). Não é preciso editar código para adicionar ou remover fotos.
 *
 * Se ainda não houver nenhuma foto, mostra as molduras "📷 Foto aqui".
 *
 * Usa APIs de DOM (createElement / textContent / setAttribute) em vez de
 * innerHTML, evitando qualquer reinterpretação de texto como HTML.
 */
window.renderGaleriaFamilia = function (containerId) {
  var el = document.getElementById(containerId);
  if (!el) return;

  var fotos = window.CAPITAO_FOTOS;
  if (!fotos || !fotos.length) {
    // compatibilidade: lista manual antiga, se existir
    fotos = (window.CAPITAO_STORY && window.CAPITAO_STORY.fotos) || [];
  }

  el.classList.add("galeria-familia");
  el.textContent = "";

  function criarFigura(f) {
    var figure = document.createElement("figure");
    figure.className = "foto-familia";

    var moldura = document.createElement("div");
    moldura.className = "moldura";

    if (!f) {
      moldura.classList.add("sem-foto");
      figure.appendChild(moldura);
      return figure;
    }

    var img = document.createElement("img");
    img.alt = f.legenda || "Foto da família";
    img.loading = "lazy";
    img.decoding = "async";
    if (f.width && f.height) {
      img.width = f.width;
      img.height = f.height;
    }
    img.style.opacity = "0";
    img.style.transition = "opacity .4s";
    img.addEventListener("load", function () { img.style.opacity = "1"; });
    // se o arquivo não carregar, mostra a moldura placeholder no lugar
    img.addEventListener("error", function () {
      img.remove();
      moldura.classList.add("sem-foto");
    });
    img.src = f.src || ("../fotos/" + encodeURIComponent(f.arquivo));
    moldura.appendChild(img);
    figure.appendChild(moldura);

    if (f.legenda) {
      var legenda = document.createElement("figcaption");
      legenda.className = "legenda";
      legenda.textContent = f.legenda;
      figure.appendChild(legenda);
    }

    return figure;
  }

  if (!fotos.length) {
    // ainda sem fotos: mantém algumas molduras de exemplo
    for (var i = 0; i < 6; i++) el.appendChild(criarFigura(null));
    return;
  }

  fotos.forEach(function (f) {
    el.appendChild(criarFigura(f));
  });
};
