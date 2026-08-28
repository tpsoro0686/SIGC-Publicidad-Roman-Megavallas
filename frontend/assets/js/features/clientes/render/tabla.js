import { badgeEstado } from "./badges.js";

export function renderTabla(clientes) {

    const tbody = document.getElementById("tablaClientesBody");

    tbody.innerHTML = clientes.map((cliente) => `

        <tr data-id="${cliente.id}">

            <td><strong>${cliente.nombre}</strong></td>

            <td>${cliente.cedula}</td>

            <td>${cliente.telefono ?? "-"}</td>

            <td>${cliente.reservas_count} reserva(s) · ${cliente.contratos_count} contrato(s)</td>

            <td>${badgeEstado(cliente.estado)}</td>

                        <td class="text-end">
                <div class="d-inline-flex gap-1">

                    <button type="button" class="sigc-icon-btn sigc-icon-btn--editar" data-editar="${cliente.id}" title="Editar" aria-label="Editar">
                        <i data-lucide="pencil"></i>
                    </button>

                    <button type="button" class="sigc-icon-btn sigc-icon-btn--archivar" data-toggle-estado="${cliente.id}" title="${cliente.estado === "Activo" ? "Inactivar" : "Reactivar"}" aria-label="Cambiar estado">
                        <i data-lucide="${cliente.estado === "Activo" ? "archive" : "rotate-ccw"}"></i>
                    </button>

                </div>
            </td>

        </tr>

    `).join("");

}