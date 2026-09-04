
/**
 * ==========================================
 * Modal de "Mi perfil"
 * Se monta una sola vez por página (llamado
 * desde guard.js) y se abre haciendo click en
 * el bloque de usuario del header.
 * ==========================================
 */
 
import * as perfilApi from "./perfil.api.js";
 
import { getUser, getToken, saveSession } from "../../core/auth.js";
 
import { aplicarTemaGuardado, alternarTema, temaActual } from "../theme/theme.js";
 
import Toast from "../toast/toast.js";
 
const HTML_MODAL = `
<div class="modal fade" id="sigcModalPerfil" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Mi perfil</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
 
                <div class="sigc-perfil-solo-lectura">
                    <dl>
                        <dt>Correo</dt><dd id="sigcPerfilCorreo">&mdash;</dd>
                        <dt>Rol</dt><dd id="sigcPerfilRol">&mdash;</dd>
                        <dt>Ingresó el</dt><dd id="sigcPerfilFechaIngreso">&mdash;</dd>
                    </dl>
                </div>
 
                <ul class="nav nav-tabs sigc-perfil-tabs mb-3" role="tablist">
                    <li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#sigcTabGeneral" type="button">General</button></li>
                    <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#sigcTabStats" type="button" id="sigcTabStatsBtn">Estadísticas</button></li>
                    <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#sigcTabActividad" type="button" id="sigcTabActividadBtn">Actividad</button></li>
                    <li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#sigcTabSesiones" type="button" id="sigcTabSesionesBtn">Sesiones</button></li>
                </ul>
 
                <div class="tab-content">
 
                    <div class="tab-pane fade show active" id="sigcTabGeneral">
 
                        <form id="sigcFormPerfilNombre" class="mb-4">
                            <label for="sigcPerfilNombre" class="form-label">Nombre completo</label>
                            <div class="d-flex gap-2">
                                <input type="text" id="sigcPerfilNombre" class="form-control" required>
                                <button type="submit" class="btn sigc-btn-primary">Guardar</button>
                            </div>
                        </form>
 
                        <hr>
 
                        <form id="sigcFormPerfilPassword" class="mb-4">
                            <label class="form-label">Cambiar contraseña</label>
                            <input type="password" id="sigcPerfilPasswordActual" class="form-control mb-2" placeholder="Contraseña actual" required>
                            <input type="password" id="sigcPerfilPasswordNueva" class="form-control mb-2" placeholder="Contraseña nueva (mín. 6 caracteres)" required minlength="6">
                            <div class="alert alert-danger d-none" id="sigcPerfilPasswordError"></div>
                            <button type="submit" class="btn btn-outline-secondary w-100">Cambiar contraseña</button>
                        </form>
 
                        <hr>
 
                        <div class="sigc-perfil-theme-toggle">
                            <span>Tema oscuro</span>
                            <div class="form-check form-switch m-0">
                                <input class="form-check-input" type="checkbox" id="sigcPerfilThemeSwitch">
                            </div>
                        </div>
 
                    </div>
 
                    <div class="tab-pane fade" id="sigcTabStats">
                        <p class="text-muted small">Este mes:</p>
                        <div class="row g-2" id="sigcPerfilStatsBody">
                            <div class="col-6"><div class="sigc-perfil-stat"><div class="sigc-perfil-stat__valor" data-stat="vallas_creadas">&mdash;</div><div class="sigc-perfil-stat__label">Vallas creadas</div></div></div>
                            <div class="col-6"><div class="sigc-perfil-stat"><div class="sigc-perfil-stat__valor" data-stat="reservas_creadas">&mdash;</div><div class="sigc-perfil-stat__label">Reservas creadas</div></div></div>
                            <div class="col-6"><div class="sigc-perfil-stat"><div class="sigc-perfil-stat__valor" data-stat="contratos_creados">&mdash;</div><div class="sigc-perfil-stat__label">Contratos creados</div></div></div>
                            <div class="col-6"><div class="sigc-perfil-stat"><div class="sigc-perfil-stat__valor" data-stat="monto_vendido">&mdash;</div><div class="sigc-perfil-stat__label">Monto vendido</div></div></div>
                        </div>
                    </div>
 
                    <div class="tab-pane fade" id="sigcTabActividad">
                        <div class="d-flex justify-content-end mb-2">
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="sigcPerfilExportarCsv">Exportar CSV</button>
                        </div>
                        <div id="sigcPerfilActividadBody"><p class="text-muted small">Cargando...</p></div>
                    </div>
 
                    <div class="tab-pane fade" id="sigcTabSesiones">
                        <div id="sigcPerfilSesionesBody"><p class="text-muted small">Cargando...</p></div>
                    </div>
 
                </div>
 
            </div>
        </div>
    </div>
</div>
`;
 
let montado = false;
 
function montarModal() {
 
    if (montado) {
 
        return;
 
    }
 
    document.body.insertAdjacentHTML("beforeend", HTML_MODAL);
 
    montado = true;
 
}
 
function poblarSoloLectura() {
 
    const usuario = getUser();
 
    document.getElementById("sigcPerfilCorreo").textContent = usuario.correo;
 
    document.getElementById("sigcPerfilRol").textContent = usuario.rol?.nombre ?? "-";
 
    document.getElementById("sigcPerfilFechaIngreso").textContent = usuario.fecha_ingreso ?? "-";
 
    document.getElementById("sigcPerfilNombre").value = usuario.nombre;
 
    document.getElementById("sigcPerfilThemeSwitch").checked = temaActual() === "dark";
 
}
 
async function manejarSubmitNombre(evento) {
 
    evento.preventDefault();
 
    const nombre = document.getElementById("sigcPerfilNombre").value.trim();
 
    try {
 
        const usuarioActualizado = await perfilApi.actualizarNombre(nombre);
 
        const sesion = getUser();
 
        saveSession({ ...sesion, nombre: usuarioActualizado.nombre }, getToken());
 
        Toast.success("Nombre actualizado.");
 
        document.querySelectorAll("#sigcUserNombre").forEach((el) => { el.textContent = usuarioActualizado.nombre; });
 
    }
 
    catch (error) {
 
        console.error(error);
 
        Toast.error("No se pudo actualizar el nombre.");
 
    }
 
}
 
async function manejarSubmitPassword(evento) {
 
    evento.preventDefault();
 
    const errorBox = document.getElementById("sigcPerfilPasswordError");
 
    errorBox.classList.add("d-none");
 
    const actual = document.getElementById("sigcPerfilPasswordActual").value;
 
    const nueva = document.getElementById("sigcPerfilPasswordNueva").value;
 
    try {
 
        await perfilApi.cambiarPassword(actual, nueva);
 
        Toast.success("Contraseña actualizada.");
 
        document.getElementById("sigcFormPerfilPassword").reset();
 
    }
 
    catch (error) {
 
        console.error(error);
 
        errorBox.textContent = error?.data?.message || "No se pudo cambiar la contraseña.";
 
        errorBox.classList.remove("d-none");
 
    }
 
}
 
function manejarToggleTheme() {
 
    document.getElementById("sigcPerfilThemeSwitch").addEventListener("change", () => {
 
        alternarTema();
 
    });
 
}
 
let statsCargadas = false;
 
async function cargarEstadisticas() {
 
    if (statsCargadas) {
 
        return;
 
    }
 
    try {
 
        const stats = await perfilApi.obtenerEstadisticas();
 
        Object.entries(stats).forEach(([clave, valor]) => {
 
            const el = document.querySelector(`#sigcPerfilStatsBody [data-stat="${clave}"]`);
 
            if (el) {
 
                el.textContent = clave === "monto_vendido"
                    ? `$${Number(valor).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                    : valor;
 
            }
 
        });
 
        statsCargadas = true;
 
    }
 
    catch (error) {
 
        console.error(error);
 
    }
 
}
 
let actividadCargada = false;
 
async function cargarActividad() {
 
    if (actividadCargada) {
 
        return;
 
    }
 
    try {
 
        const registros = await perfilApi.obtenerActividad();
 
        const contenedor = document.getElementById("sigcPerfilActividadBody");
 
        if (registros.length === 0) {
 
            contenedor.innerHTML = `<p class="text-muted small">Sin actividad registrada todavía.</p>`;
 
        } else {
 
            contenedor.innerHTML = registros.map((registro) => `
 
                <div class="sigc-perfil-actividad-item">
                    <strong>${registro.accion}</strong>
                    <div class="text-muted">${registro.modulo} &middot; ${registro.created_at}</div>
                    ${registro.descripcion ? `<div>${registro.descripcion}</div>` : ""}
                </div>
 
            `).join("");
 
        }
 
        actividadCargada = true;
 
    }
 
    catch (error) {
 
        console.error(error);
 
    }
 
}
 
function registrarExportarCsv() {
 
    document.getElementById("sigcPerfilExportarCsv").addEventListener("click", async () => {
 
        try {
 
            const AppConfig = (await import("../../core/config.js")).default;
 
            const respuesta = await fetch(`${AppConfig.api.baseUrl}/perfil/actividad/exportar`, {
 
                headers: { Authorization: `Bearer ${getToken()}` }
 
            });
 
            const blob = await respuesta.blob();
 
            const url = window.URL.createObjectURL(blob);
 
            const enlace = document.createElement("a");
 
            enlace.href = url;
 
            enlace.download = "mi_actividad.csv";
 
            enlace.click();
 
            window.URL.revokeObjectURL(url);
 
        }
 
        catch (error) {
 
            console.error(error);
 
            Toast.error("No se pudo exportar la actividad.");
 
        }
 
    });
 
}
 
let sesionesCargadas = false;
 
async function cargarSesiones() {
 
    if (sesionesCargadas) {
 
        return;
 
    }
 
    try {
 
        const sesiones = await perfilApi.obtenerSesiones();
 
        renderizarSesiones(sesiones);
 
        sesionesCargadas = true;
 
    }
 
    catch (error) {
 
        console.error(error);
 
    }
 
}
 
function renderizarSesiones(sesiones) {
 
    const contenedor = document.getElementById("sigcPerfilSesionesBody");
 
    contenedor.innerHTML = sesiones.map((sesion) => `
 
        <div class="sigc-perfil-sesion">
            <div>
                <strong>${sesion.nombre || "Sesión"}</strong> ${sesion.es_actual ? '<span class="badge bg-danger">Esta sesión</span>' : ""}
                <div class="text-muted">Último uso: ${sesion.ultimo_uso}</div>
            </div>
            ${!sesion.es_actual ? `<button type="button" class="btn btn-sm btn-outline-danger" data-revocar="${sesion.id}">Cerrar</button>` : ""}
        </div>
 
    `).join("");
 
    contenedor.querySelectorAll("[data-revocar]").forEach((boton) => {
 
        boton.addEventListener("click", async () => {
 
            try {
 
                await perfilApi.revocarSesion(Number(boton.dataset.revocar));
 
                Toast.success("Sesión cerrada.");
 
                sesionesCargadas = false;
 
                cargarSesiones();
 
            }
 
            catch (error) {
 
                console.error(error);
 
                Toast.error("No se pudo cerrar esa sesión.");
 
            }
 
        });
 
    });
 
}
 
function registrarTabs() {
 
    document.getElementById("sigcTabStatsBtn").addEventListener("shown.bs.tab", cargarEstadisticas);
 
    document.getElementById("sigcTabActividadBtn").addEventListener("shown.bs.tab", cargarActividad);
 
    document.getElementById("sigcTabSesionesBtn").addEventListener("shown.bs.tab", cargarSesiones);
 
}
 
export function inicializarPerfil() {
 
    aplicarTemaGuardado();
 
    montarModal();
 
    document.getElementById("sigcFormPerfilNombre").addEventListener("submit", manejarSubmitNombre);
 
    document.getElementById("sigcFormPerfilPassword").addEventListener("submit", manejarSubmitPassword);
 
    manejarToggleTheme();
 
    registrarTabs();
 
    registrarExportarCsv();
 
    const bloqueUsuario = document.querySelector(".sigc-user");

    document.getElementById("sigcModalPerfil").addEventListener("hide.bs.modal", () => {

        if (document.activeElement) {

            document.activeElement.blur();

        }

    });
 
    if (bloqueUsuario) {
 
        bloqueUsuario.style.cursor = "pointer";
 
        bloqueUsuario.addEventListener("click", () => {
 
            poblarSoloLectura();
 
            const modal = new bootstrap.Modal(document.getElementById("sigcModalPerfil"));
 
            modal.show();
 
        });
 
    }
 
}
 
