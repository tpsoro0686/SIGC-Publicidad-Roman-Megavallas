import { badgeEstado } from "./badges.js";

export function renderTabla(contratos) {

    const tbody = document.getElementById("tablaContratosBody");

    tbody.innerHTML = contratos.map((contrato) => `

        <tr data-id="${contrato.id}">

            <td><strong>${contrato.codigo}</strong></td>

            <td>${contrato.valla.codigo}</td>

            <td>${contrato.cliente.nombre}</td>

            <td>$${Number(contrato.monto_usd).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>

            <td>${contrato.fecha_fin}</td>

            <td>${badgeEstado(contrato.estado)}</td>

            <td class="text-end">
                <i data-lucide="chevron-right" class="text-muted"></i>
            </td>

        </tr>

    `).join("");

}