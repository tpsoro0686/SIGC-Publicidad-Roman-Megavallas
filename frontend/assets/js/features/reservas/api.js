/**
 * ==========================================
 * API del módulo Reservas
 * ==========================================
 */

import http from "../../services/http.js";

export function listar(filtros = {}) {

    const params = new URLSearchParams();

    if (filtros.estado) {

        params.set("estado", filtros.estado);

    }

    if (filtros.soloMias) {

        params.set("solo_mias", "1");

    }

    const query = params.toString();

    return http.get(`/reservas${query ? `?${query}` : ""}`);

}

export function obtenerResumen() {

    return http.get("/reservas/resumen");

}

export function crear(datos) {

    return http.post("/reservas", datos);

}

export function cancelar(id) {

    return http.request(`/reservas/${id}/cancelar`, {

        method: "PATCH"

    });

}

export function convertir(id) {

    return http.request(`/reservas/${id}/convertir`, {

        method: "PATCH"

    });

}

export function listarVallasDisponibles() {

    return http.get("/vallas?estado=Disponible");

}