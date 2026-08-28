import http from "../../services/http.js";

export function listar(filtros = {}) {

    const params = new URLSearchParams();

    if (filtros.busqueda) {

        params.set("busqueda", filtros.busqueda);

    }

    if (filtros.estado) {

        params.set("estado", filtros.estado);

    }

    const query = params.toString();

    return http.get(`/clientes${query ? `?${query}` : ""}`);

}

export function obtenerResumen() {

    return http.get("/clientes/resumen");

}

export function obtener(id) {

    return http.get(`/clientes/${id}`);

}

export function crear(datos) {

    return http.post("/clientes", datos);

}

export function actualizar(id, datos) {

    return http.request(`/clientes/${id}`, {

        method: "PUT",

        body: JSON.stringify(datos)

    });

}