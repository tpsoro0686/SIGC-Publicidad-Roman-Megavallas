/**
 * ==========================================
 * API del módulo Solicitudes (bandeja del portal)
 * ==========================================
 */

import http from "../../services/http.js";

export function listar(filtros = {}) {

    const params = new URLSearchParams();

    if (filtros.estado) {

        params.set("estado", filtros.estado);

    }

    if (filtros.busqueda) {

        params.set("busqueda", filtros.busqueda);

    }

    if (filtros.page) {

        params.set("page", filtros.page);

    }

    const query = params.toString();

    return http.get(`/solicitudes${query ? `?${query}` : ""}`);

}

export function obtenerResumen() {

    return http.get("/solicitudes/resumen");

}

export function obtener(id) {

    return http.get(`/solicitudes/${id}`);

}

export function cambiarEstado(id, estado) {

    return http.request(`/solicitudes/${id}/estado`, {

        method: "PATCH",

        body: JSON.stringify({ estado })

    });

}

export function reasignar(id, usuarioId) {

    return http.request(`/solicitudes/${id}/reasignar`, {

        method: "PATCH",

        body: JSON.stringify({ usuario_id: usuarioId })

    });

}

export function listarEjecutivos() {

    return http.get("/solicitudes/ejecutivos");

}
