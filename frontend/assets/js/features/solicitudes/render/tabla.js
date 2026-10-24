/**
 * ==========================================
 * Render de la tabla de solicitudes (desktop)
 * ==========================================
 */

import { badgeEstado, badgePago } from "./badges.js";

import { esc, soloFecha } from "../../../core/helpers/html.js";

export function renderTabla(solicitudes) {

    const tbody = document.getElementById("tablaSolicitudesBody");

    tbody.innerHTML = solicitudes.map((solicitud) => `

        <tr data-ver="${solicitud.id}" class="sigc-fila-click">

            <td>
                <strong>${esc(solicitud.codigo)}</strong>
                <div class="text-muted small">${esc(soloFecha(solicitud.created_at))}</div>
            </td>

            <td>
                <strong>${esc(solicitud.nombre)}</strong>
                <div class="text-muted small">${esc(solicitud.empresa || "Sin empresa")}</div>
            </td>

            <td>
                <div>${esc(solicitud.telefono)}</div>
                <div class="text-muted small">${esc(solicitud.correo)}</div>
            </td>

            <td>${(solicitud.vallas ?? []).length}</td>

            <td>${esc(solicitud.ejecutivo?.nombre ?? "Sin asignar")}</td>

            <td>${badgePago(solicitud)}</td>

            <td>${badgeEstado(solicitud.estado)}</td>

            <td class="text-end">
                <button type="button" class="btn btn-sm btn-outline-secondary" data-ver="${solicitud.id}">Ver</button>
            </td>

        </tr>

    `).join("");

}
