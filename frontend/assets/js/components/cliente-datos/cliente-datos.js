/**
 * ==========================================
 * Componente: datos del cliente para contratos
 * Todo contrato debe llevar la información
 * completa del cliente. Este bloque se monta
 * dentro de cualquier formulario de contrato.
 *
 * Uso:
 *   montarDatosCliente("contenedorId", "prefijo", cliente);   // cliente es opcional (para precargar)
 *   const datos = leerDatosCliente("prefijo");                // { cedula, telefono, correo, direccion }
 * ==========================================
 */

function escaparAtributo(texto) {

    return String(texto ?? "")
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;");

}

function escaparTexto(texto) {

    const div = document.createElement("div");

    div.textContent = String(texto ?? "");

    return div.innerHTML;

}

export function montarDatosCliente(contenedorId, prefijo, cliente = null) {

    const contenedor = document.getElementById(contenedorId);

    if (!contenedor) {

        return;

    }

    contenedor.innerHTML = `

        <div class="border rounded p-3 mb-3">

            <div class="fw-bold small mb-3">Datos del cliente${cliente?.nombre ? ` · ${escaparTexto(cliente.nombre)}` : ""}</div>

            <div class="mb-3">
                <label for="${prefijo}Cedula" class="form-label">Cédula</label>

                <div class="mb-2 d-flex gap-3">
                    <div class="form-check">
                        <input type="radio" class="form-check-input" id="${prefijo}TipoFisica" name="${prefijo}TipoCedula" value="fisica" checked>
                        <label class="form-check-label" for="${prefijo}TipoFisica">Física</label>
                    </div>
                    <div class="form-check">
                        <input type="radio" class="form-check-input" id="${prefijo}TipoJuridica" name="${prefijo}TipoCedula" value="juridica">
                        <label class="form-check-label" for="${prefijo}TipoJuridica">Jurídica</label>
                    </div>
                </div>

                <input type="text" id="${prefijo}Cedula" class="form-control" placeholder="Ej. 1-2222-3333" maxlength="30" required value="${escaparAtributo(cliente?.cedula)}">
            </div>

            <div class="mb-3">
                <label for="${prefijo}Telefono" class="form-label">Teléfono</label>
                <input type="text" id="${prefijo}Telefono" class="form-control" maxlength="30" required value="${escaparAtributo(cliente?.telefono)}">
            </div>

            <div class="mb-3">
                <label for="${prefijo}Correo" class="form-label">Correo</label>
                <input type="email" id="${prefijo}Correo" class="form-control" maxlength="150" required value="${escaparAtributo(cliente?.correo)}">
            </div>

            <div class="mb-0">
                <label for="${prefijo}Direccion" class="form-label">Dirección</label>
                <input type="text" id="${prefijo}Direccion" class="form-control" maxlength="255" required value="${escaparAtributo(cliente?.direccion)}">
            </div>

        </div>

    `;

    contenedor.querySelectorAll(`input[name="${prefijo}TipoCedula"]`).forEach((radio) => {

        radio.addEventListener("change", () => {

            document.getElementById(`${prefijo}Cedula`).placeholder = radio.value === "juridica"
                ? "Ej. 3-101-123456"
                : "Ej. 1-2222-3333";

        });

    });

}

export function leerDatosCliente(prefijo) {

    const valor = (sufijo) => document.getElementById(`${prefijo}${sufijo}`)?.value.trim() ?? "";

    return {

        cedula: valor("Cedula"),

        telefono: valor("Telefono"),

        correo: valor("Correo"),

        direccion: valor("Direccion")

    };

}

/**
 * Devuelve el primer mensaje de error de validación del servidor,
 * o el mensaje general si no hay detalle.
 */
export function mensajeDeError(error, porDefecto) {

    const errores = error?.data?.errors;

    if (errores) {

        const todos = Object.values(errores).flat().join(" ");

        if (todos) {

            return todos;

        }

    }

    return error?.data?.message || error?.message || porDefecto;

}
