/**
 * Vistas del panel lateral. Cada función devuelve HTML (texto);
 * los eventos se manejan en main.js por delegación.
 */

import { icono } from "./icons.js";

import { esc, usd, numero, hoyISO, plural, esAhora, textoDisponibilidad } from "./format.js";

const PLAZOS = [1, 2, 3, 6, 12, 24];

// Texto que acompaña a todos los precios del portal (cámbialo aquí si algo cambia)
const NOTA_PRECIOS = "Precios en dólares (USD), sin IVA.";

function claseDisp(valla) {

    return esAhora(valla) ? "disp--ahora" : "disp--pronto";

}

function etiquetaDisp(valla) {

    return `<span class="disp ${claseDisp(valla)}">${esc(textoDisponibilidad(valla))}</span>`;

}

function botonMas(valla, enLista) {

    return `
        <button type="button" class="mas ${enLista ? "mas--activo" : ""}" data-accion="alternar-lista" data-id="${valla.id}"
            aria-pressed="${enLista}" aria-label="${enLista ? "Quitar de mi lista" : "Agregar a mi lista"} la valla ${esc(valla.codigo)}"
            title="${enLista ? "Quitar de mi lista" : "Agregar a mi lista"}">
            ${icono(enLista ? "check" : "mas")}
        </button>
    `;

}

export function htmlCargando() {

    return `
        <div class="vacio">
            <div class="cargando" role="status"><i></i><i></i><i></i></div>
            <p>Cargando vallas…</p>
        </div>
    `;

}

export function htmlError(mensaje) {

    return `
        <div class="vacio">
            <p class="vacio__titulo">No se pudieron cargar las vallas</p>
            <p>${esc(mensaje)}</p>
            <button type="button" class="btn btn--primario" data-accion="reintentar">Reintentar</button>
        </div>
    `;

}

/* ---------------------------------------------------------
   Listado de vallas en la zona visible del mapa
--------------------------------------------------------- */

function htmlFila(valla, enLista) {

    const precio = usd(valla.precio_normal);

    return `
        <article class="fila ${enLista ? "fila--lista" : ""}">

            <button type="button" class="fila__principal" data-accion="abrir" data-id="${valla.id}">

                <span class="fila__foto">
                    ${valla.foto
                        ? `<img src="${esc(valla.foto)}" alt="" loading="lazy">`
                        : icono("cartel", "icono icono--foto")}
                </span>

                <span class="fila__info">
                    <span class="fila__codigo">${esc(valla.codigo)}</span>
                    <span class="fila__ref">${esc(valla.referencia)}</span>
                    ${etiquetaDisp(valla)}
                </span>

                <span class="fila__precio">
                    ${precio ? `${precio}<small>por mes</small>` : "<small>Consultar</small>"}
                </span>

            </button>

            ${botonMas(valla, enLista)}

        </article>
    `;

}

export function htmlLista({ vallas, totalVisibles, totalFiltradas, lista, hayFiltros, limite }) {

    const encabezado = `
        <div class="vista__cabecera">
            <h2 class="vista__titulo">Vallas en esta zona</h2>
            <p class="vista__sub">${totalVisibles} ${plural(totalVisibles, "valla", "vallas")}${totalFiltradas !== totalVisibles ? ` de ${totalFiltradas} en total` : ""}</p>
        </div>
    `;

    if (!vallas.length) {

        return `
            ${encabezado}
            <div class="vacio">
                <p class="vacio__titulo">No hay vallas en esta parte del mapa</p>
                <p>${hayFiltros ? "Prueba quitando los filtros o " : "Prueba "}alejando el mapa para ver más zonas.</p>
                ${hayFiltros
                    ? "<button type=\"button\" class=\"btn btn--secundario\" data-accion=\"limpiar-filtros\">Limpiar filtros</button>"
                    : ""}
                <button type="button" class="btn btn--secundario" data-accion="ver-todas">Ver todas las vallas</button>
            </div>
        `;

    }

    return `
        ${encabezado}
        <div class="filas">
            ${vallas.map((valla) => htmlFila(valla, lista.includes(valla.id))).join("")}
        </div>
        ${totalVisibles > limite
            ? `<p class="nota nota--centro">Se muestran ${limite} de ${totalVisibles}. Acerca el mapa para ver el resto.</p>`
            : ""}
    `;

}

/* ---------------------------------------------------------
   Detalle de una valla
--------------------------------------------------------- */

function htmlGaleria(valla) {

    const fotos = (valla.fotos && valla.fotos.length ? valla.fotos : (valla.foto ? [valla.foto] : []));

    if (!fotos.length) {

        return `
            <div class="galeria galeria--vacia">
                ${icono("cartel", "icono icono--foto")}
                <span>Esta valla aún no tiene fotos</span>
            </div>
        `;

    }

    return `
        <div class="galeria" id="galeria">

            <div class="galeria__pista" id="galeriaPista" tabindex="0" aria-label="Fotos de la valla">
                ${fotos.map((url, i) => `<img src="${esc(url)}" alt="Foto ${i + 1} de la valla ${esc(valla.codigo)}" loading="${i === 0 ? "eager" : "lazy"}">`).join("")}
            </div>

            ${fotos.length > 1 ? `
                <button type="button" class="galeria__nav galeria__nav--izq" data-accion="galeria" data-dir="-1" aria-label="Foto anterior">${icono("izquierda")}</button>
                <button type="button" class="galeria__nav galeria__nav--der" data-accion="galeria" data-dir="1" aria-label="Foto siguiente">${icono("derecha")}</button>
                <span class="galeria__contador" id="galeriaContador">1 / ${fotos.length}</span>
            ` : ""}

        </div>
    `;

}

export function htmlDetalle(valla, enLista) {

    const precio = usd(valla.precio_normal);

    const instalacion = usd(valla.precio_instalacion);

    const vehiculos = numero(valla.vehiculos_diarios);

    const enlaceMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${valla.latitud},${valla.longitud}`)}`;

    return `
        <div class="vista__barra">
            <button type="button" class="btn-texto" data-accion="volver">${icono("izquierda")}Volver al listado</button>
        </div>

        ${htmlGaleria(valla)}

        <div class="detalle">

            <p class="detalle__codigo">${esc(valla.codigo)}</p>

            <h2 class="detalle__titulo">${esc(valla.referencia)}</h2>

            <p class="detalle__prov">${icono("pin")}${esc(valla.provincia?.nombre ?? "Costa Rica")}</p>

            <p>${etiquetaDisp(valla)}</p>

            ${!esAhora(valla) && valla.fecha_tentativa
                ? "<p class=\"nota\">Esta fecha es estimada: depende de si la reserva actual se concreta.</p>"
                : ""}

            <dl class="datos">

                <div class="dato">
                    <dt>Medidas</dt>
                    <dd>${valla.tamano ? esc(valla.tamano) : "Consultar"}</dd>
                </div>

                <div class="dato">
                    <dt>Vehículos por día</dt>
                    <dd>${vehiculos ?? "Consultar"}</dd>
                </div>

                <div class="dato dato--precio">
                    <dt>Precio</dt>
                    <dd>${precio ? `${precio}<small> por mes</small>` : "Consultar"}</dd>
                </div>

                <div class="dato">
                    <dt>Instalación</dt>
                    <dd>${instalacion ? `${instalacion}<small> una sola vez</small>` : "Consultar"}</dd>
                </div>

            </dl>

            <div class="acciones">

                <button type="button" class="btn ${enLista ? "btn--secundario" : "btn--primario"}" data-accion="alternar-lista" data-id="${valla.id}">
                    ${icono(enLista ? "check" : "mas")}${enLista ? "En mi lista (quitar)" : "Agregar a mi lista"}
                </button>

                <a class="btn btn--secundario" href="${enlaceMapa}" target="_blank" rel="noopener">
                    ${icono("externo")}Ver en Google Maps
                </a>

            </div>

        </div>
    `;

}

/* ---------------------------------------------------------
   Mi lista + medidor de presupuesto + formulario
--------------------------------------------------------- */

export function calcularTotales(vallasLista) {

    let mensual = 0;

    let instalacion = 0;

    let sinPrecio = 0;

    vallasLista.forEach((valla) => {

        if (valla.precio_normal === null || valla.precio_normal === undefined) {

            sinPrecio += 1;

        }

        else {

            mensual += Number(valla.precio_normal);

        }

        instalacion += Number(valla.precio_instalacion ?? 0);

    });

    return { mensual, instalacion, sinPrecio };

}

export function htmlMedidor({ totales, presupuesto, cabenMas, plazo = 0 }) {

    const meses = Number(plazo) > 0 ? Number(plazo) : 0;

    const alquiler = totales.mensual * meses;

    const filaTotales = `
        <dl class="totales">
            <div><dt>Total por mes</dt><dd>${usd(totales.mensual) ?? "$0"}</dd></div>
            ${meses ? `<div><dt>Alquiler por ${meses} ${plural(meses, "mes", "meses")}</dt><dd>${usd(alquiler) ?? "$0"}</dd></div>` : ""}
            <div><dt>Instalación (una sola vez)</dt><dd>${usd(totales.instalacion) ?? "$0"}</dd></div>
            ${meses ? `<div class="totales__total"><dt>Total estimado</dt><dd>${usd(alquiler + totales.instalacion) ?? "$0"}</dd></div>` : ""}
        </dl>
        ${meses ? "" : "<p class=\"nota\">Elige los meses a contratar para ver el total.</p>"}
        ${totales.sinPrecio
            ? `<p class="nota">${totales.sinPrecio} ${plural(totales.sinPrecio, "valla tiene", "vallas tienen")} el precio por consultar y no se suma${totales.sinPrecio === 1 ? "" : "n"}.</p>`
            : ""}
    `;

    if (!presupuesto) {

        return filaTotales;

    }

    const usado = Math.min(100, Math.round((totales.mensual / presupuesto) * 100));

    const excedido = totales.mensual > presupuesto;

    const resto = presupuesto - totales.mensual;

    let mensaje;

    if (excedido) {

        mensaje = `Te pasas del presupuesto por ${usd(totales.mensual - presupuesto)} al mes.`;

    }

    else if (resto === 0) {

        mensaje = "Usas todo tu presupuesto mensual.";

    }

    else {

        mensaje = `Te quedan ${usd(resto)} al mes.`
            + (cabenMas > 0
                ? ` Hay ${cabenMas} ${plural(cabenMas, "valla más que cabe", "vallas más que caben")} en ese monto.`
                : " Ninguna otra valla cabe en ese monto.");

    }

    return `
        ${filaTotales}
        <div class="medidor ${excedido ? "medidor--excedido" : ""}" role="img" aria-label="Usas el ${usado}% de tu presupuesto mensual">
            <div class="medidor__barra"><i style="width:${usado}%"></i></div>
            <p class="medidor__texto">${esc(mensaje)}</p>
        </div>
    `;

}

function campo({ id, nombre, etiqueta, tipo = "text", valor, requerido = false, errores, atributos = "" }) {

    const error = errores[nombre];

    return `
        <div class="campo ${error ? "campo--error" : ""}">
            <label for="${id}">${etiqueta}${requerido ? "" : " <span class=\"campo__opcional\">(opcional)</span>"}</label>
            <input id="${id}" type="${tipo}" data-campo="${nombre}" value="${esc(valor)}" ${requerido ? "required" : ""} ${atributos}>
            ${error ? `<p class="campo__error">${esc(error)}</p>` : ""}
        </div>
    `;

}

export function htmlMiLista({ vallasLista, totales, presupuesto, cabenMas, borrador, errores, errorGeneral, enviando }) {

    if (!vallasLista.length) {

        return `
            <div class="vista__cabecera">
                <h2 class="vista__titulo">Mi lista</h2>
            </div>
            <div class="vacio">
                <p class="vacio__titulo">Aún no has agregado vallas</p>
                <p>Toca el botón + en cualquier valla del mapa o del listado para armar tu lista y enviar una solicitud.</p>
                <button type="button" class="btn btn--primario" data-accion="ver-listado">Ver vallas</button>
            </div>
        `;

    }

    const filas = vallasLista.map((valla) => `
        <li class="item">
            <button type="button" class="item__info" data-accion="abrir" data-id="${valla.id}">
                <span class="fila__codigo">${esc(valla.codigo)}</span>
                <span class="fila__ref">${esc(valla.referencia)}</span>
                ${etiquetaDisp(valla)}
            </button>
            <span class="item__precio">${usd(valla.precio_normal) ?? "<small>Consultar</small>"}</span>
            <button type="button" class="item__quitar" data-accion="alternar-lista" data-id="${valla.id}" aria-label="Quitar la valla ${esc(valla.codigo)} de mi lista" title="Quitar">${icono("basura")}</button>
        </li>
    `).join("");

    return `
        <div class="vista__cabecera">
            <h2 class="vista__titulo">Mi lista</h2>
            <p class="vista__sub">${vallasLista.length} ${plural(vallasLista.length, "valla", "vallas")}</p>
        </div>

        <ul class="items">${filas}</ul>

        <section class="bloque">

            <div class="campo campo--presupuesto">
                <label for="campoPresupuesto">Mi presupuesto mensual <span class="campo__opcional">(opcional)</span></label>
                <div class="campo__moneda">
                    <span aria-hidden="true">$</span>
                    <input id="campoPresupuesto" type="number" inputmode="decimal" min="0" step="50" placeholder="Ej: 5000" data-campo="presupuesto" value="${presupuesto || ""}">
                </div>
            </div>

            <div class="campo ${errores.plazo_meses_deseado ? "campo--error" : ""}">
                <label for="fPlazo">Meses a contratar <span class="campo__opcional">(opcional)</span></label>
                <select id="fPlazo" data-campo="plazo_meses_deseado">
                    <option value="">Por definir</option>
                    ${PLAZOS.map((meses) => `<option value="${meses}" ${String(borrador.plazo_meses_deseado) === String(meses) ? "selected" : ""}>${meses} ${plural(meses, "mes", "meses")}</option>`).join("")}
                </select>
                ${errores.plazo_meses_deseado ? `<p class="campo__error">${esc(errores.plazo_meses_deseado)}</p>` : ""}
            </div>

            <div id="medidor">${htmlMedidor({ totales, presupuesto, cabenMas, plazo: Number(borrador.plazo_meses_deseado) || 0 })}</div>

            <p class="nota">${NOTA_PRECIOS} Tu ejecutivo te confirma la propuesta final.</p>

        </section>

        <form class="formulario" id="formSolicitud">

            <h3 class="formulario__titulo">Tus datos para la solicitud</h3>

            ${errorGeneral ? `<div class="alerta alerta--error" role="alert">${esc(errorGeneral)}</div>` : ""}

            ${campo({ id: "fNombre", nombre: "nombre", etiqueta: "Nombre", valor: borrador.nombre, requerido: true, errores, atributos: "autocomplete=\"name\" maxlength=\"120\"" })}

            ${campo({ id: "fEmpresa", nombre: "empresa", etiqueta: "Empresa", valor: borrador.empresa, errores, atributos: "autocomplete=\"organization\" maxlength=\"150\"" })}

            ${campo({ id: "fTelefono", nombre: "telefono", etiqueta: "Teléfono", tipo: "tel", valor: borrador.telefono, requerido: true, errores, atributos: "autocomplete=\"tel\" maxlength=\"30\"" })}

            ${campo({ id: "fCorreo", nombre: "correo", etiqueta: "Correo", tipo: "email", valor: borrador.correo, requerido: true, errores, atributos: "autocomplete=\"email\" maxlength=\"150\"" })}

            ${campo({ id: "fInicio", nombre: "fecha_inicio_deseada", etiqueta: "Inicio de campaña", tipo: "date", valor: borrador.fecha_inicio_deseada, errores, atributos: `min="${hoyISO()}"` })}

            <div class="campo ${errores.mensaje ? "campo--error" : ""}">
                <label for="fMensaje">Mensaje <span class="campo__opcional">(opcional)</span></label>
                <textarea id="fMensaje" rows="3" maxlength="1000" data-campo="mensaje" placeholder="Cuéntanos de tu campaña, zonas de interés o cualquier duda.">${esc(borrador.mensaje)}</textarea>
                ${errores.mensaje ? `<p class="campo__error">${esc(errores.mensaje)}</p>` : ""}
            </div>

            <!-- Campo trampa para bots: las personas no lo ven -->
            <div class="trampa" aria-hidden="true">
                <label>No llenar este campo <input type="text" name="sitio_web" tabindex="-1" autocomplete="off"></label>
            </div>

            ${errores.vallas ? `<div class="alerta alerta--error" role="alert">${esc(errores.vallas)}</div>` : ""}

            <button type="submit" class="btn btn--primario btn--bloque" ${enviando ? "disabled" : ""}>
                ${enviando ? "Enviando…" : "Enviar solicitud"}
            </button>

            <p class="nota nota--centro">Un ejecutivo te contactará para continuar. Enviar la solicitud no genera ningún cobro.</p>

        </form>
    `;

}

function htmlPago(pago, { pagando, mensaje, simulado }) {

    if (!pago) {

        return "";

    }

    const { opciones } = pago;

    const alerta = mensaje ? `<p class="alerta alerta--error" role="alert">${esc(mensaje)}</p>` : "";

    const prueba = simulado ? `
        <div class="pago__prueba">
            <strong>Pasarela de prueba</strong>
            <span>No se cobra nada. Elige qué resultado simular:</span>
            <div class="pago__botones">
                <button type="button" class="btn btn--primario" data-accion="simular-pago" data-estado="Pagado" ${pagando ? "disabled" : ""}>Pago exitoso</button>
                <button type="button" class="btn btn--secundario" data-accion="simular-pago" data-estado="Fallido" ${pagando ? "disabled" : ""}>Pago fallido</button>
            </div>
        </div>
    ` : "";

    const resumen = Number(pago.pagado) > 0
        ? `<p class="pago__resumen">Pagado: <strong>${esc(usd(pago.pagado))}</strong> · Saldo: <strong>${esc(usd(pago.saldo))}</strong></p>`
        : `<p class="pago__resumen">Total por ${esc(pago.meses)} ${plural(pago.meses, "mes", "meses")} con instalación: <strong>${esc(usd(pago.total))}</strong> <small>(sin IVA)</small></p>`;

    if (!opciones.adelanto && !opciones.completo) {

        return `<div class="pago">${resumen}${alerta}<p class="pago__ok">Tu solicitud está al día. ¡Gracias!</p></div>`;

    }

    const botonAdelanto = opciones.adelanto ? `
        <button type="button" class="btn btn--primario btn--bloque" data-accion="pagar" data-tipo="Adelanto" ${pagando ? "disabled" : ""}>
            Pagar adelanto · ${esc(usd(opciones.adelanto))} <small>(${esc(pago.porcentaje_adelanto)}%)</small>
        </button>
    ` : "";

    const botonCompleto = opciones.completo ? `
        <button type="button" class="btn btn--secundario btn--bloque" data-accion="pagar" data-tipo="Completo" ${pagando ? "disabled" : ""}>
            ${Number(pago.pagado) > 0 ? "Pagar el saldo" : "Pagar todo"} · ${esc(usd(opciones.completo))}
        </button>
    ` : "";

    return `
        <div class="pago">
            <h3 class="pago__titulo">Pago en línea</h3>
            ${resumen}
            ${alerta}
            ${botonAdelanto}
            ${botonCompleto}
            <p class="pago__nota">También puedes pagar después: tu ejecutivo te dará los detalles.</p>
            ${prueba}
        </div>
    `;

}

function htmlApartado(apartado) {

    if (!apartado) {
        return "";
    }

    const { apartadas = [], enEspera = [], dias = 0 } = apartado;

    const partes = [];

    if (apartadas.length) {
        partes.push(`<p><strong>Apartadas para ti${dias ? ` por ${dias} días` : ""}:</strong> ${apartadas.map(esc).join(", ")}. Nadie más podrá tomarlas mientras tu ejecutivo te atiende.</p>`);
    }

    if (enEspera.length) {
        partes.push(`<p><strong>En espera:</strong> ${enEspera.map(esc).join(", ")}. Ya no estaban libres, pero tu ejecutivo te avisará si se desocupan.</p>`);
    }

    return partes.join("");

}

export function htmlEnviado(codigo, pago = null, opciones = {}) {

    return `
        <div class="vacio vacio--exito">
            <span class="exito__marca">${icono("check", "icono icono--grande")}</span>
            <p class="vacio__titulo">Solicitud enviada</p>
            <p class="exito__codigo">${esc(codigo)}</p>
            <p>Un ejecutivo de Publicidad Román Megavallas se pondrá en contacto contigo pronto para continuar con tu campaña.</p>
            ${htmlApartado(opciones.apartado)}
            ${htmlPago(pago, opciones)}
            <button type="button" class="btn btn--secundario" data-accion="ver-listado">Seguir explorando</button>
        </div>
    `;

}
