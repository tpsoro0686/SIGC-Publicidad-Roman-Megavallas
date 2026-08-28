/**
 * ==========================================
 * Render del panel de detalle de un cliente
 * ==========================================
 */

const CLASES_ESTADO_RESERVA = {

    Activa: "sigc-badge--disponible",

    Vencida: "sigc-badge--mantenimiento",

    Cancelada: "sigc-badge--inactiva",

    Convertida: "sigc-badge--alquilada"

};

const CLASES_ESTADO_CONTRATO = {

    Activo: "sigc-badge--disponible",

    Finalizado: "sigc-badge--inactiva"

};

function badge(estado, mapa) {

    const clase = mapa[estado] || "sigc-badge--inactiva";

    return `<span class="sigc-badge ${clase}">${estado}</span>`;

}

function bloqueReservas(reservas) {

    if (!reservas || reservas.length === 0) {

        return `<p class="sigc-detalle-sin-fotos">Sin reservas registradas.</p>`;

    }

    return reservas.map((reserva) => `

        <div class="sigc-detalle-seccion">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <strong>${reserva.valla.codigo}</strong>
                ${badge(reserva.estado, CLASES_ESTADO_RESERVA)}
            </div>
            <dl class="sigc-detalle-lista">
                <dt>Ejecutivo</dt>
                <dd>${reserva.usuario.nombre}</dd>
                <dt>Reservada</dt>
                <dd>${reserva.fecha_reserva} &rarr; ${reserva.fecha_vencimiento}</dd>
            </dl>
        </div>

    `).join("");

}

function bloqueContratos(contratos) {

    if (!contratos || contratos.length === 0) {

        return `<p class="sigc-detalle-sin-fotos">Sin contratos registrados.</p>`;

    }

    return contratos.map((contrato) => `

        <div class="sigc-detalle-seccion">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <strong>${contrato.codigo}</strong>
                ${badge(contrato.estado, CLASES_ESTADO_CONTRATO)}
            </div>
            <dl class="sigc-detalle-lista">
                <dt>Monto</dt>
                <dd>$${Number(contrato.monto_usd).toLocaleString("en-US", { minimumFractionDigits: 2 })} / ${contrato.plazo_meses} meses</dd>
                <dt>Vigencia</dt>
                <dd>${contrato.fecha_inicio} &rarr; ${contrato.fecha_fin}</dd>
            </dl>
        </div>

    `).join("");

}

export function renderDetalle(cliente) {

    const contenedor = document.getElementById("detalleClienteBody");

    contenedor.innerHTML = `

        <div class="sigc-detalle-top">
            <div>
                <div class="sigc-detalle-codigo">${cliente.nombre}</div>
                <div class="sigc-detalle-provincia">${cliente.cedula}</div>
            </div>
            ${badge(cliente.estado, { Activo: "sigc-badge--disponible", Inactivo: "sigc-badge--inactiva" })}
        </div>

        <div class="sigc-detalle-seccion">
            <h4>Información de contacto</h4>
            <dl class="sigc-detalle-lista">
                <dt>Teléfono</dt>
                <dd>${cliente.telefono ?? "No registrado"}</dd>
                <dt>Correo</dt>
                <dd>${cliente.correo ?? "No registrado"}</dd>
                <dt>Dirección</dt>
                <dd>${cliente.direccion ?? "No registrada"}</dd>
            </dl>
        </div>

        <div class="sigc-detalle-seccion">
            <h4>Reservas</h4>
            ${bloqueReservas(cliente.reservas)}
        </div>

        <div class="sigc-detalle-seccion">
            <h4>Contratos</h4>
            ${bloqueContratos(cliente.contratos)}
        </div>

    `;

}