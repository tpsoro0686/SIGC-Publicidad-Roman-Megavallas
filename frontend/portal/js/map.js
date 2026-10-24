/**
 * Mapa del portal (Leaflet + markercluster, cargados desde index.html).
 * Cada valla es un cartel con poste: verde si está disponible ahora,
 * ámbar si lo estará más adelante.
 */

import { MAPA_INICIAL } from "./config.js";

import { esAhora } from "./format.js";

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

const ATRIBUCION = "&copy; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a>";

let mapa = null;

let grupo = null;

let callbacks = {};

const marcadores = new Map();

function icono(valla, { enLista = false, activa = false } = {}) {

    const clases = [
        "vm",
        esAhora(valla) ? "vm--ahora" : "vm--pronto",
        enLista ? "vm--lista" : "",
        activa ? "vm--activa" : ""
    ].join(" ");

    return L.divIcon({

        className: "vm-envoltura",

        html: `<div class="${clases}"><i class="vm__cartel"></i><i class="vm__poste"></i></div>`,

        iconSize: [30, 40],

        iconAnchor: [15, 40]

    });

}

export function iniciarMapa(idContenedor, cb) {

    callbacks = cb;

    mapa = L.map(idContenedor, { zoomControl: false, minZoom: 6 })
        .setView(MAPA_INICIAL.centro, MAPA_INICIAL.zoom);

    L.control.zoom({
        position: "topright",
        zoomInTitle: "Acercar",
        zoomOutTitle: "Alejar"
    }).addTo(mapa);

    L.tileLayer(TILES, { maxZoom: 19, attribution: ATRIBUCION }).addTo(mapa);

    grupo = L.markerClusterGroup({

        showCoverageOnHover: false,

        maxClusterRadius: 48,

        iconCreateFunction: (cluster) => L.divIcon({
            html: `<span>${cluster.getChildCount()}</span>`,
            className: "cluster",
            iconSize: [40, 40]
        })

    });

    mapa.addLayer(grupo);

    mapa.on("moveend", () => callbacks.alMover?.());

    return mapa;

}

export function mostrarVallas(vallas, { lista = [], activaId = null } = {}) {

    grupo.clearLayers();

    marcadores.clear();

    const capas = vallas.map((valla) => {

        const marcador = L.marker([Number(valla.latitud), Number(valla.longitud)], {

            icon: icono(valla, { enLista: lista.includes(valla.id), activa: valla.id === activaId }),

            title: valla.codigo,

            riseOnHover: true

        });

        marcador.bindTooltip(valla.codigo, { direction: "top", offset: [0, -34] });

        marcador.on("click", () => callbacks.alElegir?.(valla.id));

        marcadores.set(valla.id, { marcador, valla });

        return marcador;

    });

    grupo.addLayers(capas);

}

export function actualizarMarcador(valla, opciones) {

    const item = marcadores.get(valla.id);

    if (item) {

        item.marcador.setIcon(icono(valla, opciones));

        item.marcador.setZIndexOffset(opciones?.activa ? 1000 : 0);

    }

}

export function esMovil() {

    return window.matchMedia("(max-width: 860px)").matches;

}

// Acerca el mapa a una valla (aunque esté dentro de un grupo) y la deja visible
// por encima del panel inferior en celulares.
export function enfocar(valla) {

    const item = marcadores.get(valla.id);

    const destino = [Number(valla.latitud), Number(valla.longitud)];

    const centrar = () => {

        const zoom = Math.max(mapa.getZoom(), 15);

        const compensacion = esMovil() ? mapa.getSize().y * 0.22 : 0;

        const punto = mapa.project(destino, zoom).add([0, compensacion]);

        mapa.flyTo(mapa.unproject(punto, zoom), zoom, { duration: 0.6 });

    };

    if (item) {

        grupo.zoomToShowLayer(item.marcador, centrar);

    }

    else {

        centrar();

    }

}

export function ajustarA(vallas) {

    if (!vallas.length) {

        return;

    }

    const limites = L.latLngBounds(vallas.map((v) => [Number(v.latitud), Number(v.longitud)]));

    mapa.fitBounds(limites, { padding: [48, 48], maxZoom: 15 });

}

export function volarA(lat, lng, zoom = 13) {

    mapa.flyTo([lat, lng], zoom, { duration: 0.8 });

}

export function estaEnVista(valla) {

    return mapa.getBounds().contains([Number(valla.latitud), Number(valla.longitud)]);

}

export function recalcularTamano() {

    if (mapa) {

        mapa.invalidateSize();

    }

}
