/**
 * ==========================================
 * Eventos del módulo Solicitudes
 * ==========================================
 */

import solicitudesState from "./state.js";

import * as api from "./api.js";

import { renderTabla } from "./render/tabla.js";

import { renderTarjetas } from "./render/tarjetas.js";

import { renderDetalle } from "./render/detalle.js";

import { showError, showSuccess } from "./render/messages.js";

import { tieneRol } from "../../core/auth.js";

import { confirmarAccion } from "../../components/confirm/confirm.js";

let temporizadorBusqueda = null;

let modalDetalle = null;

const puedeCambiarEstado = () => tieneRol("Administrador Sistema", "Administrador Empresa", "Ejecutivo");

const puedeReasignar = () => tieneRol("Administrador Sistema", "Administrador Empresa");

function renderizarListado() {

    const { solicitudes } = solicitudesState;

    renderTabla(solicitudes);

    renderTarjetas(solicitudes);

    document.getElementById("sigcEmptyState").classList.toggle("d-none", solicitudes.length > 0);

    const { paginaActual, ultimaPagina, total } = solicitudesState.paginacion;

    document.getElementById("paginacionInfo").textContent =
        total > 0 ? `Página ${paginaActual} de ${ultimaPagina} · ${total} solicitudes` : "";

    document.getElementById("btnPaginaAnterior").disabled = paginaActual <= 1;

    document.getElementById("btnPaginaSiguiente").disabled = paginaActual >= ultimaPagina;

    document.getElementById("sigcPaginacion").classList.toggle("d-none", ultimaPagina <= 1);

    lucide.createIcons();

}

function renderizarResumen() {

    if (!solicitudesState.resumen) {

        return;

    }

    Object.entries(solicitudesState.resumen).forEach(([clave, valor]) => {

        const el = document.querySelector(`[data-stat="${clave}"]`);

        if (el) {

            el.textContent = valor;

        }

    });

}

async function cargarSolicitudes() {

    try {

        const respuesta = await api.listar({

            estado: solicitudesState.filtros.estado,

            busqueda: solicitudesState.filtros.busqueda,

            page: solicitudesState.paginacion.paginaActual

        });

        solicitudesState.solicitudes = respuesta.data ?? respuesta;

        solicitudesState.paginacion.paginaActual = respuesta.meta?.current_page ?? 1;

        solicitudesState.paginacion.ultimaPagina = respuesta.meta?.last_page ?? 1;

        solicitudesState.paginacion.total = respuesta.meta?.total ?? solicitudesState.solicitudes.length;

        renderizarListado();

    }

    catch (error) {

        console.error(error);

        showError("No se pudieron cargar las solicitudes.");

    }

}

async function cargarResumen() {

    try {

        solicitudesState.resumen = await api.obtenerResumen();

        renderizarResumen();

    }

    catch (error) {

        console.error(error);

    }

}

async function cargarEjecutivos() {

    if (!puedeReasignar()) {

        return;

    }

    try {

        solicitudesState.ejecutivos = await api.listarEjecutivos();

    }

    catch (error) {

        console.error(error);

        solicitudesState.ejecutivos = [];

    }

}

function pintarDetalle() {

    renderDetalle(solicitudesState.seleccionada, {

        ejecutivos: solicitudesState.ejecutivos,

        puedeCambiarEstado: puedeCambiarEstado(),

        puedeReasignar: puedeReasignar()

    });

}

async function abrirDetalle(id) {

    try {

        // Se refresca la lista de ejecutivos para que el conteo de abiertas esté al día
        const [solicitud] = await Promise.all([api.obtener(id), cargarEjecutivos()]);

        solicitudesState.seleccionada = solicitud;

        pintarDetalle();

        modalDetalle.show();

    }

    catch (error) {

        console.error(error);

        showError(error?.message || "No se pudo abrir la solicitud.");

    }

}

async function refrescarTodo() {

    await Promise.all([cargarSolicitudes(), cargarResumen()]);

}

async function manejarCambioEstado(estado) {

    const solicitud = solicitudesState.seleccionada;

    if (estado === "Cerrada") {

        const confirmado = await confirmarAccion({

            titulo: "Cerrar solicitud",

            mensaje: `¿Cerrar la solicitud ${solicitud.codigo}? Podrás reabrirla después si hace falta.`,

            textoConfirmar: "Cerrar solicitud"

        });

        if (!confirmado) {

            return;

        }

    }

    try {

        solicitudesState.seleccionada = await api.cambiarEstado(solicitud.id, estado);

        pintarDetalle();

        showSuccess(`Solicitud ${solicitud.codigo}: ${estado}.`);

        refrescarTodo();

    }

    catch (error) {

        console.error(error);

        showError(error?.message || "No se pudo cambiar el estado.");

    }

}

async function manejarReasignar() {

    const select = document.getElementById("selectReasignar");

    const usuarioId = Number(select?.value);

    if (!usuarioId) {

        showError("Elige un ejecutivo.");

        return;

    }

    const solicitud = solicitudesState.seleccionada;

    if (usuarioId === solicitud.ejecutivo?.id) {

        showError("Esa solicitud ya está asignada a ese ejecutivo.");

        return;

    }

    const destino = solicitudesState.ejecutivos.find((e) => e.id === usuarioId);

    const confirmado = await confirmarAccion({

        titulo: "Reasignar solicitud",

        mensaje: `¿Reasignar ${solicitud.codigo} a ${destino?.nombre ?? "este ejecutivo"}? Se le enviará un correo y se avisará al administrador de la empresa.`,

        textoConfirmar: "Reasignar"

    });

    if (!confirmado) {

        return;

    }

    try {

        solicitudesState.seleccionada = await api.reasignar(solicitud.id, usuarioId);

        await cargarEjecutivos();

        pintarDetalle();

        showSuccess(`Solicitud reasignada a ${destino?.nombre ?? "el ejecutivo"}.`);

        refrescarTodo();

    }

    catch (error) {

        console.error(error);

        showError(error?.data?.errors?.usuario_id?.[0] || error?.message || "No se pudo reasignar.");

    }

}

function registrarListado() {

    document.getElementById("sigcContent").addEventListener("click", (evento) => {

        const fila = evento.target.closest("[data-ver]");

        if (fila) {

            abrirDetalle(Number(fila.dataset.ver));

        }

    });

    document.getElementById("detalleAcciones").addEventListener("click", (evento) => {

        const boton = evento.target.closest("[data-estado]");

        if (boton) {

            manejarCambioEstado(boton.dataset.estado);

        }

    });

    document.getElementById("detalleCuerpo").addEventListener("click", (evento) => {

        if (evento.target.closest("#btnReasignar")) {

            manejarReasignar();

        }

    });

}

function registrarFiltros() {

    document.getElementById("filtroBusqueda").addEventListener("input", (evento) => {

        clearTimeout(temporizadorBusqueda);

        temporizadorBusqueda = setTimeout(() => {

            solicitudesState.filtros.busqueda = evento.target.value.trim();

            solicitudesState.paginacion.paginaActual = 1;

            cargarSolicitudes();

        }, 350);

    });

    document.getElementById("filtroEstado").addEventListener("change", (evento) => {

        solicitudesState.filtros.estado = evento.target.value;

        solicitudesState.paginacion.paginaActual = 1;

        cargarSolicitudes();

    });

    document.getElementById("btnLimpiar").addEventListener("click", () => {

        solicitudesState.filtros = { busqueda: "", estado: "" };

        solicitudesState.paginacion.paginaActual = 1;

        document.getElementById("filtroBusqueda").value = "";

        document.getElementById("filtroEstado").value = "";

        cargarSolicitudes();

    });

    document.getElementById("btnPaginaAnterior").addEventListener("click", () => {

        if (solicitudesState.paginacion.paginaActual > 1) {

            solicitudesState.paginacion.paginaActual -= 1;

            cargarSolicitudes();

        }

    });

    document.getElementById("btnPaginaSiguiente").addEventListener("click", () => {

        if (solicitudesState.paginacion.paginaActual < solicitudesState.paginacion.ultimaPagina) {

            solicitudesState.paginacion.paginaActual += 1;

            cargarSolicitudes();

        }

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

export function registerEvents() {

    if (!tieneRol("Administrador Sistema", "Administrador Empresa", "Ejecutivo", "Dueño")) {

        document.getElementById("sigcContent").innerHTML = `

            <div class="sigc-empty-state">
                <i data-lucide="lock"></i>
                <p>No tienes permisos para acceder a este módulo. Contacta a un administrador.</p>
            </div>

        `;

        lucide.createIcons();

        registrarSidebar();

        return;

    }

    modalDetalle = new bootstrap.Modal(document.getElementById("modalSolicitud"));

    registrarListado();

    registrarFiltros();

    registrarSidebar();

    // Un Ejecutivo solo ve las suyas: el título lo aclara
    if (tieneRol("Ejecutivo")) {

        document.getElementById("tituloSolicitudes").textContent = "Mis solicitudes del portal";

    }

    cargarResumen();

    cargarSolicitudes();

    lucide.createIcons();

}
