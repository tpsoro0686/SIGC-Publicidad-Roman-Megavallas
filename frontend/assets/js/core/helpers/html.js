/*=========================================================
    HTML
    Escapa texto antes de meterlo en un innerHTML.
    Los datos de las solicitudes los escribe el público
    en el portal, así que NUNCA se insertan sin escapar.
=========================================================*/

export function esc(valor) {

    return String(valor ?? "")

        .replace(/&/g, "&amp;")

        .replace(/</g, "&lt;")

        .replace(/>/g, "&gt;")

        .replace(/"/g, "&quot;")

        .replace(/'/g, "&#39;");

}

export function usd(valor) {

    const n = Number(valor);

    if (valor === null || valor === undefined || valor === "" || Number.isNaN(n)) {

        return "—";

    }

    return "$" + n.toLocaleString("en-US", {

        minimumFractionDigits: Number.isInteger(n) ? 0 : 2,

        maximumFractionDigits: 2

    });

}

export function fechaHora(valor) {

    if (!valor) {

        return "—";

    }

    const fecha = new Date(valor);

    return Number.isNaN(fecha.getTime())

        ? "—"

        : fecha.toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" })
            + " " + fecha.toLocaleTimeString("es-CR", { hour: "2-digit", minute: "2-digit" });

}

export function soloFecha(valor) {

    if (!valor) {

        return "—";

    }

    const [anio, mes, dia] = String(valor).slice(0, 10).split("-").map(Number);

    if (!anio || !mes || !dia) {

        return "—";

    }

    return new Date(anio, mes - 1, dia).toLocaleDateString("es-CR", { day: "2-digit", month: "short", year: "numeric" });

}
