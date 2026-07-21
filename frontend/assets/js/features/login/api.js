/**
 * ==========================================
 * API del módulo Login
 * ==========================================
 */

import http from "../../services/http.js";

/**
 * Inicia sesión.
 * @param {Object} credentials
 * @returns {Promise<Object>}
 */
export function login(credentials) {

    return http.post(

        "/auth/login",

        credentials

    );

}