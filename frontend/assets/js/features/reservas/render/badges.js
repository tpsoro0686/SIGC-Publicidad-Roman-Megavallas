/**
 * ==========================================
 * Helper de badges de estado (Reservas)
 * ==========================================
 */

const CLASES_ESTADO = {

    Activa: "sigc-badge--disponible",

    Vencida: "sigc-badge--mantenimiento",

    Cancelada: "sigc-badge--inactiva",

    Convertida: "sigc-badge--alquilada"

};

export function badgeEstado(estado) {

    const clase = CLASES_ESTADO[estado] || "sigc-badge--mantenimiento";

    return `<span class="sigc-badge ${clase}">${estado}</span>`;

}