/**
 * ==========================================
 * Helper de badges de estado
 * ==========================================
 */

const CLASES_ESTADO = {

    Disponible: "sigc-badge--disponible",

    Reservada: "sigc-badge--reservada",

    Alquilada: "sigc-badge--alquilada",

    Mantenimiento: "sigc-badge--mantenimiento",

    Inactiva: "sigc-badge--inactiva"

};

export function badgeEstado(estado) {

    const clase = CLASES_ESTADO[estado] || "sigc-badge--mantenimiento";

    return `<span class="sigc-badge ${clase}">${estado}</span>`;

}