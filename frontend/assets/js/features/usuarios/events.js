/**
 * ==========================================
 * Eventos del módulo Usuarios
 * ==========================================
 */

import usuariosState from "./state.js";

import * as api from "./api.js";

import { renderTabla } from "./render/tabla.js";

import { renderTarjetas } from "./render/tarjetas.js";

import { showError } from "./render/messages.js";

import { getUser } from "../../core/auth.js";

let usuarioEditandoId = null;

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

function aplicarFiltroLocal(usuarios) {

    const termino = usuariosState.filtros.busqueda.trim().toLowerCase();

    if (!termino) {

        return usuarios;

    }

    return usuarios.filter((usuario) => {

        return usuario.nombre.toLowerCase().includes(termino)

            || usuario.correo.toLowerCase().includes(termino);

    });

}

function renderizarListado() {

    const usuariosFiltrados = aplicarFiltroLocal(usuariosState.usuarios);

    renderTabla(usuariosFiltrados);

    renderTarjetas(usuariosFiltrados);

    document.getElementById("sigcEmptyState").classList.toggle("d-none", usuariosFiltrados.length > 0);

    lucide.createIcons();

}

function renderizarResumen() {

    if (!usuariosState.resumen) {

        return;

    }

    Object.entries(usuariosState.resumen).forEach(([clave, valor]) => {

        const el = document.querySelector(`[data-stat="${clave}"]`);

        if (el) {

            el.textContent = valor;

        }

    });

}

async function cargarUsuarios() {

    try {

        const respuesta = await api.listar({

            estado: usuariosState.filtros.estado,

            rolId: usuariosState.filtros.rolId

        });

        usuariosState.usuarios = respuesta.data ?? respuesta;

        renderizarListado();

    }

    catch (error) {

        console.error(error);

        showError("No se pudieron cargar los usuarios.");

    }

}

async function cargarResumen() {

    try {

        usuariosState.resumen = await api.obtenerResumen();

        renderizarResumen();

    }

    catch (error) {

        console.error(error);

    }

}

async function cargarRolesSelect() {

    try {

        usuariosState.roles = await api.listarRoles();

        const select = document.getElementById("campoUsuarioRol");

        select.innerHTML = `<option value="" disabled selected>Seleccioná un rol</option>`
            + usuariosState.roles.map((rol) => `<option value="${rol.id}">${rol.nombre}</option>`).join("");

        const selectFiltro = document.getElementById("filtroRol");

        selectFiltro.innerHTML = `<option value="">Rol: Todos</option>`
            + usuariosState.roles.map((rol) => `<option value="${rol.id}">${rol.nombre}</option>`).join("");

    }

    catch (error) {

        console.error(error);

        showError("No se pudieron cargar los roles.");

    }

}

async function abrirEdicion(id) {

    try {

        const usuario = await api.obtener(id);

        usuarioEditandoId = id;

        document.getElementById("campoUsuarioNombre").value = usuario.nombre;

        document.getElementById("campoUsuarioCorreo").value = usuario.correo;

        document.getElementById("campoUsuarioPassword").value = "";

        document.getElementById("campoUsuarioPassword").placeholder = "Dejar vacío para no cambiarla";

        document.getElementById("campoUsuarioPassword").required = false;

        document.getElementById("campoUsuarioRol").value = usuario.rol?.id ?? "";

        document.querySelector("#modalNuevoUsuario .modal-title").textContent = "Editar usuario";

        document.getElementById("btnGuardarUsuario").textContent = "Guardar cambios";

        const modal = new bootstrap.Modal(document.getElementById("modalNuevoUsuario"));

        modal.show();

    }

    catch (error) {

        console.error(error);

        showError("No se pudo cargar el usuario para editar.");

    }

}

async function manejarToggleEstado(id, estadoActual) {

    const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";

    const confirmar = window.confirm(`¿${nuevoEstado === "Inactivo" ? "Inactivar" : "Reactivar"} este usuario?`);

    if (!confirmar) {

        return;

    }

    try {

        await api.actualizar(id, { estado: nuevoEstado });

        mostrarMensajeExito(`Usuario ${nuevoEstado === "Inactivo" ? "inactivado" : "reactivado"}`);

        await cargarUsuarios();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        const mensaje = error?.data?.message || "No se pudo cambiar el estado del usuario.";

        showError(mensaje);

    }

}

async function manejarSubmitUsuario(evento) {

    evento.preventDefault();

    const errorBox = document.getElementById("formNuevoUsuarioError");

    errorBox.classList.add("d-none");

    const datos = {

        nombre: document.getElementById("campoUsuarioNombre").value.trim(),

        correo: document.getElementById("campoUsuarioCorreo").value.trim(),

        rol_id: Number(document.getElementById("campoUsuarioRol").value)

    };

    const password = document.getElementById("campoUsuarioPassword").value;

    if (password) {

        datos.password = password;

    }

    const boton = document.getElementById("btnGuardarUsuario");

    boton.disabled = true;

    try {

        const usuarioGuardado = usuarioEditandoId
            ? await api.actualizar(usuarioEditandoId, datos)
            : await api.crear(datos);

        bootstrap.Modal.getInstance(document.getElementById("modalNuevoUsuario")).hide();

        mostrarMensajeExito(`Usuario ${usuarioGuardado.nombre}`);

        await cargarUsuarios();

        cargarResumen();

    }

    catch (error) {

        console.error(error);

        errorBox.textContent = error?.data?.message || "No se pudo guardar el usuario.";

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

            const usuario = usuariosState.usuarios.find((u) => u.id === Number(botonToggle.dataset.toggleEstado));

            manejarToggleEstado(Number(botonToggle.dataset.toggleEstado), usuario?.estado ?? "Activo");

        }

    }

    document.getElementById("tablaUsuariosBody").addEventListener("click", manejarClick);

    document.getElementById("listaUsuariosMovil").addEventListener("click", manejarClick);

}

function registrarFiltros() {

    let temporizador = null;

    document.getElementById("filtroBusqueda").addEventListener("input", (evento) => {

        usuariosState.filtros.busqueda = evento.target.value;

        clearTimeout(temporizador);

        temporizador = setTimeout(renderizarListado, 250);

    });

    document.getElementById("filtroEstado").addEventListener("change", (evento) => {

        usuariosState.filtros.estado = evento.target.value;

        cargarUsuarios();

    });

    document.getElementById("filtroRol").addEventListener("change", (evento) => {

        usuariosState.filtros.rolId = evento.target.value;

        cargarUsuarios();

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

function registrarFormularioUsuario() {

    document.getElementById("btnNuevoUsuario").addEventListener("click", () => {

        const modal = new bootstrap.Modal(document.getElementById("modalNuevoUsuario"));

        modal.show();

    });

    document.getElementById("formNuevoUsuario").addEventListener("submit", manejarSubmitUsuario);

    document.getElementById("modalNuevoUsuario").addEventListener("hidden.bs.modal", () => {

        usuarioEditandoId = null;

        document.getElementById("formNuevoUsuario").reset();

        document.getElementById("formNuevoUsuarioError").classList.add("d-none");

        document.querySelector("#modalNuevoUsuario .modal-title").textContent = "Nuevo usuario";

        document.getElementById("btnGuardarUsuario").textContent = "Guardar";

        document.getElementById("campoUsuarioPassword").placeholder = "";

        document.getElementById("campoUsuarioPassword").required = true;

    });

}

export function registerEvents() {

    const usuarioActual = getUser();

    if (usuarioActual?.rol?.nombre !== "Administrador Sistema") {

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

    registrarSidebar();

    registrarFormularioUsuario();

    cargarRolesSelect();

    cargarResumen();

    cargarUsuarios();

}
