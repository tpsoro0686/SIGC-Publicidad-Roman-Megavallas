/**
 * ==========================================
 * Módulo Dashboard
 * ==========================================
 */

import { requireAuth } from "../../core/guard.js";

function initialize() {

    if (!requireAuth()) {
        return;
    }

    // Resto de la inicialización del dashboard.
    console.log("Dashboard inicializado.");

}

document.addEventListener(
    "DOMContentLoaded",
    initialize
);