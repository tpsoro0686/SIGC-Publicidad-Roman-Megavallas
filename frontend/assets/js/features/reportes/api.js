import http from "../../services/http.js";

import { getToken } from "../../core/auth.js";

import AppConfig from "../../core/config.js";

export function listar() {

    return http.get("/reportes");

}

export function obtenerResumen() {

    return http.get("/reportes/resumen");

}

export function obtenerTipos() {

    return http.get("/reportes/tipos");

}

export function generar(datos) {

    return http.post("/reportes", datos);

}

export async function obtenerBlob(id) {
    const respuesta = await fetch(`${AppConfig.api.baseUrl}/reportes/${id}/descargar/pdf`, {
        headers: { Authorization: `Bearer ${getToken()}` }
    });

    if (!respuesta.ok) {
        throw new Error("No se pudo obtener el archivo.");
    }

    return respuesta.blob();
}

export async function descargar(id, nombreArchivo) {
    const blob = await obtenerBlob(id);
    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.click();
    window.URL.revokeObjectURL(url);
}