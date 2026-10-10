/**
 * ==========================================
 * Componente de confirmación
 * Reemplaza a window.confirm() con un modal
 * propio, con el mismo estilo del sistema.
 *
 * Uso:
 *   const ok = await confirmarAccion({
 *       titulo: "Archivar valla",
 *       mensaje: "¿Archivar esta valla? Pasará a estado Inactiva.",
 *       textoConfirmar: "Archivar",
 *       peligro: true
 *   });
 * ==========================================
 */

const ESTILO_ID = "sigc-confirm-style";

const CSS = `
.sigc-confirm-overlay {
    position: fixed; inset: 0; z-index: 2000;
    background: rgba(0, 0, 0, .5);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: sigcConfirmFade .15s ease;
}
.sigc-confirm {
    width: 100%; max-width: 420px;
    background: #fff; color: #23252B;
    border-radius: 12px; overflow: hidden;
    box-shadow: 0 12px 40px rgba(0, 0, 0, .3);
    animation: sigcConfirmIn .18s ease;
    font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
}
.sigc-confirm__header {
    padding: 14px 18px;
    background: linear-gradient(135deg, #B5171C, #E31E24);
    color: #fff; font-weight: 700; font-size: 1rem;
}
.sigc-confirm__body { padding: 18px; font-size: .92rem; line-height: 1.45; }
.sigc-confirm__footer {
    display: flex; justify-content: flex-end; gap: 10px;
    padding: 12px 18px; border-top: 1px solid #E4E6EB;
}
.sigc-confirm__btn {
    border: 1px solid #E4E6EB; background: #fff; color: #23252B;
    font-size: .88rem; font-weight: 600; border-radius: 8px;
    padding: 9px 16px; cursor: pointer;
}
.sigc-confirm__btn--ok { background: #E31E24; border-color: #E31E24; color: #fff; }
.sigc-confirm__btn--ok:hover { background: #B5171C; border-color: #B5171C; }
.sigc-confirm__btn:focus-visible { outline: 2px solid #E31E24; outline-offset: 2px; }
[data-theme="dark"] .sigc-confirm { background: #1E2027; color: #E7E8EC; }
[data-theme="dark"] .sigc-confirm__footer { border-top-color: #2A2C33; }
[data-theme="dark"] .sigc-confirm__btn:not(.sigc-confirm__btn--ok) { background: #22242B; color: #E7E8EC; border-color: #2A2C33; }
@keyframes sigcConfirmFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes sigcConfirmIn { from { opacity: 0; transform: translateY(8px) scale(.98); } to { opacity: 1; transform: none; } }
`;

function inyectarEstilo() {

    if (document.getElementById(ESTILO_ID)) {

        return;

    }

    const estilo = document.createElement("style");

    estilo.id = ESTILO_ID;

    estilo.textContent = CSS;

    document.head.appendChild(estilo);

}

function escaparHtml(texto) {

    const div = document.createElement("div");

    div.textContent = texto;

    return div.innerHTML;

}

/**
 * @param {Object} opciones
 * @param {string} [opciones.titulo]
 * @param {string} opciones.mensaje
 * @param {string} [opciones.textoConfirmar]
 * @param {string} [opciones.textoCancelar]
 * @returns {Promise<boolean>} true si el usuario confirma
 */
export function confirmarAccion({

    titulo = "Confirmar",

    mensaje = "",

    textoConfirmar = "Aceptar",

    textoCancelar = "Cancelar"

} = {}) {

    inyectarEstilo();

    return new Promise((resolve) => {

        const overlay = document.createElement("div");

        overlay.className = "sigc-confirm-overlay";

        overlay.innerHTML = `
            <div class="sigc-confirm" role="alertdialog" aria-modal="true">
                <div class="sigc-confirm__header">${escaparHtml(titulo)}</div>
                <div class="sigc-confirm__body">${escaparHtml(mensaje)}</div>
                <div class="sigc-confirm__footer">
                    <button type="button" class="sigc-confirm__btn" data-accion="cancelar">${escaparHtml(textoCancelar)}</button>
                    <button type="button" class="sigc-confirm__btn sigc-confirm__btn--ok" data-accion="aceptar">${escaparHtml(textoConfirmar)}</button>
                </div>
            </div>
        `;

        function cerrar(resultado) {

            document.removeEventListener("keydown", alTeclear, true);

            overlay.remove();

            resolve(resultado);

        }

        function alTeclear(evento) {

            if (evento.key === "Escape") {

                evento.preventDefault();

                evento.stopPropagation();

                cerrar(false);

            }

        }

        overlay.addEventListener("click", (evento) => {

            if (evento.target === overlay) {

                cerrar(false);

                return;

            }

            const boton = evento.target.closest("[data-accion]");

            if (boton) {

                cerrar(boton.dataset.accion === "aceptar");

            }

        });

        document.addEventListener("keydown", alTeclear, true);

        document.body.appendChild(overlay);

        overlay.querySelector('[data-accion="aceptar"]').focus();

    });

}
