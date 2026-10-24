/**
 * ==========================================
 * Detalle de una solicitud (contenido del modal)
 * ==========================================
 */

import { badgeEstado, totalPagado } from "./badges.js";

import { esc, usd, soloFecha, fechaHora } from "../../../core/helpers/html.js";

function enlaceTelefono(telefono) {

    const digitos = String(telefono ?? "").replace(/\D/g, "");

    if (!digitos) {

        return esc(telefono);

    }

    // Números de 8 dígitos = Costa Rica (+506)
    const whatsapp = digitos.length === 8 ? `506${digitos}` : digitos;

    return `
        <a href="tel:${esc(digitos)}">${esc(telefono)}</a>
        <a href="https://wa.me/${esc(whatsapp)}" target="_blank" rel="noopener" class="sigc-solicitud__wa">WhatsApp</a>
    `;

}

function tablaVallas(vallas) {

    const filas = vallas.map((valla) => `
        <tr>
            <td>
                <strong>${esc(valla.codigo)}</strong>
                <div class="text-muted small">${esc(valla.referencia)}${valla.provincia ? ` · ${esc(valla.provincia)}` : ""}</div>
            </td>
            <td class="text-end">${esc(usd(valla.precio_mostrado))}</td>
            <td class="text-end">${esc(usd(valla.precio_instalacion))}</td>
        </tr>
    `).join("");

    const mensual = vallas.reduce((suma, valla) => suma + Number(valla.precio_mostrado || 0), 0);

    const instalacion = vallas.reduce((suma, valla) => suma + Number(valla.precio_instalacion || 0), 0);

    return `
        <div class="sigc-table-wrap">
            <table class="table sigc-table mb-0">
                <thead>
                    <tr><th>Valla</th><th class="text-end">Mensual</th><th class="text-end">Instalación</th></tr>
                </thead>
                <tbody>${filas}</tbody>
                <tfoot>
                    <tr class="sigc-solicitud__total">
                        <td>Primer mes (alquiler + instalación)</td>
                        <td class="text-end" colspan="2">${esc(usd(mensual + instalacion))}</td>
                    </tr>
                </tfoot>
            </table>
        </div>
        <div class="text-muted small mt-1">Precios mostrados al cliente al momento de enviar la solicitud.</div>
    `;

}

function listaPagos(pagos) {

    if (!pagos.length) {

        return `<p class="text-muted mb-0">El cliente no ha iniciado ningún pago en línea.</p>`;

    }

    const clases = { Pagado: "sigc-badge--disponible", Pendiente: "sigc-badge--reservada", Fallido: "sigc-badge--inactiva", Cancelado: "sigc-badge--mantenimiento", Reembolsado: "sigc-badge--alquilada" };

    return `
        <ul class="sigc-solicitud__pagos">
            ${pagos.map((pago) => `
                <li>
                    <span><strong>${esc(pago.referencia)}</strong> · ${esc(pago.tipo)}</span>
                    <span>${esc(usd(pago.monto))}
                        <span class="sigc-badge ${clases[pago.estado] || "sigc-badge--mantenimiento"}">${esc(pago.estado)}</span>
                    </span>
                    ${pago.pagado_en ? `<small class="text-muted">${esc(fechaHora(pago.pagado_en))}</small>` : ""}
                </li>
            `).join("")}
        </ul>
        <div class="small mt-1">Total pagado: <strong>${esc(usd(totalPagado({ pagos })))}</strong></div>
    `;

}

function bloqueEjecutivo(solicitud, ejecutivos, puedeReasignar) {

    const actual = solicitud.ejecutivo?.nombre ?? "Sin asignar";

    if (!puedeReasignar) {

        return `<div>${esc(actual)}</div>`;

    }

    const opciones = ejecutivos.map((e) => `
        <option value="${e.id}" ${e.id === solicitud.ejecutivo?.id ? "selected" : ""}>
            ${esc(e.nombre)}${e.turno_portal ? ` (turno ${e.turno_portal})` : ""} · ${e.abiertas} abierta(s)
        </option>
    `).join("");

    return `
        <div class="mb-2">${esc(actual)}</div>
        <div class="d-flex gap-2 flex-wrap">
            <select id="selectReasignar" class="form-select sigc-select">
                <option value="">Reasignar a…</option>
                ${opciones}
            </select>
            <button type="button" class="btn sigc-btn-outline" id="btnReasignar">Reasignar</button>
        </div>
    `;

}

export function renderDetalle(solicitud, { ejecutivos = [], puedeCambiarEstado = false, puedeReasignar = false } = {}) {

    document.getElementById("detalleTitulo").innerHTML =
        `${esc(solicitud.codigo)} <span class="ms-2">${badgeEstado(solicitud.estado)}</span>`;

    const vallas = solicitud.vallas ?? [];

    document.getElementById("detalleCuerpo").innerHTML = `

        <div class="sigc-solicitud__grid">

            <section>
                <h6>Cliente</h6>
                <div><strong>${esc(solicitud.nombre)}</strong></div>
                <div class="text-muted">${esc(solicitud.empresa || "Sin empresa")}</div>
                <div class="mt-1">${enlaceTelefono(solicitud.telefono)}</div>
                <div><a href="mailto:${esc(solicitud.correo)}">${esc(solicitud.correo)}</a></div>
            </section>

            <section>
                <h6>Lo que busca</h6>
                <div>Inicio deseado: <strong>${esc(soloFecha(solicitud.fecha_inicio_deseada))}</strong></div>
                <div>Plazo deseado: <strong>${solicitud.plazo_meses_deseado ? `${esc(solicitud.plazo_meses_deseado)} mes(es)` : "—"}</strong></div>
                <div class="text-muted small mt-1">Recibida: ${esc(fechaHora(solicitud.created_at))}</div>
            </section>

            <section>
                <h6>Ejecutivo asignado</h6>
                ${bloqueEjecutivo(solicitud, ejecutivos, puedeReasignar)}
            </section>

        </div>

        ${solicitud.mensaje ? `
            <h6 class="mt-3">Mensaje del cliente</h6>
            <blockquote class="sigc-solicitud__mensaje">${esc(solicitud.mensaje)}</blockquote>
        ` : ""}

        <h6 class="mt-3">Vallas solicitadas (${vallas.length})</h6>
        ${tablaVallas(vallas)}

        <h6 class="mt-3">Pagos en línea</h6>
        ${listaPagos(solicitud.pagos ?? [])}

    `;

    const acciones = document.getElementById("detalleAcciones");

    if (!puedeCambiarEstado) {

        acciones.innerHTML = "";

        return;

    }

    const botones = {

        "Nueva": `<button type="button" class="btn sigc-btn-primary" data-estado="En seguimiento">Tomar en seguimiento</button>`,

        "En seguimiento": `<button type="button" class="btn sigc-btn-primary" data-estado="Cerrada">Cerrar solicitud</button>`,

        "Cerrada": `<button type="button" class="btn sigc-btn-outline" data-estado="En seguimiento">Reabrir</button>`

    };

    acciones.innerHTML = botones[solicitud.estado] ?? "";

}
