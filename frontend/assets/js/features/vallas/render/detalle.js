/**
 * ==========================================
 * Render del panel de detalle de una valla
 * (estilo "flyer" de Publicidad Román)
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

function formatDMS(decimal, tipo) {

    if (decimal === null || decimal === undefined) {

        return "No definida";

    }

    const numero = Number(decimal);

    const hemisferio = tipo === "lat"
        ? (numero >= 0 ? "N" : "S")
        : (numero >= 0 ? "E" : "W");

    const absoluto = Math.abs(numero);

    const grados = Math.floor(absoluto);

    const minutosDecimal = (absoluto - grados) * 60;

    const minutos = Math.floor(minutosDecimal);

    const segundos = (minutosDecimal - minutos) * 60;

    const minutosStr = String(minutos).padStart(2, "0");

    const segundosStr = segundos.toFixed(1).padStart(4, "0");

    return `${grados}°${minutosStr}'${segundosStr}"${hemisferio}`;

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

function bloqueFoto(fotos) {

    const primera = fotos && fotos.length > 0 ? fotos[0] : null;

    if (primera) {

        return `<img class="sigc-flyer__foto" src="${primera.url}" alt="Foto de la valla">`;

    }

    return `
        <div class="sigc-flyer__foto sigc-flyer__foto--vacia">
            <i data-lucide="image-off"></i>
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

        <div class="sigc-flyer">

            <div class="sigc-flyer__foto-wrap">

                <span class="sigc-flyer__cod">COD ${valla.codigo}</span>

                <div class="sigc-flyer__logo">
                    <i data-lucide="map-pin"></i>
                    <span>ROMÁN</span>
                </div>

                ${bloqueFoto(valla.fotos)}

            </div>

            <div class="sigc-flyer__titulo">${valla.referencia}</div>

            <div class="sigc-flyer__boxes">

                <div class="sigc-flyer__box">
                    <div class="sigc-flyer__box-label">Ubicación</div>
                    <div class="sigc-flyer__box-value">${valla.referencia}</div>
                </div>

                <div class="sigc-flyer__box">
                    <div class="sigc-flyer__box-label">Geolocalización</div>
                    <div class="sigc-flyer__box-value">Lat. ${formatDMS(valla.latitud, "lat")} &middot; Lon. ${formatDMS(valla.longitud, "lon")}</div>
                </div>

                <div class="sigc-flyer__box">
                    <div class="sigc-flyer__box-label">Medidas</div>
                    <div class="sigc-flyer__box-value">${valla.tamano ?? "No definidas"}</div>
                </div>

            </div>

            ${valla.disponible_el ? `
                <div class="sigc-flyer__disponible">Disponible el: ${formatearFecha(valla.disponible_el)}</div>
            ` : ""}

            ${valla.vehiculos_diarios ? `
                <div class="sigc-flyer__vehiculos">Vehículos diarios: <strong>${Number(valla.vehiculos_diarios).toLocaleString("es-CR")}</strong></div>
            ` : ""}

            <div class="sigc-flyer__precios">

                <div class="sigc-flyer__precio-box">
                    <div class="sigc-flyer__precio-label">Renta mensual</div>
                    <div class="sigc-flyer__precio-value">${formatearMoneda(valla.precio_normal)}</div>
                </div>

                <div class="sigc-flyer__precio-box">
                    <div class="sigc-flyer__precio-label">Impresión e instalación</div>
                    <div class="sigc-flyer__precio-value">${formatearMoneda(valla.precio_instalacion)}</div>
                </div>

            </div>

        </div>

        <div class="sigc-detalle-seccion">
            <h4>Información adicional</h4>
            <dl class="sigc-detalle-lista">
                <dt>Precio mínimo preaprobado</dt>
                <dd>${formatearMoneda(valla.precio_minimo)}</dd>
            </dl>
        </div>

        ${bloqueReserva(valla.reserva_activa)}

        ${bloqueContrato(valla.contrato_activo)}

    `;

}