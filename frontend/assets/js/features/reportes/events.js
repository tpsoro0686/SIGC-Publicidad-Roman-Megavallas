/**
 * ==========================================
 * Eventos del módulo Reportes
 * ==========================================
 */

import reportesState from "./state.js";

import * as api from "./api.js";

import { renderTabla } from "./render/tabla.js";

import { renderTarjetas } from "./render/tarjetas.js";

import { showError } from "./render/messages.js";

import { getUser } from "../../core/auth.js";

function mostrarMensajeExito(texto) {

    const mensaje = document.createElement("div");

    mensaje.className = "sigc-mensaje-exito";

    mensaje.innerHTML = `

        <div class="sigc-mensaje-exito__icon">&#10003;</div>

        <div class="sigc-mensaje-exito__codigo">${texto}</div>

        <div class="sigc-mensaje-exito__sub">generado exitosamente</div>

    `;

    document.body.appendChild(mensaje);

    setTimeout(() => {

        mensaje.classList.add("hide");

        setTimeout(() => mensaje.remove(), 200);

    }, 1800);

}

function aplicarFiltroLocal(reportes) {

    const termino = reportesState.filtros.busqueda.trim().toLowerCase();

    let resultado = reportes;

    if (reportesState.filtros.tipo) {

        resultado = resultado.filter((r) => r.tipo === reportesState.filtros.tipo);

    }

    if (termino) {

        resultado = resultado.filter((r) => r.usuario.toLowerCase().includes(termino) || r.tipo.toLowerCase().includes(termino));

    }

    return resultado;

}

function renderizarListado() {

    const filtrados = aplicarFiltroLocal(reportesState.reportes);

    renderTabla(filtrados);

    renderTarjetas(filtrados);

    document.getElementById("sigcEmptyState").classList.toggle("d-none", filtrados.length > 0);

    lucide.createIcons();

}

function renderizarResumen() {

    if (!reportesState.resumen) {

        return;

    }

    Object.entries(reportesState.resumen).forEach(([clave, valor]) => {

        const el = document.querySelector(`[data-stat="${clave}"]`);

        if (!el) {

            return;

        }

        el.textContent = clave === "ingresos_totales"
            ? `$${Number(valor).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
            : valor;

    });

    ["reservas_activas", "vallas_disponibles"].forEach((clave) => {

        const tarjeta = document.querySelector(`[data-stat-card="${clave}"]`);

        if (tarjeta) {

            tarjeta.classList.toggle("d-none", !(clave in reportesState.resumen));

        }

    });

}

async function cargarReportes() {

    try {

        const respuesta = await api.listar();

        reportesState.reportes = respuesta.data ?? respuesta;

        renderizarListado();

    }

    catch (error) {

        console.error(error);

        showError("No se pudieron cargar los reportes.");

    }

}

async function cargarResumen() {

    try {

        reportesState.resumen = await api.obtenerResumen();

        renderizarResumen();

    }

    catch (error) {

        console.error(error);

    }

}

async function cargarTiposPermitidos() {

    try {

        reportesState.tiposPermitidos = await api.obtenerTipos();

        const select = document.getElementById("campoReporteTipo");

        select.innerHTML = `<option value="" disabled selected>Seleccioná un tipo</option>`
            + reportesState.tiposPermitidos.map((tipo) => `<option value="${tipo}">${tipo}</option>`).join("");

        const selectFiltro = document.getElementById("filtroTipo");

        selectFiltro.innerHTML = `<option value="">Tipo: Todos</option>`
            + reportesState.tiposPermitidos.map((tipo) => `<option value="${tipo}">${tipo}</option>`).join("");

    }

    catch (error) {

        console.error(error);

    }

}

async function manejarSubmitGenerar(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formGenerarReporteError");

    errorBox.classList.add("d-none");

    const datos = {

        tipo: document.getElementById("campoReporteTipo").value,

        fecha_desde: document.getElementById("campoReporteFechaDesde").value || null,

        fecha_hasta: document.getElementById("campoReporteFechaHasta").value || null

    };

    const boton = document.getElementById("btnGenerarReporte");

    boton.disabled = true;

    boton.textContent = "Generando...";

    try {

        const reporteCreado = await api.generar(datos);

        bootstrap.Modal.getInstance(document.getElementById("modalGenerarReporte")).hide();

        mostrarMensajeExito(`Reporte de ${reporteCreado.tipo}`);

        document.getElementById("formGenerarReporte").reset();

        await cargarReportes();

    }

    catch (error) {

        console.error(error);

        errorBox.textContent = error?.data?.message || "No se pudo generar el reporte.";

        errorBox.classList.remove("d-none");

    }

    finally {

        boton.disabled = false;

        boton.textContent = "Generar reporte";

    }

}

async function manejarDescarga(id, tipo) {

    try {

        await api.descargar(id, `Reporte-${tipo}-${id}.pdf`);

    }

    catch (error) {

        console.error(error);

        showError("No se pudo descargar el archivo.");

    }

}

let urlVistaPreviaActual = null;

async function abrirVistaPrevia(id) {

    const frame = document.getElementById("reportePreviewFrame");

    const modal = new bootstrap.Modal(document.getElementById("modalVistaPreviaReporte"));

    frame.src = "about:blank";

    modal.show();

    try {

        const blob = await api.obtenerBlob(id);

        if (urlVistaPreviaActual) {

            window.URL.revokeObjectURL(urlVistaPreviaActual);

        }

        urlVistaPreviaActual = window.URL.createObjectURL(blob);

        frame.src = urlVistaPreviaActual;

    }

    catch (error) {

        console.error(error);

        modal.hide();

        showError("No se pudo cargar la vista previa del reporte.");

    }

}

function registrarModalVistaPrevia() {

    document.getElementById("modalVistaPreviaReporte").addEventListener("hidden.bs.modal", () => {

        document.getElementById("reportePreviewFrame").src = "about:blank";

        if (urlVistaPreviaActual) {

            window.URL.revokeObjectURL(urlVistaPreviaActual);

            urlVistaPreviaActual = null;

        }

    });

}

function registrarClicksListado() {

    function manejarClick(evento) {

        const botonPdf = evento.target.closest("[data-descargar-pdf]");

        if (botonPdf) {

            const id = Number(botonPdf.dataset.descargarPdf);

            const reporte = reportesState.reportes.find((r) => r.id === id);

            manejarDescarga(id, reporte?.tipo ?? "reporte");

            return;

        }

        const fila = evento.target.closest("[data-id]");

        if (fila) {

            const id = Number(fila.dataset.id);

            abrirVistaPrevia(id);

        }

    }

    document.getElementById("tablaReportesBody").addEventListener("click", manejarClick);

    document.getElementById("listaReportesMovil").addEventListener("click", manejarClick);

}

function registrarFiltros() {

    let temporizador = null;

    document.getElementById("filtroBusqueda").addEventListener("input", (evento) => {

        reportesState.filtros.busqueda = evento.target.value;

        clearTimeout(temporizador);

        temporizador = setTimeout(renderizarListado, 250);

    });

    document.getElementById("filtroTipo").addEventListener("change", (evento) => {

        reportesState.filtros.tipo = evento.target.value;

        renderizarListado();

    });

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

function registrarFormularioGenerar() {

    document.getElementById("btnGenerarReporteAbrir").addEventListener("click", () => {

        const modal = new bootstrap.Modal(document.getElementById("modalGenerarReporte"));

        modal.show();

    });

    document.getElementById("formGenerarReporte").addEventListener("submit", manejarSubmitGenerar);

    document.getElementById("modalGenerarReporte").addEventListener("hidden.bs.modal", () => {

        document.getElementById("formGenerarReporte").reset();

        document.getElementById("formGenerarReporteError").classList.add("d-none");

    });

}

export function registerEvents() {

    const btnGenerar = document.getElementById("btnGenerarReporteAbrir");

    if (getUser()?.rol?.nombre === "Dueño") {

        btnGenerar.classList.add("d-none");

    } else {

        registrarFormularioGenerar();

        cargarTiposPermitidos();

    }

    registrarClicksListado();

    registrarModalVistaPrevia();

    registrarFiltros();

    registrarSidebar();

    cargarResumen();

    cargarReportes();

}