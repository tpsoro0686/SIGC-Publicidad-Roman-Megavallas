/**
 * Utilidades de formato y texto del portal.
 */

const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

export function esc(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, (c) => ({

        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"

    }[c]));

}

// "$1,500" o "$1,500.50". Devuelve null si no hay precio.
export function usd(valor) {

    if (valor === null || valor === undefined || valor === "" || Number.isNaN(Number(valor))) {

        return null;

    }

    const n = Number(valor);

    return "$" + n.toLocaleString("en-US", {
        minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
        maximumFractionDigits: 2
    });

}

export function numero(valor) {

    if (valor === null || valor === undefined || valor === "" || Number.isNaN(Number(valor))) {

        return null;

    }

    return Number(valor).toLocaleString("en-US");

}

// "2027-01-15" -> "15 ene 2027"
export function fechaCorta(iso) {

    if (!iso) {

        return null;

    }

    const [anio, mes, dia] = String(iso).slice(0, 10).split("-").map(Number);

    if (!anio || !mes || !dia) {

        return null;

    }

    return `${dia} ${MESES[mes - 1]} ${anio}`;

}

export function hoyISO() {

    const ahora = new Date();

    const mes = String(ahora.getMonth() + 1).padStart(2, "0");

    const dia = String(ahora.getDate()).padStart(2, "0");

    return `${ahora.getFullYear()}-${mes}-${dia}`;

}

// Para buscar sin importar mayúsculas ni tildes
export function normalizar(texto) {

    return String(texto ?? "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim();

}

export function plural(n, singular, plural_) {

    return n === 1 ? singular : plural_;

}

export function esAhora(valla) {

    return valla.disponibilidad === "Disponible";

}

export function textoDisponibilidad(valla) {

    if (esAhora(valla)) {

        return "Disponible ahora";

    }

    const fecha = fechaCorta(valla.disponible_desde);

    return fecha ? `Disponible desde ${fecha}` : "Disponibilidad por confirmar";

}
