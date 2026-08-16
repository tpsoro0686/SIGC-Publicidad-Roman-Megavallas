/**
 * ==========================================
 * Render del panel de detalle de una valla
 * ==========================================
 */

import { badgeEstado } from "./badges.js";

function formatearMoneda(monto) {

    if (monto === null || monto === undefined) {

        return "No definido";

    }

    return `$${Number(monto).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

}

function formatearFecha(fecha) {

    if (!fecha) {

        return "-";

    }

    return new Date(fecha).toLocaleDateString("es-CR");

}

function bloqueReserva(reserva) {

    if (!reserva) {

        return "";

    }

    return `

        <div class="sigc-detalle-seccion">
            <h4>Reserva activa</h4>
            <dl class="sigc-detalle-lista">
                <dt>Ejecutivo</dt>
                <dd>${reserva.ejecutivo}</dd>
                <dt>Fecha de reserva</dt>
                <dd>${formatearFecha(reserva.fecha_reserva)}</dd>
                <dt>Vence</dt>
                <dd>${formatearFecha(reserva.fecha_vencimiento)}</dd>
            </dl>
        </div>

    `;

}

function bloqueContrato(contrato) {

    if (!contrato) {

        return "";

    }

    const vencido = contrato.dias_restantes < 0;

    const textoRestante = vencido

        ? `Vencido hace ${Math.abs(contrato.dias_restantes)} día(s)`

        : `${contrato.dias_restantes} día(s) restantes`;

    return `

        <div class="sigc-detalle-seccion">
            <h4>Contrato activo</h4>
            <dl class="sigc-detalle-lista">
                <dt>Cliente</dt>
                <dd>${contrato.cliente}</dd>
                <dt>Ejecutivo</dt>
                <dd>${contrato.ejecutivo}</dd>
                <dt>Monto</dt>
                <dd>${formatearMoneda(contrato.monto_usd)} / ${contrato.plazo_meses} meses</dd>
                <dt>Vigencia</dt>
                <dd>${formatearFecha(contrato.fecha_inicio)} &rarr; ${formatearFecha(contrato.fecha_fin)}</dd>
                <dt>Tiempo restante</dt>
                <dd class="${vencido ? "text-danger fw-bold" : ""}">${textoRestante}</dd>
            </dl>
        </div>

    `;

}

function bloqueFotos(fotos) {

    if (!fotos || fotos.length === 0) {

        return `<p class="sigc-detalle-sin-fotos">Sin fotografías cargadas.</p>`;

    }

    return `

        <div class="sigc-detalle-fotos">

            ${fotos.map((foto) => `<img src="${foto.url}" alt="Foto de la valla">`).join("")}

        </div>

    `;

}

export function renderDetalle(valla) {

    const contenedor = document.getElementById("detalleVallaBody");

    contenedor.innerHTML = `

        <div class="sigc-detalle-top">
            <div>
                <div class="sigc-detalle-codigo">${valla.codigo}</div>
                <div class="sigc-detalle-provincia">${valla.provincia?.nombre ?? "-"}</div>
            </div>
            ${badgeEstado(valla.estado)}
        </div>

        ${bloqueFotos(valla.fotos)}

        <div class="sigc-detalle-seccion">
            <h4>Información general</h4>
            <dl class="sigc-detalle-lista">
                <dt>Referencia</dt>
                <dd>${valla.referencia}</dd>
                <dt>Tamaño</dt>
                <dd>${valla.tamano ?? "No definido"}</dd>
                <dt>Precio normal</dt>
                <dd>${formatearMoneda(valla.precio_normal)}</dd>
                <dt>Precio mínimo preaprobado</dt>
                <dd>${formatearMoneda(valla.precio_minimo)}</dd>
            </dl>
        </div>

        ${bloqueReserva(valla.reserva_activa)}

        ${bloqueContrato(valla.contrato_activo)}

    `;

}