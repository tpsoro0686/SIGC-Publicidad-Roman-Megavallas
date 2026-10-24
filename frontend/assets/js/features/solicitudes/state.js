/**
 * ==========================================
 * Estado del módulo Solicitudes
 * ==========================================
 */

const solicitudesState = {

    solicitudes: [],

    resumen: null,

    ejecutivos: [],

    seleccionada: null,

    filtros: {

        busqueda: "",

        estado: ""

    },

    paginacion: {

        paginaActual: 1,

        ultimaPagina: 1,

        total: 0

    }

};

export default solicitudesState;
