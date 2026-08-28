const CLASES_ESTADO = {

    Activo: "sigc-badge--disponible",

    Inactivo: "sigc-badge--inactiva"

};

export function badgeEstado(estado) {

    const clase = CLASES_ESTADO[estado] || "sigc-badge--inactiva";

    return `<span class="sigc-badge ${clase}">${estado}</span>`;

}