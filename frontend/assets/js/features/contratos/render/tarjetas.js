import { badgeEstado } from "./badges.js";

export function renderTarjetas(contratos) {

    const contenedor = document.getElementById("listaContratosMovil");

    contenedor.innerHTML = contratos.map((contrato) => `

        <div class="sigc-valla-card" data-id="${contrato.id}">

            <div class="sigc-valla-card__top">
                <span class="sigc-valla-card__codigo">${contrato.codigo}</span>
                ${badgeEstado(contrato.estado)}
            </div>

            <div class="sigc-valla-card__referencia">${contrato.cliente.nombre} &middot; ${contrato.valla.codigo}</div>

            <div class="sigc-valla-card__meta">
                <span>$${Number(contrato.monto_usd).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                <span>Vence: ${contrato.fecha_fin}</span>
            </div>

        </div>

    `).join("");

}