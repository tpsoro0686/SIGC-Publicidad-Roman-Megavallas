/*=========================================================
    SIGC v1.0
    APLICACIÓN PRINCIPAL
=========================================================*/

import AppConfig from "./config.js";

document.addEventListener("DOMContentLoaded", iniciarAplicacion);

function iniciarAplicacion(){

    console.log(`${AppConfig.app.name} v${AppConfig.app.version} iniciado.`);

}