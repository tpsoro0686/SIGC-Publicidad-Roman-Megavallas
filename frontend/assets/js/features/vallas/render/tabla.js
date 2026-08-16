/**
 * ==========================================
 * Render de la tabla de vallas (desktop)
 * ==========================================
 */

import { badgeEstado } from "./badges.js";

export function renderTabla(vallas, vallaSeleccionadaId) {

    const tbody = document.getElementById("tablaVallasBody");

    tbody.innerHTML = vallas.map((valla) => `

        <tr data-id="${valla.id}" class="${valla.id === vallaSeleccionadaId ? "is-selected" : ""}">

            <td><strong>${valla.codigo}</strong></td>

            <td>${valla.provincia?.nombre ?? "-"}</td>

            <td>${valla.referencia}</td>

            <td>${valla.tamano ?? "-"}</td>

            <td>${badgeEstado(valla.estado)}</td>

            <td class="text-end">
                <button type="button" class="sigc-icon-btn" data-ver-detalle="${valla.id}" aria-label="Ver detalle">
                    <i class="lucide lucide-chevron-right"></i>
                </button>
            </td>

        </tr>

    `).join("");

}