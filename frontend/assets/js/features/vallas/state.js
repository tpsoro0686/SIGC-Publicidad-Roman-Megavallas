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

    cargando: false

};

export default vallasState;