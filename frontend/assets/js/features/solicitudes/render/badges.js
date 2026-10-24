/**
 * ==========================================
 * Badges de la bandeja de solicitudes
 * ==========================================
 */

import { esc, usd } from "../../../core/helpers/html.js";

const CLASES_ESTADO = {

    "Nueva": "sigc-badge--reservada",

    "En seguimiento": "sigc-badge--alquilada",

    "Cerrada": "sigc-badge--mantenimiento"

};

export function badgeEstado(estado) {

    const clase = CLASES_ESTADO[estado] || "sigc-badge--mantenimiento";

    return `<span class="sigc-badge ${clase}">${esc(estado)}</span>`;

}

// Suma de lo que el cliente ya pagó (solo pagos en estado "Pagado")
export function totalPagado(solicitud) {

    return (solicitud.pagos ?? [])

        .filter((pago) => pago.estado === "Pagado")

        .reduce((suma, pago) => suma + Number(pago.monto), 0);

}

export function badgePago(solicitud) {

    const pagado = totalPagado(solicitud);

    if (pagado > 0) {

        return `<span class="sigc-badge sigc-badge--disponible">Pagado ${esc(usd(pagado))}</span>`;

    }

    if ((solicitud.pagos ?? []).some((pago) => pago.estado === "Pendiente")) {

        return `<span class="sigc-badge sigc-badge--reservada">Pago pendiente</span>`;

    }

    return `<span class="text-muted small">Sin pago</span>`;

}
