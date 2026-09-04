import http from "../../services/http.js";

export function actualizarNombre(nombre) {

    return http.put("/perfil", { nombre });

}

export function cambiarPassword(passwordActual, passwordNueva) {

    return http.request("/perfil/password", {

        method: "PATCH",

        body: JSON.stringify({

            password_actual: passwordActual,

            password_nueva: passwordNueva

        })

    });

}

export function obtenerEstadisticas() {

    return http.get("/perfil/estadisticas");

}

export function obtenerActividad() {

    return http.get("/perfil/actividad");

}

export function obtenerSesiones() {

    return http.get("/perfil/sesiones");

}

export function revocarSesion(tokenId) {

    return http.delete(`/perfil/sesiones/${tokenId}`);

}