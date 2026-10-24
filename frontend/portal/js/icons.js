/**
 * Íconos en línea (SVG), sin librerías externas.
 */

const TRAZOS = {

    buscar: "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-3.5-3.5\"/>",

    lista: "<path d=\"M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z\"/>",

    cerrar: "<path d=\"M6 6l12 12M18 6 6 18\"/>",

    mas: "<path d=\"M12 5v14M5 12h14\"/>",

    check: "<path d=\"m5 12.5 4.5 4.5L19 7.5\"/>",

    izquierda: "<path d=\"m15 5-7 7 7 7\"/>",

    derecha: "<path d=\"m9 5 7 7-7 7\"/>",

    basura: "<path d=\"M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3\"/>",

    pin: "<path d=\"M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/>",

    externo: "<path d=\"M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5\"/>",

    cartel: "<rect x=\"3\" y=\"4\" width=\"18\" height=\"10\" rx=\"1.5\"/><path d=\"M12 14v7M8 21h8\"/>"

};

export function icono(nombre, clase = "icono") {

    return `<svg class="${clase}" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${TRAZOS[nombre] ?? ""}</svg>`;

}

// Rellena los elementos <span data-icono="nombre"> del HTML estático
export function pintarIconosEstaticos(raiz = document) {

    raiz.querySelectorAll("[data-icono]").forEach((el) => {

        el.innerHTML = icono(el.dataset.icono);

    });

}
