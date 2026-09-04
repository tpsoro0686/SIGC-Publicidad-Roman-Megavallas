import http from "../../services/http.js";

export function listar(filtros = {}) {

    const params = new URLSearchParams();

    if (filtros.busqueda) {

        params.set("busqueda", filtros.busqueda);

    }

    if (filtros.estado) {

        params.set("estado", filtros.estado);

    }

    if (filtros.rolId) {

        params.set("rol_id", filtros.rolId);

    }

    const query = params.toString();

    return http.get(`/usuarios${query ? `?${query}` : ""}`);

}

export function obtenerResumen() {

    return http.get("/usuarios/resumen");

}

export function obtener(id) {

    return http.get(`/usuarios/${id}`);

}

export function crear(datos) {

    return http.post("/usuarios", datos);

}

export function actualizar(id, datos) {

    return http.put(`/usuarios/${id}`, datos);

}

export function listarRoles() {

    return http.get("/roles");

}