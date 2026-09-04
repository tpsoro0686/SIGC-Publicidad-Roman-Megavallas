/**
 * ==========================================
 * Tema claro / oscuro
 * Se inyecta como <style> al final de <head>,
 * así siempre gana por orden de carga sin tener
 * que tocar el CSS de cada módulo.
 * ==========================================
 */

import Storage from "../../core/storage.js";

const STORAGE_KEY = "sigc_theme";

const CSS_OSCURO = `
[data-theme="dark"] body { background:#15161A; color:#E7E8EC; }
[data-theme="dark"] .sigc-content { background:#15161A; }
[data-theme="dark"] .sigc-header,
[data-theme="dark"] .sigc-stat-card,
[data-theme="dark"] .sigc-table-wrap,
[data-theme="dark"] .sigc-filters,
[data-theme="dark"] .sigc-valla-card,
[data-theme="dark"] .sigc-detalle-panel,
[data-theme="dark"] .modal-content {
    background:#1E2027 !important;
    color:#E7E8EC !important;
    border-color:#2A2C33 !important;
}
[data-theme="dark"] .sigc-table {
    --bs-table-bg: transparent;
    --bs-table-color: #E7E8EC;
    --bs-table-border-color: #2A2C33;
    --bs-table-striped-bg: #22242B;
    --bs-table-striped-color: #E7E8EC;
    --bs-table-hover-bg: #22242B;
    --bs-table-hover-color: #E7E8EC;
}
[data-theme="dark"] .sigc-table thead { background:#22242B !important; color:#9A9DAA !important; }
[data-theme="dark"] .sigc-table tbody tr,
[data-theme="dark"] .sigc-table td,
[data-theme="dark"] .sigc-table th {
    background-color: transparent !important;
    color:#E7E8EC !important;
    border-color:#2A2C33 !important;
}
[data-theme="dark"] .sigc-table td, [data-theme="dark"] .sigc-table th { border-color:#2A2C33 !important; color:#E7E8EC; }
[data-theme="dark"] .form-control, [data-theme="dark"] .form-select, [data-theme="dark"] .sigc-select {
    background:#22242B !important;
    color:#E7E8EC !important;
    border-color:#2A2C33 !important;
}
[data-theme="dark"] .text-muted { color:#9A9DAA !important; }
[data-theme="dark"] .sigc-empty-state { color:#9A9DAA; }
[data-theme="dark"] .sigc-empty-state { color:#9A9DAA; }
[data-theme="dark"] .modal-title { color:#E7E8EC !important; }
[data-theme="dark"] .btn-close { filter: invert(1) grayscale(100%) brightness(200%); }
[data-theme="dark"] hr { border-color:#2A2C33; opacity: 1; }
[data-theme="dark"] .nav-tabs { border-color:#2A2C33; }

[data-theme="dark"] .nav-tabs { border-color:#2A2C33; }
[data-theme="dark"] h1,
[data-theme="dark"] h2,
[data-theme="dark"] h3,
[data-theme="dark"] h4,
[data-theme="dark"] h5,
[data-theme="dark"] h6 { color:#E7E8EC !important; }
[data-theme="dark"] h1,
[data-theme="dark"] h2,
[data-theme="dark"] h3,
[data-theme="dark"] h4,
[data-theme="dark"] h5,
[data-theme="dark"] h6 { color:#E7E8EC !important; }
[data-theme="dark"] .sigc-flyer__box-value {
    color:#E7E8EC !important;
}
[data-theme="dark"] .sigc-flyer__precio-label {
    color:#9A9DAA !important;
}
`;

function inyectarEstilo() {

    if (document.getElementById("sigc-dark-theme-style")) {

        return;

    }

    const estilo = document.createElement("style");

    estilo.id = "sigc-dark-theme-style";

    estilo.textContent = CSS_OSCURO;

    document.head.appendChild(estilo);

}

export function aplicarTemaGuardado() {

    const tema = Storage.get(STORAGE_KEY) || "light";

    inyectarEstilo();

    document.documentElement.setAttribute("data-theme", tema);

}

export function alternarTema() {

    const actual = document.documentElement.getAttribute("data-theme") || "light";

    const nuevo = actual === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", nuevo);

    Storage.set(STORAGE_KEY, nuevo);

    return nuevo;

}

export function temaActual() {

    return document.documentElement.getAttribute("data-theme") || "light";

}