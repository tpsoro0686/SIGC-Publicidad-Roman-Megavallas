/*=========================================================
    CONFIGURACIÓN GENERAL
=========================================================*/

// En tu computadora/red local la API corre en el puerto 8000.
// En el servidor real la API vive en https://api.romanmegavallas.com
const ES_LOCAL = /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(window.location.hostname);

const API_URL = window.SIGC_API_URL
    || (ES_LOCAL ? `http://${window.location.hostname}:8000/api` : "https://api.romanmegavallas.com/api");

const AppConfig = Object.freeze({

    app:{

        name:"SIGC",

        version:"1.0.0"

    },

    api:{

        baseUrl:API_URL,

        timeout:10000

    },

    localization:{

        language:"es",

        currency:"USD"

    }

});

export default AppConfig;
