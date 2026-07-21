import loginState from "./state.js";

import { MESSAGES } from "../../core/constants.js";

import { login } from "./api.js";

import { saveSession } from "../../core/auth.js";

import { getFormElements, getFormData } from "./utils.js";

import Loader from "../../components/loader/loader.js";

import { showError } from "./render/messages.js";

function togglePassword() {

    const elements = getFormElements();

    const isPassword = elements.password.type === "password";

    elements.password.type = isPassword ? "text" : "password";

    const icon = elements.togglePassword.querySelector("[data-lucide]");

    if (icon) {

        icon.setAttribute(

            "data-lucide",

            isPassword ? "eye-off" : "eye"

        );

        lucide.createIcons();

    }

}

function validateForm(data) {

    if (!data.email) {

        showError(MESSAGES.LOGIN.EMAIL_REQUIRED);

        return false;

    }

    if (!data.password) {

        showError(MESSAGES.LOGIN.PASSWORD_REQUIRED);

        return false;

    }

    return true;

}

async function handleSubmit(event) {

    event.preventDefault();

    if (loginState.loading) {

        return;

    }

    if (loginState.attempts >= loginState.maxAttempts) {

        showError("Demasiados intentos fallidos. Recargue la página e intente de nuevo.");

        return;

    }

    const data = getFormData();

    if (!validateForm(data)) {

        return;

    }

    const elements = getFormElements();

    loginState.loading = true;

    Loader.show(elements.submit, "Ingresando...");

    try {

        const response = await login(data);

        saveSession(response.usuario, response.token);

        loginState.authenticated = true;

        loginState.user = response.usuario;

        loginState.attempts = 0;

        window.location.replace("../dashboard/dashboard.html");

    }

    catch (error) {

        console.error(error);

        loginState.attempts += 1;

        const message = error?.status === 422 || error?.status === 401

            ? MESSAGES.LOGIN.INVALID_CREDENTIALS

            : MESSAGES.LOGIN.LOGIN_ERROR;

        showError(message);

    }

    finally {

        loginState.loading = false;

        Loader.hide(elements.submit);

    }

}

export function registerEvents() {

    const elements = getFormElements();

    elements.togglePassword.addEventListener(

        "click",

        togglePassword

    );

    elements.form.addEventListener(

        "submit",

        handleSubmit

    );

}
