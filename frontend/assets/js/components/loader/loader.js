/**
 * ==========================================
 * Componente Loader
 * ==========================================
 */

class Loader {

    /**
     * Muestra el loader en un botón.
     * @param {HTMLButtonElement} button
     * @param {string} text
     */
    show(button, text = "Procesando...") {

        if (!button) return;

        button.disabled = true;

        button.dataset.originalContent = button.innerHTML;

        button.innerHTML = `
            <i data-lucide="loader-circle"></i>
            ${text}
        `;

        lucide.createIcons();

    }

    /**
     * Restaura el botón.
     * @param {HTMLButtonElement} button
     */
    hide(button) {

        if (!button) return;

        button.disabled = false;

        if (button.dataset.originalContent) {

            button.innerHTML = button.dataset.originalContent;

        }

        lucide.createIcons();

    }

}

export default new Loader();