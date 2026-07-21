/**
 * ==========================================
 * Referencias del formulario
 * ==========================================
 */

const elements = {

    form: document.getElementById("loginForm"),

    email: document.getElementById("email"),

    password: document.getElementById("password"),

    remember: document.getElementById("remember"),

    togglePassword: document.getElementById("togglePassword"),

    submit: document.getElementById("btnLogin")

};

/**
 * ==========================================
 * Obtener elementos del formulario
 * ==========================================
 */

export function getFormElements() {

    return elements;

}

/**
 * ==========================================
 * Obtener datos del formulario
 * ==========================================
 */

export function getFormData() {

    return {

        email: elements.email.value.trim(),

        password: elements.password.value,

        remember: elements.remember.checked

    };

}

/**
 * ==========================================
 * Limpiar formulario
 * ==========================================
 */

export function clearForm() {

    elements.form.reset();

}

/**
 * ==========================================
 * Enfocar correo
 * ==========================================
 */

export function focusEmail() {

    elements.email.focus();

}