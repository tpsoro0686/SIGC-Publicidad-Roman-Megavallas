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
                <div class="d-inline-flex gap-1">

                                        <button type="button" class="sigc-icon-btn sigc-icon-btn--editar" data-editar="${valla.id}" title="Editar" aria-label="Editar">
                        <i data-lucide="pencil"></i>
                    </button>

                    <button type="button" class="sigc-icon-btn sigc-icon-btn--archivar" data-archivar="${valla.id}" title="Archivar" aria-label="Archivar" ${valla.estado === "Inactiva" ? "disabled" : ""}>
                        <i data-lucide="archive"></i>
                    </button>

                    <button type="button" class="sigc-icon-btn sigc-icon-btn--reservar" data-reservar="${valla.id}" title="Reservar" aria-label="Reservar" ${valla.estado !== "Disponible" ? "disabled" : ""}>
                        <i data-lucide="calendar-plus"></i>
                    </button>

                    <button type="button" class="sigc-icon-btn sigc-icon-btn--contrato" data-contrato="${valla.id}" title="Generar contrato" aria-label="Generar contrato">
                        <i data-lucide="file-text"></i>
                    </button>

                </div>
            </td>

        </tr>

    `).join("");

}