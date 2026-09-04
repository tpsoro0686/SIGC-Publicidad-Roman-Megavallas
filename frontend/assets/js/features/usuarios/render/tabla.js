import { badgeEstado, badgeRol } from "./badges.js";

export function renderTabla(usuarios) {

    const tbody = document.getElementById("tablaUsuariosBody");

    tbody.innerHTML = usuarios.map((usuario) => `

        <tr data-id="${usuario.id}">

            <td><strong>${usuario.nombre}</strong></td>

            <td>${usuario.correo}</td>

            <td>${badgeRol(usuario.rol?.nombre ?? "-")}</td>

            <td>${badgeEstado(usuario.estado)}</td>

            <td class="text-end">
                <div class="d-inline-flex gap-1">

                    <button type="button" class="sigc-icon-btn sigc-icon-btn--editar" data-editar="${usuario.id}" title="Editar" aria-label="Editar">
                        <i data-lucide="pencil"></i>
                    </button>

                    <button type="button" class="sigc-icon-btn sigc-icon-btn--archivar" data-toggle-estado="${usuario.id}" title="${usuario.estado === "Activo" ? "Inactivar" : "Reactivar"}" aria-label="Cambiar estado">
                        <i data-lucide="${usuario.estado === "Activo" ? "archive" : "rotate-ccw"}"></i>
                    </button>

                </div>
            </td>

        </tr>

    `).join("");

}