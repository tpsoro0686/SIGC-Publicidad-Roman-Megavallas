/**
 * ==========================================
 * Render de tarjetas de reservas (móvil)
 * ==========================================
 */

import { badgeEstado } from "./badges.js";

export function renderTarjetas(reservas) {

    const contenedor = document.getElementById("listaReservasMovil");

    contenedor.innerHTML = reservas.map((reserva) => `

        <div class="sigc-valla-card" data-id="${reserva.id}">

            <div class="sigc-valla-card__top">
                <span class="sigc-valla-card__codigo">${reserva.valla.codigo}</span>
                ${badgeEstado(reserva.estado)}
            </div>

            <div class="sigc-valla-card__referencia">${reserva.cliente.nombre}</div>

            <div class="sigc-valla-card__meta">
                <span>Vence: ${reserva.fecha_vencimiento}</span>
                <span>${reserva.usuario.nombre}</span>
            </div>

            ${reserva.estado === "Activa" ? `
                <div class="d-flex gap-2 mt-2">
                    <button type="button" class="btn btn-sm btn-outline-secondary flex-fill" data-cancelar="${reserva.id}">Cancelar</button>
                    <button type="button" class="btn btn-sm sigc-btn-success flex-fill" data-convertir="${reserva.id}">Convertir</button>
                </div>
            ` : ""}

        </div>

    `).join("");

}