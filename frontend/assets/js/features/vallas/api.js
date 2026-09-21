/**
 * ==========================================
 * API del módulo Vallas
 * ==========================================
 */

import http from "../../services/http.js";

/**
 * Lista las vallas, con filtros opcionales.
 * @param {Object} filtros { estado, provincia_id }
 * @returns {Promise<Object>}
 */

export function listar(filtros = {}) {

    const params = new URLSearchParams();

    if (filtros.estado) {

        params.set("estado", filtros.estado);

    }

    if (filtros.provincia_id) {

        params.set("provincia_id", filtros.provincia_id);

    }

    if (filtros.busqueda) {

        params.set("busqueda", filtros.busqueda);

    }

    if (filtros.page) {

        params.set("page", filtros.page);

    }

    const query = params.toString();

    return http.get(`/vallas${query ? `?${query}` : ""}`);

}

/**
 * Trae los conteos para las tarjetas resumen.
 * @returns {Promise<Object>}
 */
export function obtenerResumen() {

    return http.get("/vallas/resumen");

}

/**
 * Trae el detalle completo de una valla (fotos, reserva/contrato activo).
 * @param {number} id
 * @returns {Promise<Object>}
 */
export function obtener(id) {

    return http.get(`/vallas/${id}`);

}

/**
 * Crea una valla nueva.
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
export function crear(datos) {

    return http.post("/vallas", datos);

}

/**
 * Edita una valla existente.
 * @param {number} id
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
export function actualizar(id, datos) {

    return http.put(`/vallas/${id}`, datos);

}

/**
 * Cambia el estado de una valla (Disponible/Reservada/Alquilada/etc).
 * @param {number} id
 * @param {string} estado
 * @returns {Promise<Object>}
 */
export function cambiarEstado(id, estado) {

    return http.request(`/vallas/${id}/estado`, {

        method: "PATCH",

        body: JSON.stringify({ estado })

    });
}

/**
 * Lista las provincias (catálogo fijo).
 * @returns {Promise<Object>}
 */
export function listarProvincias() {

    return http.get("/provincias");

}