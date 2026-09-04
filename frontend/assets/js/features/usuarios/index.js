import { requireAuth } from "../../core/guard.js";

import { registerEvents } from "./events.js";

function initialize() {

    if (!requireAuth()) {

        return;

    }

    registerEvents();

}

document.addEventListener("DOMContentLoaded", initialize);