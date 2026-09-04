const CLASES_ESTADO = {

    Activo: "sigc-badge--disponible",

    Inactivo: "sigc-badge--inactiva"

};

const CLASES_ROL = {

    Administrador: "sigc-badge--mantenimiento",

    Operador: "sigc-badge--alquilada",

    Consulta: "sigc-badge--inactiva"

};

export function badgeEstado(estado) {

    const clase = CLASES_ESTADO[estado] || "sigc-badge--inactiva";

    return `<span class="sigc-badge ${clase}">${estado}</span>`;

}

export function badgeRol(rol) {

    const clase = CLASES_ROL[rol] || "sigc-badge--inactiva";

    return `<span class="sigc-badge ${clase}">${rol}</span>`;

}