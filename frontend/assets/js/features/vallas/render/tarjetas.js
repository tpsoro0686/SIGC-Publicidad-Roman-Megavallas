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

            <div class="d-flex gap-1 mt-2">

                                <button type="button" class="sigc-icon-btn sigc-icon-btn--editar" data-editar="${valla.id}" title="Editar" aria-label="Editar">
                    <i data-lucide="pencil"></i>
                </button>

                <button type="button" class="sigc-icon-btn sigc-icon-btn--archivar" data-archivar="${valla.id}" title="Archivar" aria-label="Archivar" ${valla.estado === "Inactiva" ? "disabled" : ""}>
                    <i data-lucide="archive"></i>
                </button>

                <button type="button" class="sigc-icon-btn sigc-icon-btn--reservar" data-reservar="${valla.id}" title="Reservar" aria-label="Reservar" ${valla.estado !== "Disponible" ? "disabled" : ""}>
                    <i data-lucide="calendar-plus"></i>
                </button>

                <button type="button" class="sigc-icon-btn sigc-icon-btn--contrato" data-contrato="${valla.id}" title="Generar contrato" aria-label="Generar contrato" ${valla.estado !== "Disponible" ? "disabled" : ""}>
                    <i data-lucide="file-text"></i>
                </button>

            </div>

        </div>

    `).join("");

}