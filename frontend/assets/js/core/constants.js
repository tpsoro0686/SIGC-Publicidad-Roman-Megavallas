/*=========================================================
    ROLES
=========================================================*/

export const ROLES = Object.freeze({

    ADMINISTRADOR: "Administrador",

    OPERADOR: "Operador",

    CONSULTA: "Consulta"

});

/*=========================================================
    ESTADOS DE VALLAS
=========================================================*/

export const ESTADOS_VALLA = Object.freeze({

    DISPONIBLE: "Disponible",

    RESERVADA: "Reservada",

    ALQUILADA: "Alquilada",

    MANTENIMIENTO: "Mantenimiento"

});

/*=========================================================
    MONEDAS
=========================================================*/

export const MONEDAS = Object.freeze({

    USD: "USD",

    CRC: "CRC"

});

/*=========================================================
    MENSAJES DEL SISTEMA
=========================================================*/

export const MESSAGES = Object.freeze({

    LOGIN:{

        EMAIL_REQUIRED: "Ingrese su correo electrónico.",

        PASSWORD_REQUIRED: "Ingrese su contraseña.",

        INVALID_EMAIL: "Ingrese un correo electrónico válido.",

        INVALID_CREDENTIALS: "Correo o contraseña incorrectos.",

        LOGIN_ERROR: "No fue posible iniciar sesión.",

        LOGIN_SUCCESS: "Inicio de sesión exitoso."

    }

});


/*=========================================================
    CONSTANTES DE LA APLICACIÓN
=========================================================*/

export const APP = Object.freeze({

    MAX_LOGIN_ATTEMPTS: 5,

    TOKEN_STORAGE_KEY: "sigc_token",

    SESSION_STORAGE_KEY: "sigc_session"

});