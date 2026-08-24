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

async function cargarProvincias() {

    try {

        const respuesta = await api.listarProvincias();

        vallasState.provincias = respuesta.data ?? respuesta;

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

        preview.textContent = "Se usará el código que escribas abajo";

        return;

    }

    const provinciaId = Number(document.getElementById("campoProvincia").value);

    const provincia = vallasState.provincias.find((p) => p.id === provinciaId);

    if (!provincia) {

        preview.textContent = "Seleccioná una provincia";

        return;

    }

    const prefijo = PREFIJOS_PROVINCIA[provincia.nombre] || "XX";

    const cantidadExistente = vallasState.vallas.filter((v) => v.codigo.startsWith(`${prefijo}-`)).length;

    const siguiente = String(cantidadExistente + 1).padStart(3, "0");

    preview.textContent = `${prefijo}-${siguiente}`;

}

function registrarCheckCodigoManual() {

    const checkbox = document.getElementById("checkCodigoManual");

    const campoCodigo = document.getElementById("campoCodigo");

    checkbox.addEventListener("change", () => {

        campoCodigo.classList.toggle("d-none", !checkbox.checked);

        if (!checkbox.checked) {

            campoCodigo.value = "";

        }

        actualizarPreviewCodigo();

    });

    document.getElementById("campoProvincia").addEventListener("change", actualizarPreviewCodigo);

}

function limpiarFormularioNuevaValla({ mantenerProvincia = false } = {}) {

    const provinciaActual = document.getElementById("campoProvincia").value;

    document.getElementById("formNuevaValla").reset();

    if (mantenerProvincia) {

        document.getElementById("campoProvincia").value = provinciaActual;

    }

    document.getElementById("campoCodigo").classList.add("d-none");

    document.getElementById("formNuevaVallaError").classList.add("d-none");

    actualizarPreviewCodigo();

    document.getElementById("campoReferencia").focus();

}

// TEMPORAL: contador de sesión para la carga inicial masiva
let contadorSesion = 0;

async function manejarSubmitNuevaValla(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formNuevaVallaError");

    errorBox.classList.add("d-none");

    const datos = {

        provincia_id: Number(document.getElementById("campoProvincia").value),

        referencia: document.getElementById("campoReferencia").value.trim(),

        latitud: Number(document.getElementById("campoLatitud").value),

        longitud: Number(document.getElementById("campoLongitud").value),

        tamano: document.getElementById("campoTamano").value.trim() || null,

        precio_normal: document.getElementById("campoPrecioNormal").value || null,

        precio_minimo: document.getElementById("campoPrecioMinimo").value || null

    };

    const codigoManual = document.getElementById("checkCodigoManual").checked;

    if (codigoManual) {

        datos.codigo = document.getElementById("campoCodigo").value.trim();

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

        limpiarFormularioNuevaValla({ mantenerProvincia: document.getElementById("checkMantenerProvincia").checked });

        cargarVallas();

        cargarResumen();

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

    document.getElementById("formNuevaValla").addEventListener("submit", manejarSubmitNuevaValla);

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

function registrarClicksListado() {

    document.getElementById("tablaVallasBody").addEventListener("click", (evento) => {

        const fila = evento.target.closest("tr[data-id]");

        if (fila) {

            abrirDetalle(Number(fila.dataset.id));

        }

    });

    document.getElementById("listaVallasMovil").addEventListener("click", (evento) => {

        const tarjeta = evento.target.closest(".sigc-valla-card[data-id]");

        if (tarjeta) {

            abrirDetalle(Number(tarjeta.dataset.id));

        }

    });

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

    registrarClicksListado();

    registrarFiltros();

    registrarCierreDetalle();

    registrarSidebar();

    registrarCheckCodigoManual();       // nueva

    registrarFormularioNuevaValla();    // nueva

    cargarProvincias();

    cargarResumen();

    cargarVallas();

}