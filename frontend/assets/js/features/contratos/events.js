/**
 * ==========================================
 * Eventos del módulo Contratos
 * ==========================================
 */

import contratosState from "./state.js";

import * as api from "./api.js";

import { renderTabla } from "./render/tabla.js";

import { renderTarjetas } from "./render/tarjetas.js";

import { renderDetalle } from "./render/detalle.js";

import { showError } from "./render/messages.js";

let contratoRenovandoId = null;

function mostrarMensajeExito(texto) {

    const mensaje = document.createElement("div");

    mensaje.className = "sigc-mensaje-exito";

    mensaje.innerHTML = `

        <div class="sigc-mensaje-exito__icon">&#10003;</div>

        <div class="sigc-mensaje-exito__codigo">${texto}</div>

        <div class="sigc-mensaje-exito__sub">actualizado exitosamente</div>

    `;

    document.body.appendChild(mensaje);

    setTimeout(() => {

        mensaje.classList.add("hide");

        setTimeout(() => mensaje.remove(), 200);

    }, 1800);

}

function aplicarFiltroLocal(contratos) {

    const termino = contratosState.filtros.busqueda.trim().toLowerCase();

    if (!termino) {

        return contratos;

    }

    return contratos.filter((contrato) => {

        return contrato.codigo.toLowerCase().includes(termino)

            || contrato.cliente.nombre.toLowerCase().includes(termino)

            || contrato.valla.codigo.toLowerCase().includes(termino);

    });

}

function renderizarListado() {

    const contratosFiltrados = aplicarFiltroLocal(contratosState.contratos);

    renderTabla(contratosFiltrados);

    renderTarjetas(contratosFiltrados);

    document.getElementById("sigcEmptyState").classList.toggle("d-none", contratosFiltrados.length > 0);

    lucide.createIcons();

}

function renderizarResumen() {

    if (!contratosState.resumen) {

        return;

    }

    Object.entries(contratosState.resumen).forEach(([clave, valor]) => {

        const el = document.querySelector(`[data-stat="${clave}"]`);

        if (el) {

            el.textContent = clave === "monto_activo"
                ? `$${Number(valor).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                : valor;

        }

    });

}

async function cargarContratos() {

    try {

        const respuesta = await api.listar({ estado: contratosState.filtros.estado });

        contratosState.contratos = respuesta.data ?? respuesta;

        renderizarListado();

    }

    catch (error) {

        console.error(error);

        showError("No se pudieron cargar los contratos.");

    }

}

async function cargarResumen() {

    try {

        contratosState.resumen = await api.obtenerResumen();

        renderizarResumen();

    }

    catch (error) {

        console.error(error);

    }

}

async function abrirDetalle(id) {

    try {

        const contrato = await api.obtener(id);

        renderDetalle(contrato);

        document.getElementById("panelDetalleContrato").classList.add("is-open");

        document.getElementById("sigcContratosLayout").classList.add("has-detalle");

        lucide.createIcons();

    }

    catch (error) {

        console.error(error);

        showError("No se pudo cargar el detalle del contrato.");

    }

}

function cerrarDetalle() {

    document.getElementById("panelDetalleContrato").classList.remove("is-open");

    document.getElementById("sigcContratosLayout").classList.remove("has-detalle");

}

async function manejarFinalizar(id) {

    const confirmar = window.confirm("¿Finalizar este contrato antes de tiempo? La valla quedará Disponible.");

    if (!confirmar) {

        return;

    }

    try {

        await api.finalizar(id);

        mostrarMensajeExito("Contrato finalizado");

        await cargarContratos();

        cargarResumen();

        abrirDetalle(id);

    }

    catch (error) {

        console.error(error);

        showError(error?.data?.message || "No se pudo finalizar el contrato.");

    }

}

function abrirRenovar(id) {

    contratoRenovandoId = id;

    document.getElementById("formRenovarContratoError").classList.add("d-none");

    const modal = new bootstrap.Modal(document.getElementById("modalRenovarContrato"));

    modal.show();

}

async function manejarSubmitRenovar(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formRenovarContratoError");

    errorBox.classList.add("d-none");

    const datos = {

        plazo_meses: Number(document.getElementById("campoRenovarPlazo").value),

        fecha_inicio: document.getElementById("campoRenovarFechaInicio").value,

        monto_usd: document.getElementById("campoRenovarMonto").value || null

    };

    try {

        await api.renovar(contratoRenovandoId, datos);

        bootstrap.Modal.getInstance(document.getElementById("modalRenovarContrato")).hide();

        mostrarMensajeExito("Contrato renovado");

        await cargarContratos();

        cargarResumen();

        abrirDetalle(contratoRenovandoId);

    }

    catch (error) {

        console.error(error);

        errorBox.textContent = error?.data?.message || "No se pudo renovar el contrato.";

        errorBox.classList.remove("d-none");

    }

}

async function manejarEliminar(id) {

    const confirmar = window.confirm("¿Eliminar este contrato? Esta acción no se puede deshacer.");

    if (!confirmar) {

        return;

    }

    try {

        await api.eliminar(id);

        mostrarMensajeExito("Contrato eliminado");

        cerrarDetalle();

        await cargarContratos();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        showError(error?.data?.message || "No se pudo eliminar el contrato.");

    }

}

function registrarClicksListado() {

    function manejarClick(evento) {

        const fila = evento.target.closest("tr[data-id]") || evento.target.closest(".sigc-valla-card[data-id]");

        if (fila) {

            abrirDetalle(Number(fila.dataset.id));

        }

    }

    document.getElementById("tablaContratosBody").addEventListener("click", manejarClick);

    document.getElementById("listaContratosMovil").addEventListener("click", manejarClick);

}

function registrarClicksDetalle() {

    document.getElementById("detalleContratoBody").addEventListener("click", (evento) => {

        const botonFinalizar = evento.target.closest("#btnFinalizarContrato");

        const botonRenovar = evento.target.closest("#btnRenovarContrato");

        const botonEliminar = evento.target.closest("#btnEliminarContrato");

        if (botonFinalizar) {

            manejarFinalizar(Number(botonFinalizar.dataset.id));

        }

        if (botonRenovar) {

            abrirRenovar(Number(botonRenovar.dataset.id));

        }

        if (botonEliminar) {

            manejarEliminar(Number(botonEliminar.dataset.id));

        }

    });

}

function registrarFiltros() {

    let temporizador = null;

    document.getElementById("filtroBusqueda").addEventListener("input", (evento) => {

        contratosState.filtros.busqueda = evento.target.value;

        clearTimeout(temporizador);

        temporizador = setTimeout(renderizarListado, 250);

    });

    document.getElementById("filtroEstado").addEventListener("change", (evento) => {

        contratosState.filtros.estado = evento.target.value;

        cargarContratos();

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

async function cargarVallasDisponibles() {

    try {

        const respuesta = await api.listarVallasDisponibles();

        const vallas = respuesta.data ?? respuesta;

        const select = document.getElementById("campoContratoValla");

        select.innerHTML = `<option value="" disabled selected>Seleccioná una valla disponible</option>`
            + vallas.map((valla) => `<option value="${valla.id}">${valla.codigo} — ${valla.referencia}</option>`).join("");

    }

    catch (error) {

        console.error(error);

        showError("No se pudieron cargar las vallas disponibles.");

    }

}

async function manejarSubmitNuevoContrato(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formNuevoContratoError");

    errorBox.classList.add("d-none");

    const datos = {

        valla_id: Number(document.getElementById("campoContratoValla").value),

        cliente_nombre: document.getElementById("campoContratoCliente").value.trim(),

        fecha_inicio: document.getElementById("campoContratoFechaInicio").value,

        plazo_meses: Number(document.getElementById("campoContratoPlazo").value),

        monto_usd: Number(document.getElementById("campoContratoMonto").value)

    };

    try {

        const contratoCreado = await api.crear(datos);

        bootstrap.Modal.getInstance(document.getElementById("modalNuevoContrato")).hide();

        mostrarMensajeExito(`Contrato ${contratoCreado.codigo} creado`);

        document.getElementById("formNuevoContrato").reset();

        await cargarContratos();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        errorBox.textContent = error?.data?.message || "No se pudo crear el contrato.";

        errorBox.classList.remove("d-none");

    }

}

function registrarFormularioNuevoContrato() {

    document.getElementById("btnNuevoContrato").addEventListener("click", () => {

        cargarVallasDisponibles();

        const modal = new bootstrap.Modal(document.getElementById("modalNuevoContrato"));

        modal.show();

    });

    document.getElementById("formNuevoContrato").addEventListener("submit", manejarSubmitNuevoContrato);

}

function registrarFormularioRenovar() {

    document.getElementById("formRenovarContrato").addEventListener("submit", manejarSubmitRenovar);

}

export function registerEvents() {

    registrarClicksListado();

    registrarClicksDetalle();

    registrarFiltros();

    registrarCierreDetalle();

    registrarSidebar();

    registrarFormularioRenovar();

    registrarFormularioNuevoContrato();

    cargarResumen();

    cargarContratos();

}