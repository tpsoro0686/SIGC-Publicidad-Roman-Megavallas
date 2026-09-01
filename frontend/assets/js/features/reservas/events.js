/**
 * ==========================================
 * Eventos del módulo Reservas
 * ==========================================
 */

import reservasState from "./state.js";

import * as api from "./api.js";

import { renderTabla } from "./render/tabla.js";

import { renderTarjetas } from "./render/tarjetas.js";

import { showError } from "./render/messages.js";

import * as contratosApi from "../contratos/api.js";



function mostrarMensajeExito(texto) {

    const mensaje = document.createElement("div");

    mensaje.className = "sigc-mensaje-exito";

    mensaje.innerHTML = `

        <div class="sigc-mensaje-exito__icon">&#10003;</div>

        <div class="sigc-mensaje-exito__codigo">${texto}</div>

        <div class="sigc-mensaje-exito__sub">creada exitosamente</div>

    `;

    document.body.appendChild(mensaje);

    setTimeout(() => {

        mensaje.classList.add("hide");

        setTimeout(() => {

            mensaje.remove();

        }, 200);

    }, 1800);

}

function aplicarFiltroLocal(reservas) {

    const termino = reservasState.filtros.busqueda.trim().toLowerCase();

    if (!termino) {

        return reservas;

    }

    return reservas.filter((reserva) => {

        return reserva.valla.codigo.toLowerCase().includes(termino)

            || reserva.cliente.nombre.toLowerCase().includes(termino);

    });

}

function renderizarListado() {

    const reservasFiltradas = aplicarFiltroLocal(reservasState.reservas);

    renderTabla(reservasFiltradas);

    renderTarjetas(reservasFiltradas);

    const estaVacio = reservasFiltradas.length === 0;

    document.getElementById("sigcEmptyState").classList.toggle("d-none", !estaVacio);

    lucide.createIcons();

}

function renderizarResumen() {

    if (!reservasState.resumen) {

        return;

    }

    Object.entries(reservasState.resumen).forEach(([clave, valor]) => {

        const el = document.querySelector(`[data-stat="${clave}"]`);

        if (el) {

            el.textContent = valor;

        }

    });

}

async function cargarReservas() {

    try {

        const respuesta = await api.listar({

            estado: reservasState.filtros.estado,

            soloMias: reservasState.filtros.soloMias

        });

        reservasState.reservas = respuesta.data ?? respuesta;

        renderizarListado();

    }

    catch (error) {

        console.error(error);

        showError("No se pudieron cargar las reservas.");

    }

}

async function cargarResumen() {

    try {

        reservasState.resumen = await api.obtenerResumen();

        renderizarResumen();

    }

    catch (error) {

        console.error(error);

    }

}

async function cargarVallasDisponibles() {

    try {

        const respuesta = await api.listarVallasDisponibles();

        reservasState.vallasDisponibles = respuesta.data ?? respuesta;

        const select = document.getElementById("campoValla");

        select.innerHTML = `<option value="" disabled selected>Seleccioná una valla disponible</option>`
            + reservasState.vallasDisponibles.map((valla) => `

                <option value="${valla.id}">${valla.codigo} — ${valla.referencia}</option>

            `).join("");

    }

    catch (error) {

        console.error(error);

        showError("No se pudieron cargar las vallas disponibles.");

    }

}

async function manejarSubmitNuevaReserva(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formNuevaReservaError");

    errorBox.classList.add("d-none");

        const datos = {

        valla_id: Number(document.getElementById("campoValla").value),

        cliente_nombre: document.getElementById("campoClienteNombre").value.trim(),

        dias: Number(document.getElementById("campoDias").value) || 3

    };

    try {

        const reservaCreada = await api.crear(datos);

        bootstrap.Modal.getInstance(document.getElementById("modalNuevaReserva")).hide();

        mostrarMensajeExito(`Valla ${reservaCreada.valla.codigo} reservada`);

        document.getElementById("formNuevaReserva").reset();

        document.getElementById("campoDias").value = 3;

        await cargarReservas();

        cargarResumen();

        cargarVallasDisponibles();

    }

    catch (error) {

        console.error(error);

        const mensaje = error?.data?.message || "No se pudo crear la reserva.";

        errorBox.textContent = mensaje;

        errorBox.classList.remove("d-none");

    }

}

async function manejarCancelar(id) {

    try {

        await api.cancelar(id);

        mostrarMensajeExito("Reserva cancelada");

        await cargarReservas();

        cargarResumen();

        cargarVallasDisponibles();

    }

    catch (error) {

        console.error(error);

        showError("No se pudo cancelar la reserva.");

    }

}

let reservaConvirtiendoId = null;

function abrirConvertir(id) {

    const reserva = reservasState.reservas.find((r) => r.id === id);

    reservaConvirtiendoId = id;

    document.getElementById("convertirValaCodigo").textContent = reserva ? `(${reserva.valla.codigo})` : "";

    document.getElementById("formConvertirReserva").reset();

    document.getElementById("formConvertirReservaError").classList.add("d-none");

    const modal = new bootstrap.Modal(document.getElementById("modalConvertirReserva"));

    modal.show();

}

async function manejarSubmitConvertir(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formConvertirReservaError");

    errorBox.classList.add("d-none");

    const datos = {

        reserva_id: reservaConvirtiendoId,

        fecha_inicio: document.getElementById("campoConvertirFechaInicio").value,

        plazo_meses: Number(document.getElementById("campoConvertirPlazo").value),

        monto_usd: Number(document.getElementById("campoConvertirMonto").value)

    };

    try {

        const contratoCreado = await contratosApi.crear(datos);

        bootstrap.Modal.getInstance(document.getElementById("modalConvertirReserva")).hide();

        mostrarMensajeExito(`Contrato ${contratoCreado.codigo} creado`);

        await cargarReservas();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        errorBox.textContent = error?.data?.message || "No se pudo crear el contrato.";

        errorBox.classList.remove("d-none");

    }

}

function registrarFormularioConvertir() {

    document.getElementById("formConvertirReserva").addEventListener("submit", manejarSubmitConvertir);

}

function registrarClicksListado() {

    function manejarClick(evento) {

        const botonCancelar = evento.target.closest("[data-cancelar]");

        const botonConvertir = evento.target.closest("[data-convertir]");

        if (botonCancelar) {

            manejarCancelar(Number(botonCancelar.dataset.cancelar));

        }

        if (botonConvertir) {

            abrirConvertir(Number(botonConvertir.dataset.convertir));

        }

    }

    document.getElementById("tablaReservasBody").addEventListener("click", manejarClick);

    document.getElementById("listaReservasMovil").addEventListener("click", manejarClick);

}

function registrarFiltros() {

    let temporizador = null;

    document.getElementById("filtroBusqueda").addEventListener("input", (evento) => {

        reservasState.filtros.busqueda = evento.target.value;

        clearTimeout(temporizador);

        temporizador = setTimeout(renderizarListado, 250);

    });

    document.getElementById("filtroEstado").addEventListener("change", (evento) => {

        reservasState.filtros.estado = evento.target.value;

        cargarReservas();

    });

    document.querySelectorAll(".sigc-toggle-vista").forEach((boton) => {

        boton.addEventListener("click", () => {

            document.querySelectorAll(".sigc-toggle-vista").forEach((b) => b.classList.remove("is-active"));

            boton.classList.add("is-active");

            reservasState.filtros.soloMias = boton.dataset.vista === "mias";

            cargarReservas();

        });

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

function registrarFormularioNuevaReserva() {

    document.getElementById("btnNuevaReserva").addEventListener("click", () => {

        const modal = new bootstrap.Modal(document.getElementById("modalNuevaReserva"));

        modal.show();

    });

    document.getElementById("formNuevaReserva").addEventListener("submit", manejarSubmitNuevaReserva);

    document.getElementById("modalNuevaReserva").addEventListener("show.bs.modal", () => {

        cargarVallasDisponibles();

    });

}

export function registerEvents() {

    registrarClicksListado();

    registrarFiltros();

    registrarSidebar();

    registrarFormularioNuevaReserva();

    registrarFormularioConvertir();

    cargarResumen();

    cargarReservas();

}