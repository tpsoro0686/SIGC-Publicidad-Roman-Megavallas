import http from "../../services/http.js";

import { getToken } from "../../core/auth.js";

import AppConfig from "../../core/config.js";

export function obtener() {

    return http.get("/configuracion");

}

export function actualizar(datos) {

    return http.put("/configuracion", datos);

}

export async function actualizarLogo(archivo) {

    const formData = new FormData();

    formData.append("logo", archivo);

    const respuesta = await fetch(`${AppConfig.api.baseUrl}/configuracion/logo`, {

        method: "POST",

        headers: { Authorization: `Bearer ${getToken()}` },

        body: formData

    });

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {

        throw { status: respuesta.status, message: datos?.message || "No se pudo actualizar el logo.", data: datos };

    }

    return datos;

}

export function actualizarTipoCambio() {

    return http.post("/configuracion/tipo-cambio/actualizar", {});

}

export function obtenerSalud() {

    return http.get("/configuracion/salud");

}

export function toggleMantenimiento(activar) {

    return http.post("/configuracion/mantenimiento", { activar });

}