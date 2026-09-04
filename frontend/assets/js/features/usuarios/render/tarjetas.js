import { badgeEstado, badgeRol } from "./badges.js";

export function renderTarjetas(usuarios) {

    const contenedor = document.getElementById("listaUsuariosMovil");

    contenedor.innerHTML = usuarios.map((usuario) => `

        <div class="sigc-valla-card" data-id="${usuario.id}">

            <div class="sigc-valla-card__top">
                <span class="sigc-valla-card__codigo">${usuario.nombre}</span>
                ${badgeEstado(usuario.estado)}
            </div>

            <div class="sigc-valla-card__referencia">${usuario.correo}</div>

            <div class="sigc-valla-card__meta">
                ${badgeRol(usuario.rol?.nombre ?? "-")}
            </div>

            <div class="d-flex gap-1 mt-2">

                <button type="button" class="sigc-icon-btn sigc-icon-btn--editar" data-editar="${usuario.id}" title="Editar" aria-label="Editar">
                    <i data-lucide="pencil"></i>
                </button>

                <button type="button" class="sigc-icon-btn sigc-icon-btn--archivar" data-toggle-estado="${usuario.id}" title="${usuario.estado === "Activo" ? "Inactivar" : "Reactivar"}" aria-label="Cambiar estado">
                    <i data-lucide="${usuario.estado === "Activo" ? "archive" : "rotate-ccw"}"></i>
                </button>

            </div>

        </div>

    `).join("");

}
