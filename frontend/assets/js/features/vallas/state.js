/**
 * ==========================================
 * Estado del módulo Vallas
 * ==========================================
 */

const vallasState = {

    vallas: [],

    provincias: [],

    resumen: null,

    vallaSeleccionada: null,

    filtros: {

        busqueda: "",

        provincia_id: "",

        estado: ""

    },

    paginacion: {

        paginaActual: 1,

        ultimaPagina: 1,

        total: 0

    },

    cargando: false

};

export default vallasState;