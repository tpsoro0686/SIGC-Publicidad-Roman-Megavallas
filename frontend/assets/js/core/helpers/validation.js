/*=========================================================
    VALIDACIONES
=========================================================*/

const ValidationHelper = {

    correo(email){

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    },

    requerido(valor){

        return valor.trim() !== "";

    }

};

Object.freeze(ValidationHelper);