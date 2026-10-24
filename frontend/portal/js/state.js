/**
 * Estado del portal (en memoria) y lo poco que se guarda en el navegador:
 * la lista de vallas y el presupuesto. Todo acceso al navegador va en try/catch
 * porque puede estar bloqueado (modo privado, etc.).
 */

import { STORAGE } from "./config.js";

function leer(clave, porDefecto) {

    try {

        const crudo = window.localStorage.getItem(clave);

        return crudo === null ? porDefecto : JSON.parse(crudo);

    }

    catch {

        return porDefecto;

    }

}

function guardar(clave, valor) {

    try {

        window.localStorage.setItem(clave, JSON.stringify(valor));

    }

    catch {

        // sin almacenamiento: la lista vive solo mientras la página esté abierta

    }

}

const listaGuardada = leer(STORAGE.lista, []);

const presupuestoGuardado = Number(leer(STORAGE.presupuesto, 0)) || 0;

const estado = {

    vallas: [],

    provincias: [],

    cargando: true,

    errorCarga: null,

    filtros: {
        provinciaId: "",
        disponibilidad: "todas",
        busqueda: ""
    },

    // ids de las vallas en "Mi lista"
    lista: Array.isArray(listaGuardada) ? listaGuardada.filter((id) => Number.isInteger(id)) : [],

    presupuesto: presupuestoGuardado,

    // "lista" | "detalle" | "milista" | "enviado"
    vista: "lista",

    activaId: null,

    detalle: null,

    borrador: {
        nombre: "",
        empresa: "",
        telefono: "",
        correo: "",
        fecha_inicio_deseada: "",
        plazo_meses_deseado: "",
        mensaje: ""
    },

    enviando: false,

    errores: {},

    errorGeneral: "",

    codigoSolicitud: null,

    // Pagos en línea: token secreto de la solicitud, opciones de cobro y estado de la pantalla
    tokenSolicitud: null,

    pago: null,

    pagando: false,

    pagoMensaje: "",

    pagoSimulado: ""

};

export function guardarLista() {

    guardar(STORAGE.lista, estado.lista);

}

export function guardarPresupuesto() {

    guardar(STORAGE.presupuesto, estado.presupuesto);

}

export default estado;
