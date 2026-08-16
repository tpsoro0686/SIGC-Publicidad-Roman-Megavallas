/**
 * ==========================================
 * Render de tarjetas de vallas (móvil)
 * ==========================================
 */

import { badgeEstado } from "./badges.js";

export function renderTarjetas(vallas) {

    const contenedor = document.getElementById("listaVallasMovil");

    contenedor.innerHTML = vallas.map((valla) => `

        <div class="sigc-valla-card" data-id="${valla.id}">

            <div class="sigc-valla-card__top">
                <span class="sigc-valla-card__codigo">${valla.codigo}</span>
                ${badgeEstado(valla.estado)}
            </div>

            <div class="sigc-valla-card__referencia">${valla.referencia}</div>

            <div class="sigc-valla-card__meta">
                <span>${valla.provincia?.nombre ?? "-"}</span>
                <span>${valla.tamano ?? "-"}</span>
            </div>

        </div>

    `).join("");

}