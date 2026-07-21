/**
 * ==========================================
 * Servicio de almacenamiento local
 * Envuelve localStorage para no llamarlo
 * directamente desde el resto del código.
 * ==========================================
 */

function set(key, value) {

    try {

        localStorage.setItem(key, JSON.stringify(value));

        return true;

    } catch (error) {

        console.error("No fue posible guardar en localStorage:", error);

        return false;

    }

}

function get(key) {

    try {

        const raw = localStorage.getItem(key);

        return raw ? JSON.parse(raw) : null;

    } catch (error) {

        console.error("No fue posible leer de localStorage:", error);

        return null;

    }

}

function remove(key) {

    localStorage.removeItem(key);

}

const Storage = { set, get, remove };

export default Storage;
