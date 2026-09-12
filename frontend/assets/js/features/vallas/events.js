/**
 * ==========================================
 * Eventos del módulo Vallas
 * ==========================================
 */

import vallasState from "./state.js";

import * as api from "./api.js";

import { renderTabla } from "./render/tabla.js";

import { renderTarjetas } from "./render/tarjetas.js";

import { renderDetalle } from "./render/detalle.js";

import { showError, showSuccess } from "./render/messages.js";

import { tieneRol, puedeEscribir } from "../../core/auth.js";

import * as reservasApi from "../reservas/api.js";

import * as contratosApi from "../contratos/api.js";



let vallaEditandoId = null;

let vallaReservandoId = null;

let vallaContratandoId = null;

function aplicarFiltroLocal(vallas) {

    const termino = vallasState.filtros.busqueda.trim().toLowerCase();

    if (!termino) {

        return vallas;

    }

    return vallas.filter((valla) => {

        return valla.codigo.toLowerCase().includes(termino)

            || valla.referencia.toLowerCase().includes(termino)

            || (valla.provincia?.nombre ?? "").toLowerCase().includes(termino);

    });

}

function renderizarListado() {

    const vallasFiltradas = aplicarFiltroLocal(vallasState.vallas);

    const idSeleccionada = vallasState.vallaSeleccionada?.id ?? null;

    renderTabla(vallasFiltradas, idSeleccionada);

    renderTarjetas(vallasFiltradas);

    const estaVacio = vallasFiltradas.length === 0;

    document.getElementById("sigcEmptyState").classList.toggle("d-none", !estaVacio);

    lucide.createIcons();

}

function renderizarResumen() {

    if (!vallasState.resumen) {

        return;

    }

    Object.entries(vallasState.resumen).forEach(([clave, valor]) => {

        const el = document.querySelector(`[data-stat="${clave}"]`);

        if (el) {

            el.textContent = valor;

        }

    });

}

async function cargarVallas() {

    try {

        const respuesta = await api.listar({

            estado: vallasState.filtros.estado,

            provincia_id: vallasState.filtros.provincia_id

        });

        vallasState.vallas = respuesta.data ?? respuesta;

        renderizarListado();

    }

    catch (error) {

        console.error(error);

        showError("No se pudieron cargar las vallas.");

    }

}

async function cargarResumen() {

    try {

        vallasState.resumen = await api.obtenerResumen();

        renderizarResumen();

    }

    catch (error) {

        console.error(error);

    }

}

const ORDEN_PROVINCIAS = [
    "San Jose",
    "Alajuela",
    "San Carlos",
    "Cartago",
    "Heredia",
    "Puntarenas",
    "Guanacaste",
    "Limon"
];

function ordenarProvincias(provincias) {

    return [...provincias].sort((a, b) => {

        const posA = ORDEN_PROVINCIAS.indexOf(a.nombre);

        const posB = ORDEN_PROVINCIAS.indexOf(b.nombre);

        return (posA === -1 ? ORDEN_PROVINCIAS.length : posA)
            - (posB === -1 ? ORDEN_PROVINCIAS.length : posB);

    });

}

async function cargarProvincias() {

    try {

        const respuesta = await api.listarProvincias();

                vallasState.provincias = ordenarProvincias(respuesta.data ?? respuesta);

        const select = document.getElementById("filtroProvincia");

        vallasState.provincias.forEach((provincia) => {

            const option = document.createElement("option");

            option.value = provincia.id;

            option.textContent = provincia.nombre;

            select.appendChild(option);

        });

        llenarSelectProvincias();

    }

    catch (error) {

        console.error(error);

    }

}

function llenarSelectProvincias() {

    const select = document.getElementById("campoProvincia");

    vallasState.provincias.forEach((provincia) => {

        const option = document.createElement("option");

        option.value = provincia.id;

        option.textContent = provincia.nombre;

        select.appendChild(option);

    });

}

const PREFIJOS_PROVINCIA = {

    "San Jose": "SJ",

    "Alajuela": "A",

    "San Carlos": "Q",

    "Cartago": "C",

    "Heredia": "H",

    "Guanacaste": "G",

    "Puntarenas": "P",

    "Limon": "L"

};

function actualizarPreviewCodigo() {

    const checkbox = document.getElementById("checkCodigoManual");

    const preview = document.getElementById("codigoPreview");

    if (checkbox.checked) {

        return;

    }

    preview.value = "";

    const provinciaId = Number(document.getElementById("campoProvincia").value);

    const provincia = vallasState.provincias.find((p) => p.id === provinciaId);

    if (!provincia) {

        preview.placeholder = "Seleccioná una provincia";

        return;

    }

    const prefijo = PREFIJOS_PROVINCIA[provincia.nombre] || "XX";

    const cantidadExistente = vallasState.vallas.filter((v) => v.codigo.startsWith(`${prefijo}-`)).length;

    const siguiente = String(cantidadExistente + 1).padStart(3, "0");

    preview.value = `${prefijo}-${siguiente}`;

}

function registrarCheckCodigoManual() {

    const checkbox = document.getElementById("checkCodigoManual");

    const inputCodigo = document.getElementById("codigoPreview");

    checkbox.addEventListener("change", () => {

        inputCodigo.readOnly = !checkbox.checked;

        if (checkbox.checked) {

            inputCodigo.value = "";
            inputCodigo.placeholder = "Escribí el código";
            inputCodigo.focus();

        } else {

            actualizarPreviewCodigo();

        }

    });

    document.getElementById("campoProvincia").addEventListener("change", () => {

        if (!checkbox.checked) {

            actualizarPreviewCodigo();

        }

    });

}

function limpiarFormularioNuevaValla({ mantenerProvincia = false } = {}) {

    const provinciaActual = document.getElementById("campoProvincia").value;

    document.getElementById("formNuevaValla").reset();

    if (mantenerProvincia) {

        document.getElementById("campoProvincia").value = provinciaActual;

    }

    document.getElementById("formNuevaVallaError").classList.add("d-none");

    actualizarPreviewCodigo();

    document.getElementById("campoReferencia").focus();

}

// TEMPORAL: contador de sesión para la carga inicial masiva
let contadorSesion = 0;

function mostrarMensajeExito(codigo) {

    const mensaje = document.createElement("div");

    mensaje.className = "sigc-mensaje-exito";

    mensaje.innerHTML = `

        <div class="sigc-mensaje-exito__icon">&#10003;</div>

        <div class="sigc-mensaje-exito__codigo"> ${codigo}</div>

       

    `;

    document.body.appendChild(mensaje);

    setTimeout(() => {

        mensaje.classList.add("hide");

        setTimeout(() => {

            mensaje.remove();

        }, 200);

    }, 2000);

}

function parseDMS(texto) {

    const normalizado = texto
        .trim()
        .replace(/[º]/g, "°")
        .replace(/[’′]/g, "'")
        .replace(/[”″]/g, "\"");

    const regex = /^(\d{1,3})°\s*(\d{1,2})'\s*(\d{1,2}(?:\.\d+)?)"\s*([NSEWnsew])$/;

    const match = normalizado.match(regex);

    if (!match) {

        return null;

    }

    const grados = Number(match[1]);

    const minutos = Number(match[2]);

    const segundos = Number(match[3]);

    const hemisferio = match[4].toUpperCase();

    let decimal = grados + (minutos / 60) + (segundos / 3600);

    if (hemisferio === "S" || hemisferio === "W") {

        decimal = -decimal;

    }

    return decimal;

}

function formatDMS(decimal, tipo) {

    const hemisferio = tipo === "lat"
        ? (decimal >= 0 ? "N" : "S")
        : (decimal >= 0 ? "E" : "W");

    const absoluto = Math.abs(decimal);

    const grados = Math.floor(absoluto);

    const minutosDecimal = (absoluto - grados) * 60;

    const minutos = Math.floor(minutosDecimal);

    const segundos = (minutosDecimal - minutos) * 60;

    const minutosStr = String(minutos).padStart(2, "0");

    const segundosStr = segundos.toFixed(1).padStart(4, "0");

    return `${grados}°${minutosStr}'${segundosStr}"${hemisferio}`;

}

async function manejarSubmitNuevaValla(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formNuevaVallaError");

    errorBox.classList.add("d-none");

        const latitud = parseDMS(document.getElementById("campoLatitud").value);

    const longitud = parseDMS(document.getElementById("campoLongitud").value);

    if (latitud === null || longitud === null) {

        errorBox.textContent = "Latitud y longitud deben tener el formato 10°00'03.0\"N";

        errorBox.classList.remove("d-none");

        return;

    }

    const datos = {

        provincia_id: Number(document.getElementById("campoProvincia").value),

        referencia: document.getElementById("campoReferencia").value.trim(),

        latitud: latitud,

        longitud: longitud,

        tamano: document.getElementById("campoTamano").value.trim() || null,

        vehiculos_diarios: document.getElementById("campoVehiculosDiarios").value || null,

        precio_normal: document.getElementById("campoPrecioNormal").value || null,

        precio_minimo: document.getElementById("campoPrecioMinimo").value || null,

        precio_instalacion: document.getElementById("campoPrecioInstalacion").value || null
    };

    const codigoManual = document.getElementById("checkCodigoManual").checked;

    if (codigoManual) {

        datos.codigo = document.getElementById("codigoPreview").value.trim();

    }

    const boton = document.getElementById("btnGuardarValla");

    boton.disabled = true;

    boton.textContent = "Guardando...";

    try {

                const vallaCreada = await api.crear(datos);

        // TEMPORAL: actualizar contador y última creada, sin cerrar el modal
        contadorSesion += 1;

        document.getElementById("contadorSesion").textContent = contadorSesion;

        document.getElementById("ultimaCreada").textContent = vallaCreada.codigo;

        mostrarMensajeExito(`Valla ${vallaCreada.codigo} agregada correctamente.`);

        await cargarVallas();

        cargarResumen();

        limpiarFormularioNuevaValla({ mantenerProvincia: document.getElementById("checkMantenerProvincia").checked });

    }

    catch (error) {

        console.error(error);

        errorBox.textContent = error?.message || "No se pudo crear la valla.";

        errorBox.classList.remove("d-none");

    }

    finally {

        boton.disabled = false;

        boton.textContent = "Agregar";

    }

}

function registrarFormularioNuevaValla() {
    

    document.getElementById("formNuevaValla").addEventListener("submit", (evento) => {

        if (vallaEditandoId) {

            manejarSubmitEditarValla(evento);

        } else {

            manejarSubmitNuevaValla(evento);

        }

    });

    document.getElementById("btnNuevaValla").addEventListener("click", () => {

        contadorSesion = 0;                                          // nueva línea

        document.getElementById("contadorSesion").textContent = "0";  // nueva línea

        document.getElementById("ultimaCreada").textContent = "—";    // nueva línea

        const modal = new bootstrap.Modal(document.getElementById("modalNuevaValla"));

        modal.show();

    });

}

async function abrirDetalle(id) {

    try {

        const valla = await api.obtener(id);

        vallasState.vallaSeleccionada = valla;

        renderDetalle(valla);

        document.getElementById("panelDetalleValla").classList.add("is-open");

        document.getElementById("sigcVallasLayout").classList.add("has-detalle");

        renderizarListado();

        lucide.createIcons();
 
    }

    catch (error) {

        console.error(error);

        showError("No se pudo cargar el detalle de la valla.");

    }

}

function cerrarDetalle() {

    vallasState.vallaSeleccionada = null;

    document.getElementById("panelDetalleValla").classList.remove("is-open");

    document.getElementById("sigcVallasLayout").classList.remove("has-detalle");

    renderizarListado();

    lucide.createIcons();

}

async function abrirEdicion(id) {

    try {

        const valla = await api.obtener(id);

        vallaEditandoId = id;

        document.getElementById("campoProvincia").value = valla.provincia?.id ?? "";
        document.getElementById("campoProvincia").disabled = true;

        document.getElementById("checkCodigoManual").checked = false;
        document.getElementById("checkCodigoManual").disabled = true;
        document.getElementById("codigoPreview").readOnly = true;
        document.getElementById("codigoPreview").value = valla.codigo;

        document.getElementById("campoReferencia").value = valla.referencia;
        document.getElementById("campoLatitud").value = formatDMS(Number(valla.latitud), "lat");
        document.getElementById("campoLongitud").value = formatDMS(Number(valla.longitud), "lon");
        document.getElementById("campoTamano").value = valla.tamano ?? "";
        document.getElementById("campoTamano").value = valla.tamano ?? "";

        document.getElementById("campoVehiculosDiarios").value = valla.vehiculos_diarios ?? "";
        document.getElementById("campoPrecioNormal").value = valla.precio_normal ?? "";
        document.getElementById("campoPrecioMinimo").value = valla.precio_minimo ?? "";

        document.getElementById("campoPrecioMinimo").value = valla.precio_minimo ?? "";

        document.getElementById("campoPrecioInstalacion").value = valla.precio_instalacion ?? "";

        document.querySelector("#modalNuevaValla .modal-title").textContent = "Editar valla";
        document.getElementById("btnGuardarValla").textContent = "Guardar cambios";
        document.querySelector(".sigc-carga-masiva-header").classList.add("d-none");
        document.getElementById("checkMantenerProvincia").closest(".form-check").classList.add("d-none");

        const modal = new bootstrap.Modal(document.getElementById("modalNuevaValla"));

        modal.show();

    }

    catch (error) {

        console.error(error);

        showError("No se pudo cargar la valla para editar.");

    }

}

async function manejarSubmitEditarValla(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formNuevaVallaError");

    errorBox.classList.add("d-none");

    const latitud = parseDMS(document.getElementById("campoLatitud").value);

    const longitud = parseDMS(document.getElementById("campoLongitud").value);

    if (latitud === null || longitud === null) {

        errorBox.textContent = "Latitud y longitud deben tener el formato 10°00'03.0\"N";

        errorBox.classList.remove("d-none");

        return;

    }

    const datos = {

        referencia: document.getElementById("campoReferencia").value.trim(),

        latitud: latitud,

        longitud: longitud,

        tamano: document.getElementById("campoTamano").value.trim() || null,

        vehiculos_diarios: document.getElementById("campoVehiculosDiarios").value || null,

        precio_normal: document.getElementById("campoPrecioNormal").value || null,

        precio_minimo: document.getElementById("campoPrecioMinimo").value || null,

        precio_instalacion: document.getElementById("campoPrecioInstalacion").value || null
    };

    const boton = document.getElementById("btnGuardarValla");

    boton.disabled = true;

    boton.textContent = "Guardando...";

    try {

        const vallaActualizada = await api.actualizar(vallaEditandoId, datos);

        bootstrap.Modal.getInstance(document.getElementById("modalNuevaValla")).hide();

        mostrarMensajeExito(`Valla ${vallaActualizada.codigo} actualizada`);

        await cargarVallas();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        errorBox.textContent = error?.message || "No se pudo actualizar la valla.";

        errorBox.classList.remove("d-none");

    }

    finally {

        boton.disabled = false;

        boton.textContent = "Guardar cambios";

    }

}

function registrarResetModalNuevaValla() {

    document.getElementById("modalNuevaValla").addEventListener("hidden.bs.modal", () => {

        vallaEditandoId = null;

        document.getElementById("campoProvincia").disabled = false;

        document.getElementById("checkCodigoManual").disabled = false;

        document.querySelector("#modalNuevaValla .modal-title").textContent = "Nueva valla";

        document.getElementById("btnGuardarValla").textContent = "Agregar";

        document.querySelector(".sigc-carga-masiva-header").classList.remove("d-none");

        document.getElementById("checkMantenerProvincia").closest(".form-check").classList.remove("d-none");

        limpiarFormularioNuevaValla({ mantenerProvincia: document.getElementById("checkMantenerProvincia").checked });

    });

}

async function manejarArchivar(id) {

    const confirmar = window.confirm("¿Archivar esta valla? Pasará a estado Inactiva.");

    if (!confirmar) {

        return;

    }

    try {

        await api.cambiarEstado(id, "Inactiva");

        mostrarMensajeExito("Valla archivada");

        await cargarVallas();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        showError("No se pudo archivar la valla.");

    }

}

function abrirMiniReserva(id) {

    const valla = vallasState.vallas.find((v) => v.id === id);

    vallaReservandoId = id;

    document.getElementById("reservarValaCodigo").textContent = valla ? `(${valla.codigo})` : "";

    document.getElementById("formReservarValla").reset();

    document.getElementById("campoReservaDias").value = 3;

    document.getElementById("formReservarVallaError").classList.add("d-none");

    const modal = new bootstrap.Modal(document.getElementById("modalReservarValla"));

    modal.show();

}

async function manejarSubmitReservarValla(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formReservarVallaError");

    errorBox.classList.add("d-none");

    const datos = {

        valla_id: vallaReservandoId,

        cliente_nombre: document.getElementById("campoReservaCliente").value.trim(),

        dias: Number(document.getElementById("campoReservaDias").value) || 3

    };

    try {

        await reservasApi.crear(datos);

        bootstrap.Modal.getInstance(document.getElementById("modalReservarValla")).hide();

        mostrarMensajeExito("Valla reservada");

        await cargarVallas();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        const mensaje = error?.data?.message || error?.message || "No se pudo crear la reserva.";

        errorBox.textContent = mensaje;

        errorBox.classList.remove("d-none");

    }

}

function abrirMiniContrato(id) {

    const valla = vallasState.vallas.find((v) => v.id === id);

    vallaContratandoId = id;

    document.getElementById("contratoValaCodigo").textContent = valla ? `(${valla.codigo})` : "";

    document.getElementById("formContratoValla").reset();

    document.getElementById("formContratoValaError").classList.add("d-none");

    const modal = new bootstrap.Modal(document.getElementById("modalContratoValla"));

    modal.show();

}

async function manejarSubmitContratoValla(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formContratoValaError");

    errorBox.classList.add("d-none");

    const datos = {

        valla_id: vallaContratandoId,

        cliente_nombre: document.getElementById("campoContratoValaCliente").value.trim(),

        fecha_inicio: document.getElementById("campoContratoValaFechaInicio").value,

        plazo_meses: Number(document.getElementById("campoContratoValaPlazo").value),

        monto_usd: Number(document.getElementById("campoContratoValaMonto").value)

    };

    try {

        const contratoCreado = await contratosApi.crear(datos);

        bootstrap.Modal.getInstance(document.getElementById("modalContratoValla")).hide();

        mostrarMensajeExito(`Contrato ${contratoCreado.codigo} creado`);

        await cargarVallas();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        const mensaje = error?.data?.message || error?.message || "No se pudo crear el contrato.";

        errorBox.textContent = mensaje;

        errorBox.classList.remove("d-none");

    }

}

function registrarFormularioContratoValla() {

    document.getElementById("formContratoValla").addEventListener("submit", manejarSubmitContratoValla);

}

function registrarFormularioReservarValla() {

    document.getElementById("formReservarValla").addEventListener("submit", manejarSubmitReservarValla);

}

function registrarClicksListado() {

    function manejarClick(evento) {

        const botonEditar = evento.target.closest("[data-editar]");

        const botonArchivar = evento.target.closest("[data-archivar]");

        const botonReservar = evento.target.closest("[data-reservar]");

        const botonContrato = evento.target.closest("[data-contrato]");

        if (botonEditar) {

            abrirEdicion(Number(botonEditar.dataset.editar));

            return;

        }

        if (botonArchivar && !botonArchivar.disabled) {

            manejarArchivar(Number(botonArchivar.dataset.archivar));

            return;

        }

        if (botonReservar && !botonReservar.disabled) {

            abrirMiniReserva(Number(botonReservar.dataset.reservar));

            return;

        }

        if (botonContrato && !botonContrato.disabled) {

            abrirMiniContrato(Number(botonContrato.dataset.contrato));

            return;

        }

        const fila = evento.target.closest("tr[data-id]") || evento.target.closest(".sigc-valla-card[data-id]");

        if (fila) {

            abrirDetalle(Number(fila.dataset.id));

        }

    }

    document.getElementById("tablaVallasBody").addEventListener("click", manejarClick);

    document.getElementById("listaVallasMovil").addEventListener("click", manejarClick);

}

function registrarFiltros() {

    let temporizador = null;

    document.getElementById("filtroBusqueda").addEventListener("input", (evento) => {

        vallasState.filtros.busqueda = evento.target.value;

        clearTimeout(temporizador);

        temporizador = setTimeout(renderizarListado, 250);

    });

    document.getElementById("filtroProvincia").addEventListener("change", (evento) => {

        vallasState.filtros.provincia_id = evento.target.value;

        cargarVallas();

    });

    document.getElementById("filtroEstado").addEventListener("change", (evento) => {

        vallasState.filtros.estado = evento.target.value;

        cargarVallas();

    });

    document.getElementById("btnLimpiarFiltros").addEventListener("click", () => {

        vallasState.filtros = { busqueda: "", provincia_id: "", estado: "" };

        document.getElementById("filtroBusqueda").value = "";

        document.getElementById("filtroProvincia").value = "";

        document.getElementById("filtroEstado").value = "";

        cargarVallas();

    });

}

function registrarCierreDetalle() {

    document.getElementById("btnCerrarDetalle").addEventListener("click", cerrarDetalle);

    document.getElementById("btnCerrarDetalleDesktop").addEventListener("click", cerrarDetalle);

}

function registrarSidebar() {

    const sidebar = document.getElementById("sigcSidebar");

    const overlay = document.getElementById("sigcOverlay");

    document.getElementById("btnMenu").addEventListener("click", () => {

        sidebar.classList.add("is-open");

        overlay.classList.add("is-open");

    });

    overlay.addEventListener("click", () => {

        sidebar.classList.remove("is-open");

        overlay.classList.remove("is-open");

    });

}

export function registerEvents() {

    if (!tieneRol("Administrador Sistema", "Administrador Empresa", "Ejecutivo", "Dueño")) {

        document.getElementById("sigcContent").innerHTML = `

            <div class="sigc-empty-state">
                <i data-lucide="lock"></i>
                <p>No tenés permisos para acceder a este módulo. Contactá a un administrador.</p>
            </div>

        `;

        lucide.createIcons();

        return;

    }

    registrarClicksListado();

    registrarFiltros();

    registrarCierreDetalle();

    registrarSidebar();

    registrarCheckCodigoManual();

    registrarFormularioNuevaValla();

    registrarFormularioReservarValla();

    registrarFormularioContratoValla();

    registrarResetModalNuevaValla();

    cargarProvincias();

    cargarResumen();

    cargarVallas();

}