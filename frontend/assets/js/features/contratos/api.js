import http from "../../services/http.js";

export function listar(filtros = {}) {

    const params = new URLSearchParams();

    if (filtros.estado) {

        params.set("estado", filtros.estado);

    }

    const query = params.toString();

    return http.get(`/contratos${query ? `?${query}` : ""}`);

}

export function obtenerResumen() {

    return http.get("/contratos/resumen");

}

export function obtener(id) {

    return http.get(`/contratos/${id}`);

}

export function crear(datos) {

    return http.post("/contratos", datos);

}

export function finalizar(id) {

    return http.request(`/contratos/${id}/finalizar`, {

        method: "PATCH"

    });

}

export function renovar(id, datos) {

    return http.request(`/contratos/${id}/renovar`, {

        method: "PATCH",

        body: JSON.stringify(datos)

    });

}

export function eliminar(id) {

    return http.request(`/contratos/${id}`, {

        method: "DELETE"

    });

}

export function listarVallasDisponibles() {

    return http.get("/vallas?estado=Disponible");

}