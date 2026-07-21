/**
 * ==========================================
 * API del módulo Login
 * ==========================================
 */

import http from "../../services/http.js";

/**
 * Inicia sesión.
 * El formulario maneja el campo como "email" (ver utils.js),
 * pero el backend espera "correo" — se traduce aquí para no
 * tener que tocar el HTML ni los IDs del formulario.
 * @param {Object} credentials { email, password }
 * @returns {Promise<Object>}
 */
export function login(credentials) {

    return http.post(

        "/auth/login",

        {
            correo: credentials.email,
            password: credentials.password
        }

    );

}
