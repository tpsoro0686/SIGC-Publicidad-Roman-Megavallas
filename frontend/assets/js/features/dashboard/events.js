/**
 * ==========================================
 * Eventos del módulo Dashboard
 * ==========================================
 */

import dashboardState from "./state.js";

import * as api from "./api.js";

import * as vallasApi from "../vallas/api.js";

import { getUser } from "../../core/auth.js";

let graficoIngresos = null;

let graficoDona = null;

let mapa = null;

const COLOR_ESTADO = {

    Disponible: "#1FA971",

    Reservada: "#C77700",

    Alquilada: "#2563EB",

    Mantenimiento: "#7A7E8C",

    Inactiva: "#B0B3BD"

};

function formatearMoneda(monto) {

    return `$${Number(monto || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

}

function formatearFecha(fecha) {

    if (!fecha) {

        return "-";

    }

    return new Date(fecha).toLocaleDateString("es-CR");

}

function tarjeta(icono, colorClase, label, valor, sub = "") {

    return `
        <div class="sigc-stat-card">
            <div class="sigc-stat-card__icon sigc-stat-card__icon--${colorClase}">
                <i data-lucide="${icono}"></i>
            </div>
            <div>
                <div class="sigc-stat-card__label">${label}</div>
                <div class="sigc-stat-card__value">${valor}</div>
                ${sub ? `<div class="text-muted small">${sub}</div>` : ""}
            </div>
        </div>
    `;

}

function renderStatsGeneral(datos) {

    return [
        tarjeta("monitor", "rose", "Vallas totales", datos.vallas.total),
        tarjeta("check-circle", "green", "Disponibles", datos.vallas.disponibles),
        tarjeta("calendar-clock", "amber", "Reservadas", datos.vallas.reservadas),
        tarjeta("file-check-2", "blue", "Contratos activos", datos.contratos.activos),
    ].join("");

}

function renderStatsContable(datos) {

    return [
        tarjeta("file-check-2", "blue", "Contratos activos", datos.contratos.activos),
        tarjeta("alarm-clock", "amber", "Contratos por vencer", datos.contratos.por_vencer),
        tarjeta("dollar-sign", "green", "Ingresos del mes", formatearMoneda(datos.ingresos_mes)),
        tarjeta("repeat", "blue", "Ingreso recurrente", formatearMoneda(datos.ingreso_recurrente)),
    ].join("");

}

function renderStatsEjecutivo(datos) {

    return [
        tarjeta("monitor", "rose", "Vallas disponibles", datos.vallas_disponibles),
        tarjeta("calendar-clock", "amber", "Mis reservas activas", datos.mis_reservas.activas),
        tarjeta("file-check-2", "blue", "Mis contratos activos", datos.mis_contratos.activos),
        tarjeta("dollar-sign", "green", "Mis ingresos del mes", formatearMoneda(datos.mis_ingresos_mes)),
    ].join("");

}

function renderRanking(ranking) {

    if (!ranking || ranking.length === 0) {

        return `<p class="text-muted small">Sin ventas registradas este mes todavía.</p>`;

    }

    return ranking.map((fila, indice) => `

        <div class="sigc-ranking-item">
            <span class="sigc-ranking-item__puesto">${indice + 1}</span>
            <div class="flex-grow-1">
                <div>${fila.nombre}</div>
                <div class="text-muted">${fila.contratos} contrato(s)</div>
            </div>
            <strong>${formatearMoneda(fila.monto_vendido)}</strong>
        </div>

    `).join("");

}

function renderVencimientos(items) {

    if (!items || items.length === 0) {

        return `<p class="text-muted small">No hay vencimientos próximos.</p>`;

    }

    return items.map((item) => {

        const urgente = item.dias_restantes <= 3;

        return `
            <div class="sigc-vencimiento-item">
                <div>
                    <strong>${item.codigo}</strong> &middot; ${item.tipo}
                    <div class="text-muted">${item.cliente}</div>
                </div>
                <span class="sigc-vencimiento-item__dias ${urgente ? "sigc-vencimiento-item__dias--urgente" : "sigc-vencimiento-item__dias--normal"}">
                    ${item.dias_restantes} día(s)
                </span>
            </div>
        `;

    }).join("");

}

function renderActividad(items) {

    if (!items || items.length === 0) {

        return `<p class="text-muted small">Sin actividad registrada todavía.</p>`;

    }

    return items.map((item) => `

        <div class="sigc-actividad-item">
            <div>
                <strong>${item.accion}</strong>
                <div class="text-muted">${item.usuario} &middot; ${item.modulo}</div>
                ${item.descripcion ? `<div>${item.descripcion}</div>` : ""}
            </div>
            <span class="text-muted">${formatearFecha(item.fecha)}</span>
        </div>

    `).join("");

}

function renderGraficoIngresos(serie) {

    const ctx = document.getElementById("graficoIngresos");

    if (graficoIngresos) {

        graficoIngresos.destroy();

    }

    graficoIngresos = new Chart(ctx, {

        type: "line",

        data: {

            labels: serie.map((item) => item.etiqueta),

            datasets: [{

                label: "Ingresos (USD)",

                data: serie.map((item) => item.total),

                borderColor: "#E31E24",

                backgroundColor: "rgba(227,30,36,.12)",

                fill: true,

                tension: .35,

                pointBackgroundColor: "#E31E24"

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: true,

            aspectRatio: 2.5,

            plugins: { legend: { display: false } },

            scales: {

                y: { display: false, beginAtZero: true },

                x: { grid: { display: false } }

            }

        }

    });

    const actual = serie[serie.length - 1]?.total ?? 0;

    const anterior = serie[serie.length - 2]?.total ?? 0;

    document.getElementById("ingresosValor").textContent = formatearMoneda(actual);

    const tendenciaEl = document.getElementById("ingresosTendencia");

    if (anterior > 0) {

        const cambio = ((actual - anterior) / anterior) * 100;

        const positivo = cambio >= 0;

        tendenciaEl.className = `sigc-ingresos-tendencia ${positivo ? "sigc-ingresos-tendencia--positiva" : "sigc-ingresos-tendencia--negativa"}`;

        tendenciaEl.textContent = `${positivo ? "▲" : "▼"} ${Math.abs(cambio).toFixed(1)}% vs mes anterior`;

    } else {

        tendenciaEl.textContent = "";

    }

}

const ETIQUETAS_DONA = {

    disponibles: { label: "Disponibles", color: "#1FA971" },

    reservadas: { label: "Reservadas", color: "#E31E24" },

    alquiladas: { label: "Contratos activos", color: "#F5820A" },

    fuera_de_servicio: { label: "Fuera de servicio", color: "#B0B3BD" }

};

function renderDona(vallas) {

    const claves = Object.keys(ETIQUETAS_DONA);

    const valores = claves.map((clave) => vallas[clave] || 0);

    const ctx = document.getElementById("graficoDona");

    if (graficoDona) {

        graficoDona.destroy();

    }

    graficoDona = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: claves.map((clave) => ETIQUETAS_DONA[clave].label),

            datasets: [{

                data: valores,

                backgroundColor: claves.map((clave) => ETIQUETAS_DONA[clave].color),

                borderWidth: 0

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: true,

            aspectRatio: 1,

            plugins: { legend: { display: false } },

            cutout: "58%"

        }

    });

    document.getElementById("donaLeyenda").innerHTML = claves.map((clave) => `

        <div class="sigc-dona-leyenda__item">
            <span class="sigc-dona-leyenda__label">
                <span class="sigc-dona-leyenda__dot" style="background:${ETIQUETAS_DONA[clave].color}"></span>
                ${ETIQUETAS_DONA[clave].label}
            </span>
            <strong>${vallas[clave] || 0}</strong>
        </div>

    `).join("") + `

        <div class="sigc-dona-leyenda__item border-top pt-2 mt-1">
            <span>Total</span>
            <strong>${vallas.total}</strong>
        </div>

    `;

    const cajaCanvas = document.querySelector(".sigc-dona-canvas-box");

    let centro = cajaCanvas.querySelector(".sigc-dona-centro");

    if (!centro) {

        centro = document.createElement("div");

        centro.className = "sigc-dona-centro";

        cajaCanvas.appendChild(centro);

    }

    centro.innerHTML = `<strong>${vallas.total}</strong><span>Vallas</span>`;
}

async function cargarMapa() {

    try {

        const respuesta = await vallasApi.listar();

        const vallas = (respuesta.data ?? respuesta).filter((valla) => valla.latitud && valla.longitud);

        if (!mapa) {

            mapa = L.map("mapaVallas").setView([9.7489, -83.7534], 8);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {

                attribution: "&copy; OpenStreetMap"

            }).addTo(mapa);

        }

        mapa.eachLayer((capa) => {

            if (capa instanceof L.CircleMarker) {

                mapa.removeLayer(capa);

            }

        });

        const puntos = [];

        vallas.forEach((valla) => {

            const lat = Number(valla.latitud);

            const lon = Number(valla.longitud);

            const color = COLOR_ESTADO[valla.estado] || "#7A7E8C";

            L.circleMarker([lat, lon], {

                radius: 7,

                color: "#fff",

                weight: 1,

                fillColor: color,

                fillOpacity: 1

            })
                .bindPopup(`<strong>${valla.codigo}</strong><br>${valla.referencia}<br>${valla.estado}`)
                .addTo(mapa);

            puntos.push([lat, lon]);

        });

        const conteo = { Disponible: 0, Reservada: 0, Alquilada: 0, Mantenimiento: 0, Inactiva: 0 };

        vallas.forEach((valla) => {

            if (conteo[valla.estado] !== undefined) {

                conteo[valla.estado] += 1;

            }

        });

        document.getElementById("mapaLeyenda").innerHTML = Object.entries(conteo)
            .filter(([, cantidad]) => cantidad > 0)
            .map(([estado, cantidad]) => `
                <div class="sigc-mapa-leyenda__item">
                    <span class="sigc-mapa-leyenda__dot" style="background:${COLOR_ESTADO[estado]}"></span>
                    ${estado} <span class="sigc-mapa-leyenda__valor">${cantidad}</span>
                </div>
            `).join("");

        setTimeout(() => mapa.invalidateSize(), 200);

    }

    catch (error) {

        console.error(error);

        document.getElementById("mapaVallas").innerHTML = `<p class="text-muted small">No se pudo cargar el mapa.</p>`;

    }

}

function ajustarLayoutParaContable() {

    document.getElementById("colMapa").classList.add("d-none");

    document.getElementById("colDona").classList.add("d-none");

    document.getElementById("separadorDona").classList.add("d-none");

    document.getElementById("panelDonaIngresos").classList.remove("sigc-panel-300");

    document.getElementById("panelDonaIngresos").classList.add("sigc-panel-400");

}

function renderDashboard(datos) {

    const usuario = getUser();

    document.getElementById("sigcDashboardSaludo").textContent = `Hola, ${usuario?.nombre?.split(" ")[0] ?? ""}`;

    document.getElementById("sigcStats").innerHTML = datos.vista === "general"
        ? renderStatsGeneral(datos)
        : datos.vista === "contable"
            ? renderStatsContable(datos)
            : renderStatsEjecutivo(datos);

    if (datos.vista === "contable") {

        ajustarLayoutParaContable();

        document.getElementById("listaVencimientos").innerHTML = renderVencimientos(datos.proximos_vencimientos);

        document.getElementById("colActividad").classList.add("d-none");

        document.getElementById("listaRanking").innerHTML = renderRanking(datos.ranking_ejecutivos);

    }

    else if (datos.vista === "general") {

        renderDona(datos.vallas);

        cargarMapa();

        document.getElementById("listaVencimientos").innerHTML = renderVencimientos(datos.proximos_vencimientos);

        document.getElementById("listaActividad").innerHTML = renderActividad(datos.actividad_reciente);

        document.getElementById("listaRanking").innerHTML = renderRanking(datos.ranking_ejecutivos);

    }

    else {

        renderDona({ ...datos.vallas, total: datos.vallas.total });

        cargarMapa();

        document.getElementById("listaVencimientos").innerHTML = renderVencimientos(datos.mis_proximos_vencimientos);

        document.getElementById("listaActividad").innerHTML = renderActividad(datos.mi_actividad_reciente);

        document.getElementById("filaRanking").classList.add("d-none");

    }

    const serie = datos.ingresos_6_meses || [];

    if (serie.length > 0) {

        renderGraficoIngresos(serie);

    }

    lucide.createIcons();

}

async function cargarDashboard() {

    try {

        dashboardState.datos = await api.obtenerDashboard();

        renderDashboard(dashboardState.datos);

    }

    catch (error) {

        console.error(error);

        document.getElementById("sigcContent").innerHTML = `
            <div class="sigc-empty-state">
                <i data-lucide="triangle-alert"></i>
                <p>No se pudo cargar el dashboard.</p>
            </div>
        `;

        lucide.createIcons();

    }

}

function registrarSidebar() {

    const sidebar = document.getElementById("sigcSidebar");

    const overlay = document.getElementById("sigcOverlay");

    document.getElementById("btnMenu").addEventListener("click", () => {

        sidebar.classList.add("is-open");

        overlay.classList.add("is-open");

    });

    overlay.addEventListener("click", () => {

        sidebar.classList.remove("is-open");

        overlay.classList.remove("is-open");

    });

}

export function registerEvents() {

    registrarSidebar();

    cargarDashboard();

}