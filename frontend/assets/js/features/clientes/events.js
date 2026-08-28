/**
 * ==========================================
 * Eventos del módulo Clientes
 * ==========================================
 */

import clientesState from "./state.js";

import * as api from "./api.js";

import { renderTabla } from "./render/tabla.js";

import { renderTarjetas } from "./render/tarjetas.js";

import { renderDetalle } from "./render/detalle.js";

import { showError } from "./render/messages.js";

let clienteEditandoId = null;

function mostrarMensajeExito(texto) {

    const mensaje = document.createElement("div");

    mensaje.className = "sigc-mensaje-exito";

    mensaje.innerHTML = `

        <div class="sigc-mensaje-exito__icon">&#10003;</div>

        <div class="sigc-mensaje-exito__codigo">${texto}</div>

        <div class="sigc-mensaje-exito__sub">guardado exitosamente</div>

    `;

    document.body.appendChild(mensaje);

    setTimeout(() => {

        mensaje.classList.add("hide");

        setTimeout(() => mensaje.remove(), 200);

    }, 1800);

}

function aplicarFiltroLocal(clientes) {

    const termino = clientesState.filtros.busqueda.trim().toLowerCase();

    if (!termino) {

        return clientes;

    }

    return clientes.filter((cliente) => {

        return cliente.nombre.toLowerCase().includes(termino)

            || cliente.cedula.toLowerCase().includes(termino);

    });

}

function renderizarListado() {

    const clientesFiltrados = aplicarFiltroLocal(clientesState.clientes);

    renderTabla(clientesFiltrados);

    renderTarjetas(clientesFiltrados);

    document.getElementById("sigcEmptyState").classList.toggle("d-none", clientesFiltrados.length > 0);

    lucide.createIcons();

}

function renderizarResumen() {

    if (!clientesState.resumen) {

        return;

    }

    Object.entries(clientesState.resumen).forEach(([clave, valor]) => {

        const el = document.querySelector(`[data-stat="${clave}"]`);

        if (el) {

            el.textContent = valor;

        }

    });

}

async function cargarClientes() {

    try {

        const respuesta = await api.listar({

            estado: clientesState.filtros.estado

        });

        clientesState.clientes = respuesta.data ?? respuesta;

        renderizarListado();

    }

    catch (error) {

        console.error(error);

        showError("No se pudieron cargar los clientes.");

    }

}

async function cargarResumen() {

    try {

        clientesState.resumen = await api.obtenerResumen();

        renderizarResumen();

    }

    catch (error) {

        console.error(error);

    }

}

async function abrirDetalle(id) {

    try {

        const cliente = await api.obtener(id);

        renderDetalle(cliente);

        document.getElementById("panelDetalleCliente").classList.add("is-open");

        document.getElementById("sigcClientesLayout").classList.add("has-detalle");

        lucide.createIcons();

    }

    catch (error) {

        console.error(error);

        showError("No se pudo cargar el detalle del cliente.");

    }

}

function cerrarDetalle() {

    document.getElementById("panelDetalleCliente").classList.remove("is-open");

    document.getElementById("sigcClientesLayout").classList.remove("has-detalle");

}

async function manejarToggleEstado(id, estadoActual) {

    const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";

    const confirmar = window.confirm(`¿${nuevoEstado === "Inactivo" ? "Inactivar" : "Reactivar"} este cliente?`);

    if (!confirmar) {

        return;

    }

    try {

        await api.actualizar(id, { estado: nuevoEstado });

        mostrarMensajeExito(`Cliente ${nuevoEstado === "Inactivo" ? "inactivado" : "reactivado"}`);

        await cargarClientes();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        showError("No se pudo cambiar el estado del cliente.");

    }

}

async function abrirEdicion(id) {

    try {

        const cliente = await api.obtener(id);

        clienteEditandoId = id;

        document.getElementById("campoClienteNombreForm").value = cliente.nombre;

        document.getElementById("campoClienteCedulaForm").value = cliente.cedula;

        document.getElementById("campoClienteTelefono").value = cliente.telefono ?? "";

        document.getElementById("campoClienteCorreo").value = cliente.correo ?? "";

        document.getElementById("campoClienteDireccion").value = cliente.direccion ?? "";

        document.querySelector("#modalNuevoCliente .modal-title").textContent = "Editar cliente";

        document.getElementById("btnGuardarCliente").textContent = "Guardar cambios";

        const modal = new bootstrap.Modal(document.getElementById("modalNuevoCliente"));

        modal.show();

    }

    catch (error) {

        console.error(error);

        showError("No se pudo cargar el cliente para editar.");

    }

}

async function manejarSubmitCliente(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formNuevoClienteError");

    errorBox.classList.add("d-none");

    const datos = {

        nombre: document.getElementById("campoClienteNombreForm").value.trim(),

        cedula: document.getElementById("campoClienteCedulaForm").value.trim(),

        telefono: document.getElementById("campoClienteTelefono").value.trim() || null,

        correo: document.getElementById("campoClienteCorreo").value.trim() || null,

        direccion: document.getElementById("campoClienteDireccion").value.trim() || null

    };

    const boton = document.getElementById("btnGuardarCliente");

    boton.disabled = true;

    try {

        const clienteGuardado = clienteEditandoId
            ? await api.actualizar(clienteEditandoId, datos)
            : await api.crear(datos);

        bootstrap.Modal.getInstance(document.getElementById("modalNuevoCliente")).hide();

        mostrarMensajeExito(`Cliente ${clienteGuardado.nombre}`);

        await cargarClientes();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        errorBox.textContent = error?.data?.message || error?.message || "No se pudo guardar el cliente.";

        errorBox.classList.remove("d-none");

    }

    finally {

        boton.disabled = false;

    }

}

function registrarClicksListado() {

    function manejarClick(evento) {

        const botonEditar = evento.target.closest("[data-editar]");

        const botonToggle = evento.target.closest("[data-toggle-estado]");

        if (botonEditar) {

            abrirEdicion(Number(botonEditar.dataset.editar));

            return;

        }

        if (botonToggle) {

            const fila = botonToggle.closest("[data-id]");

            const cliente = clientesState.clientes.find((c) => c.id === Number(botonToggle.dataset.toggleEstado));

            manejarToggleEstado(Number(botonToggle.dataset.toggleEstado), cliente?.estado ?? "Activo");

            return;

        }

        const fila = evento.target.closest("tr[data-id]") || evento.target.closest(".sigc-valla-card[data-id]");

        if (fila) {

            abrirDetalle(Number(fila.dataset.id));

        }

    }

    document.getElementById("tablaClientesBody").addEventListener("click", manejarClick);

    document.getElementById("listaClientesMovil").addEventListener("click", manejarClick);

}

function registrarFiltros() {

    let temporizador = null;

    document.getElementById("filtroBusqueda").addEventListener("input", (evento) => {

        clientesState.filtros.busqueda = evento.target.value;

        clearTimeout(temporizador);

        temporizador = setTimeout(renderizarListado, 250);

    });

    document.getElementById("filtroEstado").addEventListener("change", (evento) => {

        clientesState.filtros.estado = evento.target.value;

        cargarClientes();

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

function registrarFormularioCliente() {

    document.getElementById("btnNuevoCliente").addEventListener("click", () => {

        const modal = new bootstrap.Modal(document.getElementById("modalNuevoCliente"));

        modal.show();

    });

    document.querySelectorAll(".sigc-tipo-cedula").forEach((radio) => {

        radio.addEventListener("change", () => {

            const campoCedula = document.getElementById("campoClienteCedulaForm");

            campoCedula.placeholder = radio.value === "juridica"
                ? "Ej. 3-101-123456"
                : "Ej. 1-2222-3333";

        });

    });

    document.getElementById("formNuevoCliente").addEventListener("submit", manejarSubmitCliente);

    document.getElementById("modalNuevoCliente").addEventListener("hidden.bs.modal", () => {

        clienteEditandoId = null;

        document.getElementById("formNuevoCliente").reset();

        document.getElementById("formNuevoClienteError").classList.add("d-none");

        document.querySelector("#modalNuevoCliente .modal-title").textContent = "Nuevo cliente";

        document.getElementById("btnGuardarCliente").textContent = "Guardar";

        document.getElementById("tipoCedulaFisica").checked = true;

        document.getElementById("campoClienteCedulaForm").placeholder = "Ej. 1-2222-3333";

    });

}

export function registerEvents() {

    registrarClicksListado();

    registrarFiltros();

    registrarCierreDetalle();

    registrarSidebar();

    registrarFormularioCliente();

    cargarResumen();

    cargarClientes();

}