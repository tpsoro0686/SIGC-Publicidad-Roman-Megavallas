/**
 * ==========================================
 * Sesión y autenticación
 * ==========================================
 */

import Storage from "./storage.js";

import { APP } from "./constants.js";

/**
 * Guarda el token y el usuario autenticado.
 * @param {Object} usuario
 * @param {string} token
 */
export function saveSession(usuario, token) {

    Storage.set(APP.TOKEN_STORAGE_KEY, token);

    Storage.set(APP.SESSION_STORAGE_KEY, usuario);

}

/**
 * Devuelve el token guardado, o null si no hay sesión.
 * @returns {string|null}
 */
export function getToken() {

    return Storage.get(APP.TOKEN_STORAGE_KEY);

}

/**
 * Devuelve el usuario autenticado guardado, o null.
 * @returns {Object|null}
 */
export function getUser() {

    return Storage.get(APP.SESSION_STORAGE_KEY);

}

/**
 * @returns {boolean}
 */
export function isAuthenticated() {

    return Boolean(getToken());

}

/**
 * Borra la sesión guardada (logout local).
 */
export function clearSession() {

    Storage.remove(APP.TOKEN_STORAGE_KEY);

    Storage.remove(APP.SESSION_STORAGE_KEY);

}
