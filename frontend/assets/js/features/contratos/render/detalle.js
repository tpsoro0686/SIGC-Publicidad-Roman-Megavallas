/**
 * ==========================================
 * Render del panel de detalle de un contrato
 * ==========================================
 */

import { badgeEstado } from "./badges.js";

export function renderDetalle(contrato) {

    const contenedor = document.getElementById("detalleContratoBody");

    contenedor.innerHTML = `

        <div class="sigc-detalle-top">
            <div>
                <div class="sigc-detalle-codigo">${contrato.codigo}</div>
                <div class="sigc-detalle-provincia">${contrato.valla.codigo} &middot; ${contrato.valla.referencia}</div>
            </div>
            ${badgeEstado(contrato.estado)}
        </div>

        <div class="sigc-detalle-seccion">
            <h4>Información del contrato</h4>
            <dl class="sigc-detalle-lista">
                <dt>Cliente</dt>
                <dd>${contrato.cliente.nombre}</dd>
                <dt>Ejecutivo</dt>
                <dd>${contrato.usuario.nombre}</dd>
                <dt>Monto total</dt>
                <dd>$${Number(contrato.monto_usd).toLocaleString("en-US", { minimumFractionDigits: 2 })}</dd>
                <dt>Monto mensual</dt>
                <dd>$${Number(contrato.monto_mensual).toLocaleString("en-US", { minimumFractionDigits: 2 })}</dd>
                <dt>Plazo</dt>
                <dd>${contrato.plazo_meses} meses</dd>
                <dt>Vigencia</dt>
                <dd>${contrato.fecha_inicio} &rarr; ${contrato.fecha_fin}</dd>
            </dl>
        </div>

        <div class="sigc-detalle-seccion d-flex gap-2 flex-wrap">

            ${contrato.estado === "Activo" ? `
                <button type="button" class="btn btn-outline-secondary btn-sm" id="btnFinalizarContrato" data-id="${contrato.id}">Finalizar antes</button>
            ` : ""}

            <button type="button" class="btn sigc-btn-success btn-sm" id="btnRenovarContrato" data-id="${contrato.id}">Renovar</button>

            ${contrato.puede_eliminarse ? `
                <button type="button" class="btn btn-outline-danger btn-sm" id="btnEliminarContrato" data-id="${contrato.id}">Eliminar</button>
            ` : ""}

        </div>

    `;

}