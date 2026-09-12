import { badgeTipo } from "./badges.js";

function formatearPeriodo(filtros) {

    if (!filtros || (!filtros.fecha_desde && !filtros.fecha_hasta)) {

        return "Todo el histórico";

    }

    return `${filtros.fecha_desde ?? "..."} → ${filtros.fecha_hasta ?? "..."}`;

}

export function renderTarjetas(reportes) {

    const contenedor = document.getElementById("listaReportesMovil");

    contenedor.innerHTML = reportes.map((reporte) => `

        <div class="sigc-valla-card" data-id="${reporte.id}" style="cursor: pointer;">

            <div class="sigc-valla-card__top">
                ${badgeTipo(reporte.tipo)}
                <span class="text-muted small">${reporte.creado}</span>
            </div>

            <div class="sigc-valla-card__referencia">${formatearPeriodo(reporte.filtros)}</div>

            <div class="sigc-valla-card__meta">
                <span>${reporte.usuario}</span>
            </div>

            <div class="d-flex gap-1 mt-2">
                <button type="button" class="sigc-icon-btn sigc-icon-btn--contrato" data-descargar-pdf="${reporte.id}" title="Descargar PDF" aria-label="Descargar PDF">
                    <i data-lucide="download"></i>
                </button>
            </div>

        </div>

    `).join("");

}