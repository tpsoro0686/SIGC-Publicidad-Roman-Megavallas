import { badgeTipo } from "./badges.js";

function formatearPeriodo(filtros) {

    if (!filtros || (!filtros.fecha_desde && !filtros.fecha_hasta)) {

        return "Todo el histórico";

    }

    return `${filtros.fecha_desde ?? "..."} → ${filtros.fecha_hasta ?? "..."}`;

}

export function renderTabla(reportes) {

    const tbody = document.getElementById("tablaReportesBody");

    tbody.innerHTML = reportes.map((reporte) => `

        <tr data-id="${reporte.id}" style="cursor: pointer;">

            <td>${badgeTipo(reporte.tipo)}</td>

            <td>${formatearPeriodo(reporte.filtros)}</td>

            <td>${reporte.usuario}</td>

            <td>${reporte.creado}</td>

            <td class="text-end">
                <button type="button" class="sigc-icon-btn sigc-icon-btn--contrato" data-descargar-pdf="${reporte.id}" title="Descargar PDF" aria-label="Descargar PDF">
                    <i data-lucide="download"></i>
                </button>
            </td>

        </tr>

    `).join("");

} 