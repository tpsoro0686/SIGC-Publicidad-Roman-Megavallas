import { badgeEstado } from "./badges.js";

export function renderTarjetas(clientes) {

    const contenedor = document.getElementById("listaClientesMovil");

    contenedor.innerHTML = clientes.map((cliente) => `

        <div class="sigc-valla-card" data-id="${cliente.id}">

            <div class="sigc-valla-card__top">
                <span class="sigc-valla-card__codigo">${cliente.nombre}</span>
                ${badgeEstado(cliente.estado)}
            </div>

            <div class="sigc-valla-card__referencia">${cliente.cedula}</div>

            <div class="sigc-valla-card__meta">
                <span>${cliente.telefono ?? "-"}</span>
                <span>${cliente.reservas_count} res. · ${cliente.contratos_count} contr.</span>
            </div>

                        <div class="d-flex gap-1 mt-2">

                <button type="button" class="sigc-icon-btn sigc-icon-btn--editar" data-editar="${cliente.id}" title="Editar" aria-label="Editar">
                    <i data-lucide="pencil"></i>
                </button>

                <button type="button" class="sigc-icon-btn sigc-icon-btn--archivar" data-toggle-estado="${cliente.id}" title="${cliente.estado === "Activo" ? "Inactivar" : "Reactivar"}" aria-label="Cambiar estado">
                    <i data-lucide="${cliente.estado === "Activo" ? "archive" : "rotate-ccw"}"></i>
                </button>

            </div>

        </div>

    `).join("");

}