/**
 * Llamadas a la API pública del portal (no requieren login).
 * Los errores se lanzan como { status, message, data }.
 */

import { API_URL } from "./config.js";

async function pedir(ruta, opciones = {}) {

    const controlador = new AbortController();

    const temporizador = setTimeout(() => controlador.abort(), 20000);

    try {

        const respuesta = await fetch(API_URL + ruta, {

            ...opciones,

            signal: controlador.signal,

            headers: {
                Accept: "application/json",
                ...(opciones.body ? { "Content-Type": "application/json" } : {})
            }

        });

        let data = null;

        try {

            data = await respuesta.json();

        }

        catch {

            data = null;

        }

        if (!respuesta.ok) {

            const mensaje = respuesta.status === 429
                ? "Se hicieron demasiadas consultas seguidas. Espera un minuto e inténtalo de nuevo."
                : (data?.message || "Ocurrió un error.");

            throw { status: respuesta.status, data, message: mensaje };

        }

        return data;

    }

    catch (error) {

        if (error && typeof error.status === "number") {

            throw error;

        }

        throw { status: 0, data: null, message: "No se pudo conectar con el servidor." };

    }

    finally {

        clearTimeout(temporizador);

    }

}

// El listado se guarda 2 minutos en el navegador: si la página se recarga
// varias veces seguidas no se vuelve a llamar a la API (evita "Too Many Attempts").
const CACHE_VALLAS = "portal_cache_vallas";

const CACHE_MS = 2 * 60 * 1000;

function leerCache() {

    try {

        const guardado = JSON.parse(sessionStorage.getItem(CACHE_VALLAS));

        if (guardado && Date.now() - guardado.hora < CACHE_MS) {

            return guardado.datos;

        }

    }

    catch {

        // sin almacenamiento: se pide a la API

    }

    return null;

}

function guardarCache(datos) {

    try {

        sessionStorage.setItem(CACHE_VALLAS, JSON.stringify({ hora: Date.now(), datos }));

    }

    catch {

        // sin almacenamiento: no pasa nada

    }

}

export async function obtenerVallas({ forzar = false } = {}) {

    const cache = forzar ? null : leerCache();

    if (cache) {

        return cache;

    }

    const datos = await pedir("/portal/vallas");

    guardarCache(datos);

    return datos;

}

export function obtenerValla(id) {

    return pedir(`/portal/vallas/${id}`);

}

export function obtenerProvincias() {

    return pedir("/portal/provincias");

}

export function enviarSolicitud(datos) {

    return pedir("/portal/solicitudes", { method: "POST", body: JSON.stringify(datos) });

}

// ---- Pagos en línea (solo se usan si el backend los tiene habilitados) ----

export function obtenerConfiguracion() {

    return pedir("/portal/configuracion");

}

export function obtenerOpcionesPago(token) {

    return pedir(`/portal/solicitudes/${encodeURIComponent(token)}/pago`);

}

export function iniciarPago(token, tipo) {

    return pedir(`/portal/solicitudes/${encodeURIComponent(token)}/pago`, { method: "POST", body: JSON.stringify({ tipo }) });

}

// Solo para la pasarela de PRUEBA (desarrollo): simula el aviso de la pasarela
export function simularAviso(referencia, estadoPago) {

    return pedir("/portal/pagos/aviso/simulado", { method: "POST", body: JSON.stringify({ referencia, estado: estadoPago }) });

}
