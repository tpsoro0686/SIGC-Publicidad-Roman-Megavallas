const CLASES_TIPO = {

    Contratos: "sigc-badge--alquilada",

    Reservas: "sigc-badge--reservada",

    Vallas: "sigc-badge--disponible",

    Clientes: "sigc-badge--mantenimiento",

    Financiero: "sigc-badge--inactiva"

};

export function badgeTipo(tipo) {

    const clase = CLASES_TIPO[tipo] || "sigc-badge--inactiva";

    return `<span class="sigc-badge ${clase}">${tipo}</span>`;

}