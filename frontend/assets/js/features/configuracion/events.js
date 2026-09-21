/**
 * ==========================================
 * Eventos del módulo Configuración
 * ==========================================
 */

import configuracionState from "./state.js";

import * as api from "./api.js";

import { showError, showSuccess } from "./render/messages.js";

import { tieneRol } from "../../core/auth.js";

import AppConfig from "../../core/config.js";

function formatearFechaHora(fecha) {

    if (!fecha) {

        return "Nunca";

    }

    return new Date(fecha).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" });

}

function mensajeDeError(error) {

    if (error?.data?.errors) {

        return Object.values(error.data.errors).flat().join(" ");

    }

    return error?.message || "Ocurrió un error inesperado.";

}

function actualizarPreviewLogo(logo) {

    const contenedor = document.getElementById("previewLogo");

    if (!logo) {

        contenedor.innerHTML = `<i data-lucide="image"></i>`;

        lucide.createIcons();

        return;

    }

    const baseUrl = AppConfig.api.baseUrl.replace("/api", "");

    contenedor.innerHTML = `<img src="${baseUrl}/storage/${logo}" alt="Logo">`;

}

function poblarFormulario(config) {

    document.getElementById("campoConfigEmpresa").value = config.empresa ?? "";

    document.getElementById("campoConfigCorreo").value = config.correo ?? "";

    document.getElementById("campoConfigTelefono").value = config.telefono ?? "";

    document.getElementById("campoConfigDireccion").value = config.direccion ?? "";

    document.getElementById("campoConfigSitioWeb").value = config.sitio_web ?? "";

    document.getElementById("campoConfigCedulaNumero").value = config.cedula_numero ?? "";

    const esJuridica = config.cedula_tipo === "juridica";

    document.getElementById("tipoCedulaConfigFisica").checked = !esJuridica;

    document.getElementById("tipoCedulaConfigJuridica").checked = esJuridica;

    document.getElementById("campoConfigCedulaNumero").placeholder = esJuridica ? "Ej. 3-101-123456" : "Ej. 1-2222-3333";

    document.getElementById("campoConfigTipoCambio").value = config.tipo_cambio ?? "";

    document.getElementById("checkConfigTipoCambioAuto").checked = Boolean(config.tipo_cambio_auto);

    document.getElementById("textoTipoCambioActualizado").textContent = config.tipo_cambio_actualizado_en
        ? `Última actualización: ${formatearFechaHora(config.tipo_cambio_actualizado_en)}`
        : "Todavía no se ha actualizado.";

    document.getElementById("campoConfigComision").value = config.comision_ejecutivo_pct ?? "";

    document.getElementById("campoConfigDiasAviso").value = config.dias_aviso_vencimiento ?? "";

    document.getElementById("checkConfigNotificacionesActivas").checked = Boolean(config.notificaciones_activas);

    document.getElementById("campoConfigNotifCorreo").value = config.notificaciones_correo_remitente ?? "";

    document.getElementById("campoConfigNotifNombre").value = config.notificaciones_nombre_remitente ?? "";

    actualizarPreviewLogo(config.logo);

}

function poblarSalud(salud) {

    document.getElementById("saludPhp").textContent = salud.php_version;

    document.getElementById("saludLaravel").textContent = salud.laravel_version;

    document.getElementById("saludBd").textContent = `${salud.base_datos_mb} MB`;

    document.getElementById("saludScheduler").textContent = salud.scheduler_ultima_corrida
        ? formatearFechaHora(salud.scheduler_ultima_corrida)
        : "Sin registro todavía";

    document.getElementById("checkConfigMantenimiento").checked = Boolean(salud.modo_mantenimiento);

    document.getElementById("textoMantenimientoEstado").textContent = salud.modo_mantenimiento ? "Activo" : "Inactivo";

}

async function cargarConfiguracion() {

    try {

        configuracionState.datos = await api.obtener();

        poblarFormulario(configuracionState.datos);

    }

    catch (error) {

        console.error(error);

        showError("No se pudo cargar la configuración.");

    }

}

async function cargarSalud() {

    try {

        configuracionState.salud = await api.obtenerSalud();

        poblarSalud(configuracionState.salud);

    }

    catch (error) {

        console.error(error);

    }

}

async function manejarSubmitFormulario(evento) {

    evento.preventDefault();

    const datos = {

        empresa: document.getElementById("campoConfigEmpresa").value.trim() || null,

        correo: document.getElementById("campoConfigCorreo").value.trim() || null,

        telefono: document.getElementById("campoConfigTelefono").value.trim() || null,

        direccion: document.getElementById("campoConfigDireccion").value.trim() || null,

        sitio_web: document.getElementById("campoConfigSitioWeb").value.trim() || null,

        cedula_tipo: document.querySelector('input[name="configCedulaTipo"]:checked')?.value ?? "fisica",

        cedula_numero: document.getElementById("campoConfigCedulaNumero").value.trim() || null,

        tipo_cambio: Number(document.getElementById("campoConfigTipoCambio").value),

        tipo_cambio_auto: document.getElementById("checkConfigTipoCambioAuto").checked,

        comision_ejecutivo_pct: Number(document.getElementById("campoConfigComision").value),

        dias_aviso_vencimiento: Number(document.getElementById("campoConfigDiasAviso").value),

        notificaciones_activas: document.getElementById("checkConfigNotificacionesActivas").checked,

        notificaciones_correo_remitente: document.getElementById("campoConfigNotifCorreo").value.trim() || null,

        notificaciones_nombre_remitente: document.getElementById("campoConfigNotifNombre").value.trim() || null

    };

    const boton = document.getElementById("btnGuardarConfiguracion");

    boton.disabled = true;

    boton.textContent = "Guardando...";

    try {

        configuracionState.datos = await api.actualizar(datos);

        poblarFormulario(configuracionState.datos);

        showSuccess("Configuración actualizada.");

    }

    catch (error) {

        console.error(error);

        showError(mensajeDeError(error));

    }

    finally {

        boton.disabled = false;

        boton.innerHTML = `<i data-lucide="save"></i> Guardar cambios`;

        lucide.createIcons();

    }

}

async function manejarSubirLogo(evento) {

    const archivo = evento.target.files[0];

    if (!archivo) {

        return;

    }

    const estado = document.getElementById("textoLogoEstado");

    estado.textContent = "Subiendo...";

    try {

        configuracionState.datos = await api.actualizarLogo(archivo);

        actualizarPreviewLogo(configuracionState.datos.logo);

        showSuccess("Logo actualizado.");

    }

    catch (error) {

        console.error(error);

        showError(mensajeDeError(error));

    }

    finally {

        estado.textContent = "PNG o JPG, máx. 2MB.";

        evento.target.value = "";

    }

}

async function manejarActualizarTipoCambio() {

    const boton = document.getElementById("btnActualizarTipoCambio");

    boton.disabled = true;

    boton.innerHTML = `<i data-lucide="refresh-cw"></i> Actualizando...`;

    try {

        configuracionState.datos = await api.actualizarTipoCambio();

        document.getElementById("campoConfigTipoCambio").value = configuracionState.datos.tipo_cambio;

        document.getElementById("textoTipoCambioActualizado").textContent =
            `Última actualización: ${formatearFechaHora(configuracionState.datos.tipo_cambio_actualizado_en)}`;

        showSuccess("Tipo de cambio actualizado.");

    }

    catch (error) {

        console.error(error);

        showError(mensajeDeError(error));

    }

    finally {

        boton.disabled = false;

        boton.innerHTML = `<i data-lucide="refresh-cw"></i> Actualizar ahora`;

        lucide.createIcons();

    }

}

async function manejarToggleMantenimiento(evento) {

    const activar = evento.target.checked;

    const confirmar = window.confirm(

        activar

            ? "¿Activar el modo mantenimiento? El sistema dejará de estar disponible para el resto de usuarios."

            : "¿Desactivar el modo mantenimiento y volver a dejar el sistema disponible?"

    );

    if (!confirmar) {

        evento.target.checked = !activar;

        return;

    }

    try {

        const respuesta = await api.toggleMantenimiento(activar);

        document.getElementById("textoMantenimientoEstado").textContent = respuesta.modo_mantenimiento ? "Activo" : "Inactivo";

        showSuccess(respuesta.modo_mantenimiento ? "Modo mantenimiento activado." : "Modo mantenimiento desactivado.");

    }

    catch (error) {

        console.error(error);

        showError(mensajeDeError(error));

        evento.target.checked = !activar;

    }

}

function registrarRadiosCedula() {

    document.querySelectorAll(".sigc-tipo-cedula-config").forEach((radio) => {

        radio.addEventListener("change", () => {

            document.getElementById("campoConfigCedulaNumero").placeholder =
                radio.value === "juridica" ? "Ej. 3-101-123456" : "Ej. 1-2222-3333";

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

function aplicarPermisos() {

    if (tieneRol("Administrador Sistema")) {

        return;

    }

    document.querySelectorAll("#formConfiguracion input").forEach((campo) => {

        campo.disabled = true;

    });

    document.getElementById("btnGuardarConfiguracion").classList.add("d-none");

    document.getElementById("btnActualizarTipoCambio").classList.add("d-none");

    document.querySelector('label[for="inputConfigLogo"]').classList.add("d-none");

}

export function registerEvents() {

    if (!tieneRol("Administrador Sistema", "Administrador Empresa")) {

        document.getElementById("sigcContent").innerHTML = `

            <div class="sigc-empty-state">
                <i data-lucide="lock"></i>
                <p>No tenés permisos para acceder a este módulo. Contactá a un administrador.</p>
            </div>

        `;

        lucide.createIcons();

        return;

    }

    aplicarPermisos();

    registrarRadiosCedula();

    document.getElementById("formConfiguracion").addEventListener("submit", manejarSubmitFormulario);

    document.getElementById("inputConfigLogo").addEventListener("change", manejarSubirLogo);

    document.getElementById("btnActualizarTipoCambio").addEventListener("click", manejarActualizarTipoCambio);

    document.getElementById("checkConfigMantenimiento").addEventListener("change", manejarToggleMantenimiento);

    registrarSidebar();

    cargarConfiguracion();

    cargarSalud();

}