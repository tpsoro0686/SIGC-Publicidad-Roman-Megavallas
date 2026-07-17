/*=========================================================
    STRINGS
=========================================================*/

const StringHelper = {

    capitalizar(texto){

        if(!texto) return "";

        return texto.charAt(0).toUpperCase() + texto.slice(1);

    },

    limpiar(texto){

        return texto.trim();

    }

};

Object.freeze(StringHelper);