/**
 * Configuración del portal de clientes.
 *
 * Si no se define window.PORTAL_API_URL en index.html, el portal asume que la API
 * corre en el mismo equipo, en el puerto 8000 (igual que el SIGC en desarrollo).
 */

export const API_URL = window.PORTAL_API_URL || `http://${window.location.hostname}:8000/api`;

// Vista inicial del mapa: Costa Rica completa
export const MAPA_INICIAL = Object.freeze({
    centro: [9.75, -84.2],
    zoom: 8
});

export const STORAGE = Object.freeze({
    lista: "portal_lista",
    presupuesto: "portal_presupuesto"
});
