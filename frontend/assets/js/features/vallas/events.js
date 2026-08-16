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

import { showError } from "./render/messages.js";

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

    }

    catch (error) {

        console.error(error);

    }

}

async function abrirDetalle(id) {

    try {

        const valla = await api.obtener(id);

        vallasState.vallaSeleccionada = valla;

        renderDetalle(valla);

        document.getElementById("panelDetalleValla").classList.add("is-open");

        renderizarListado();

    }

    catch (error) {

        console.error(error);

        showError("No se pudo cargar el detalle de la valla.");

    }

}

function cerrarDetalle() {

    vallasState.vallaSeleccionada = null;

    document.getElementById("panelDetalleValla").classList.remove("is-open");

    renderizarListado();

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

    cargarProvincias();

    cargarResumen();

    cargarVallas();

}