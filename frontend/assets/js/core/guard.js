/**
 * ==========================================
 * Guard de autenticación
 * Se llama al inicio de cualquier página que
 * requiera sesión iniciada (todas menos login).
 * ==========================================
 */

import { isAuthenticated, clearSession, getUser } from "./auth.js";

const LOGIN_PATH = "../login/login.html";

function poblarHeaderUsuario() {

    const usuario = getUser();

    if (!usuario) {

        return;

    }

    const iniciales = usuario.nombre
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((palabra) => palabra[0].toUpperCase())
        .join("");

    const elAvatar = document.getElementById("sigcUserAvatar");
    const elNombre = document.getElementById("sigcUserNombre");
    const elRol = document.getElementById("sigcUserRol");

    if (elAvatar) {

        elAvatar.textContent = iniciales || "--";

    }

    if (elNombre) {

        elNombre.textContent = usuario.nombre;

    }

    if (elRol) {

        elRol.textContent = usuario.rol?.nombre ?? "";

    }

}

function conectarLogout() {

    const boton = document.getElementById("btnCerrarSesion");

    if (!boton) {

        return;

    }

    boton.addEventListener("click", async () => {

        try {

            const http = (await import("../services/http.js")).default;

            await http.post("/auth/logout");

        }

        catch (error) {

            console.error(error);

        }

        finally {

            clearSession();

            window.location.replace(LOGIN_PATH);

        }

    });

}

/**
 * Si no hay sesión, redirige a login y devuelve false.
 * Si hay sesión, deja el header poblado, conecta el
 * logout, y devuelve true.
 *
 * @returns {boolean}
 */
export function requireAuth() {

    if (isAuthenticated()) {

        poblarHeaderUsuario();

        conectarLogout();

        import("../components/perfil/perfil.js").then(({ inicializarPerfil }) => {

            inicializarPerfil();

        });

        return true;

    }

    window.location.replace(LOGIN_PATH);

    return false;

}

/**
 * Cierra la sesión localmente y redirige a login.
 * No llama al backend — para eso usar logout() de features/*//**api.js
 * antes de invocar esto, cuando corresponda avisarle al servidor.
 */
export function forceLogout() {

    clearSession();

    window.location.replace(LOGIN_PATH);

}