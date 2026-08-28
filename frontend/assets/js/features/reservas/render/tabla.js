/**
 * ==========================================
 * Render de la tabla de reservas (desktop)
 * ==========================================
 */

import { badgeEstado } from "./badges.js";

export function renderTabla(reservas) {

    const tbody = document.getElementById("tablaReservasBody");

    tbody.innerHTML = reservas.map((reserva) => `

        <tr data-id="${reserva.id}">

            <td>
                <strong>${reserva.valla.codigo}</strong>
                <div class="text-muted small">${reserva.valla.referencia}</div>
            </td>

            <td>${reserva.cliente.nombre}</td>

            <td>${reserva.usuario.nombre}</td>

            <td>${reserva.fecha_reserva}</td>

            <td>${reserva.fecha_vencimiento}</td>

            <td>${reserva.dias_restantes !== null ? `${reserva.dias_restantes} d.` : "-"}</td>

            <td>${badgeEstado(reserva.estado)}</td>

            <td class="text-end">
                ${reserva.estado === "Activa" ? `
                    <button type="button" class="btn btn-sm btn-outline-secondary" data-cancelar="${reserva.id}">Cancelar</button>
                    <button type="button" class="btn btn-sm sigc-btn-success" data-convertir="${reserva.id}">Convertir</button>
                ` : ""}
            </td>

        </tr>

    `).join("");

}