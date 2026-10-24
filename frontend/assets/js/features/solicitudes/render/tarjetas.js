/**
 * ==========================================
 * Render de tarjetas de solicitudes (móvil)
 * ==========================================
 */

import { badgeEstado, badgePago } from "./badges.js";

import { esc, soloFecha } from "../../../core/helpers/html.js";

export function renderTarjetas(solicitudes) {

    const contenedor = document.getElementById("listaSolicitudesMovil");

    contenedor.innerHTML = solicitudes.map((solicitud) => `

        <div class="sigc-valla-card" data-ver="${solicitud.id}">

            <div class="sigc-valla-card__top">
                <span class="sigc-valla-card__codigo">${esc(solicitud.codigo)}</span>
                ${badgeEstado(solicitud.estado)}
            </div>

            <div class="sigc-valla-card__referencia">
                ${esc(solicitud.nombre)}${solicitud.empresa ? ` · ${esc(solicitud.empresa)}` : ""}
            </div>

            <div class="sigc-valla-card__meta">
                <span>${(solicitud.vallas ?? []).length} valla(s) · ${esc(soloFecha(solicitud.created_at))}</span>
                <span>${esc(solicitud.ejecutivo?.nombre ?? "Sin asignar")}</span>
            </div>

            <div class="mt-2">${badgePago(solicitud)}</div>

        </div>

    `).join("");

}
