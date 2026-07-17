/*=========================================================
    FECHAS
=========================================================*/

const DateHelper = {

    formatear(fecha){

        return new Date(fecha).toLocaleDateString("es-CR");

    },

    hoy(){

        return new Date();

    },

    obtenerAnio(){

        return new Date().getFullYear();

    }

};

Object.freeze(DateHelper);
