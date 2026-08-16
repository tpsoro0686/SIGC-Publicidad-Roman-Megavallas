/**
 * ==========================================
 * Guard de autenticación
 * Se llama al inicio de cualquier página que
 * requiera sesión iniciada (todas menos login).
 * ==========================================
 */

import { isAuthenticated, clearSession } from "./auth.js";

const LOGIN_PATH = "../login/login.html";

/**
 * Si no hay sesión, redirige a login y devuelve false.
 * Si hay sesión, devuelve true.
 *
 * Uso, al inicio del index.js de cada módulo protegido:
 *
 *   import { requireAuth } from "../../core/guard.js";
 *
 *   if (!requireAuth()) {
 *       // No continuar: ya se está redirigiendo a login.
 *   } else {
 *       // Resto de la inicialización del módulo.
 *   }
 *
 * @returns {boolean}
 */
export function requireAuth() {

    if (isAuthenticated()) {

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
