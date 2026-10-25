/**
 * Portal de clientes: punto de entrada.
 * Coordina el mapa, los filtros, el panel lateral y la solicitud.
 */

import estado, { guardarLista, guardarPresupuesto } from "./state.js";

import * as api from "./api.js";

import * as mapa from "./map.js";

import * as vistas from "./views.js";

import { pintarIconosEstaticos } from "./icons.js";

import { normalizar, esAhora, plural } from "./format.js";

const LIMITE_FILAS = 80;

const panel = document.getElementById("panel");

const contenido = document.getElementById("panelContenido");

const botonMiLista = document.getElementById("btnMiLista");

const campoBusqueda = document.getElementById("campoBusqueda");

let temporizadorListado = null;

let temporizadorToast = null;

/* =========================================================
   Datos derivados
========================================================= */

function vallaPorId(id) {

    return estado.vallas.find((valla) => valla.id === id) ?? null;

}

function vallasFiltradas() {

    const { provinciaId, disponibilidad, busqueda } = estado.filtros;

    const termino = normalizar(busqueda);

    return estado.vallas.filter((valla) => {

        if (provinciaId && String(valla.provincia?.id) !== String(provinciaId)) {

            return false;

        }

        if (disponibilidad === "ahora" && !esAhora(valla)) {

            return false;

        }

        if (disponibilidad === "proximamente" && esAhora(valla)) {

            return false;

        }

        if (termino) {

            const texto = normalizar(`${valla.codigo} ${valla.referencia} ${valla.provincia?.nombre ?? ""}`);

            if (!texto.includes(termino)) {

                return false;

            }

        }

        return true;

    });

}

// Primero las disponibles ahora; luego las que se liberan antes; luego por código
function comparar(a, b) {

    if (esAhora(a) !== esAhora(b)) {

        return esAhora(a) ? -1 : 1;

    }

    const fechaA = a.disponible_desde ?? "9999-12-31";

    const fechaB = b.disponible_desde ?? "9999-12-31";

    if (fechaA !== fechaB) {

        return fechaA < fechaB ? -1 : 1;

    }

    return a.codigo.localeCompare(b.codigo);

}

function hayFiltros() {

    const { provinciaId, disponibilidad, busqueda } = estado.filtros;

    return Boolean(provinciaId) || disponibilidad !== "todas" || Boolean(busqueda);

}

function vallasDeLaLista() {

    return estado.lista.map(vallaPorId).filter(Boolean);

}

/* =========================================================
   Render del panel
========================================================= */

function cabenMas(totales) {

    if (!estado.presupuesto) {

        return 0;

    }

    const resto = estado.presupuesto - totales.mensual;

    if (resto <= 0) {

        return 0;

    }

    return estado.vallas.filter((valla) => !estado.lista.includes(valla.id)
        && valla.precio_normal !== null
        && valla.precio_normal !== undefined
        && Number(valla.precio_normal) <= resto).length;

}

function renderPanel() {

    if (estado.cargando) {

        contenido.innerHTML = vistas.htmlCargando();

        return;

    }

    if (estado.errorCarga) {

        contenido.innerHTML = vistas.htmlError(estado.errorCarga);

        return;

    }

    if (estado.vista === "lista") {

        const filtradas = vallasFiltradas();

        const visibles = filtradas.filter(mapa.estaEnVista).sort(comparar);

        contenido.innerHTML = vistas.htmlLista({
            vallas: visibles.slice(0, LIMITE_FILAS),
            totalVisibles: visibles.length,
            totalFiltradas: filtradas.length,
            lista: estado.lista,
            hayFiltros: hayFiltros(),
            limite: LIMITE_FILAS
        });

        return;

    }

    if (estado.vista === "detalle") {

        const valla = estado.detalle ?? vallaPorId(estado.activaId);

        if (!valla) {

            irA("lista");

            return;

        }

        contenido.innerHTML = vistas.htmlDetalle(valla, estado.lista.includes(valla.id));

        iniciarGaleria();

        return;

    }

    if (estado.vista === "milista") {

        const vallasLista = vallasDeLaLista();

        const totales = vistas.calcularTotales(vallasLista);

        contenido.innerHTML = vistas.htmlMiLista({
            vallasLista,
            totales,
            presupuesto: estado.presupuesto,
            cabenMas: cabenMas(totales),
            borrador: estado.borrador,
            errores: estado.errores,
            errorGeneral: estado.errorGeneral,
            enviando: estado.enviando
        });

        return;

    }

    if (estado.vista === "enviado") {

        contenido.innerHTML = vistas.htmlEnviado(estado.codigoSolicitud, estado.pago, {
            apartado: estado.apartado,
            pagando: estado.pagando,
            mensaje: estado.pagoMensaje,
            simulado: Boolean(estado.pagoSimulado)
        });

    }

}

function iniciarGaleria() {

    const pista = document.getElementById("galeriaPista");

    const contador = document.getElementById("galeriaContador");

    if (!pista || !contador) {

        return;

    }

    pista.addEventListener("scroll", () => {

        const indice = Math.round(pista.scrollLeft / Math.max(pista.clientWidth, 1));

        contador.textContent = `${indice + 1} / ${pista.children.length}`;

    }, { passive: true });

}

function irA(vista, { tamano } = {}) {

    estado.vista = vista;

    if (tamano) {

        panel.dataset.tamano = tamano;

    }

    botonMiLista.setAttribute("aria-pressed", String(vista === "milista"));

    renderPanel();

    contenido.scrollTop = 0;

}

/* =========================================================
   Marcadores y lista
========================================================= */

function refrescarMarcador(id) {

    const valla = vallaPorId(id);

    if (valla) {

        mapa.actualizarMarcador(valla, {
            enLista: estado.lista.includes(id),
            activa: estado.activaId === id
        });

    }

}

function pintarContador() {

    const n = estado.lista.length;

    document.getElementById("contadorLista").textContent = n;

    botonMiLista.classList.toggle("tiene-items", n > 0);

    botonMiLista.setAttribute("aria-label", `Mi lista: ${n} ${plural(n, "valla", "vallas")}`);

}

function avisar(texto) {

    let toast = document.getElementById("toast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "toast";

        toast.className = "toast";

        toast.setAttribute("role", "status");

        document.body.appendChild(toast);

    }

    toast.textContent = texto;

    toast.classList.add("is-visible");

    clearTimeout(temporizadorToast);

    temporizadorToast = setTimeout(() => toast.classList.remove("is-visible"), 2200);

}

function alternarLista(id) {

    const valla = vallaPorId(id);

    if (!valla) {

        return;

    }

    const posicionGaleria = document.getElementById("galeriaPista")?.scrollLeft ?? 0;

    if (estado.lista.includes(id)) {

        estado.lista = estado.lista.filter((item) => item !== id);

        avisar(`Quitaste ${valla.codigo} de tu lista`);

    }

    else {

        estado.lista = [...estado.lista, id];

        avisar(`${valla.codigo} agregada a tu lista`);

    }

    guardarLista();

    pintarContador();

    refrescarMarcador(id);

    renderPanel();

    const pista = document.getElementById("galeriaPista");

    if (pista) {

        pista.scrollLeft = posicionGaleria;

    }

}

/* =========================================================
   Detalle de valla
========================================================= */

function abrirDetalle(id) {

    const valla = vallaPorId(id);

    if (!valla) {

        return;

    }

    const anterior = estado.activaId;

    estado.activaId = id;

    estado.detalle = valla;

    if (anterior && anterior !== id) {

        refrescarMarcador(anterior);

    }

    refrescarMarcador(id);

    irA("detalle", { tamano: "media" });

    mapa.enfocar(valla);

    // El listado trae una sola foto; aquí se piden todas
    api.obtenerValla(id)
        .then((completa) => {

            if (estado.activaId === id && estado.vista === "detalle") {

                estado.detalle = completa;

                renderPanel();

            }

        })
        .catch(() => {});

}

function cerrarDetalle() {

    const anterior = estado.activaId;

    estado.activaId = null;

    estado.detalle = null;

    if (anterior) {

        refrescarMarcador(anterior);

    }

    irA("lista", { tamano: "media" });

}

/* =========================================================
   Filtros y búsqueda
========================================================= */

function aplicarFiltros({ ajustar = false } = {}) {

    const filtradas = vallasFiltradas();

    mapa.mostrarVallas(filtradas, { lista: estado.lista, activaId: estado.activaId });

    document.getElementById("btnLimpiar").hidden = !hayFiltros();

    if (ajustar && filtradas.length) {

        mapa.ajustarA(filtradas);

    }

    if (estado.vista === "lista") {

        renderPanel();

    }

}

function limpiarFiltros() {

    estado.filtros = { provinciaId: "", disponibilidad: "todas", busqueda: "" };

    document.getElementById("filtroProvincia").value = "";

    campoBusqueda.value = "";

    sincronizarSegmentos();

    aplicarFiltros({ ajustar: true });

}

function sincronizarSegmentos() {

    document.querySelectorAll(".seg__op").forEach((boton) => {

        const activo = boton.dataset.disp === estado.filtros.disponibilidad;

        boton.classList.toggle("is-activo", activo);

        boton.setAttribute("aria-pressed", String(activo));

    });

}

async function buscarZona(evento) {

    evento.preventDefault();

    const texto = campoBusqueda.value.trim();

    if (!texto) {

        estado.filtros.busqueda = "";

        aplicarFiltros({ ajustar: true });

        return;

    }

    // 1. ¿Coincide con códigos, referencias o provincias de las vallas?
    estado.filtros.busqueda = texto;

    const coincidencias = vallasFiltradas();

    if (coincidencias.length) {

        aplicarFiltros({ ajustar: true });

        irA("lista", { tamano: "media" });

        return;

    }

    // 2. Si no, se busca como lugar (Escazú, Liberia, Paseo Colón...) y el mapa se mueve allá
    estado.filtros.busqueda = "";

    try {

        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=cr&q=${encodeURIComponent(texto)}`;

        const respuesta = await fetch(url, { headers: { Accept: "application/json" } });

        const resultados = await respuesta.json();

        if (resultados.length) {

            aplicarFiltros();

            mapa.volarA(Number(resultados[0].lat), Number(resultados[0].lon), 14);

            irA("lista", { tamano: "media" });

        }

        else {

            aplicarFiltros();

            avisar("No encontramos esa zona. Prueba con otra palabra.");

        }

    }

    catch {

        aplicarFiltros();

        avisar("No se pudo buscar la zona ahora. Inténtalo de nuevo.");

    }

}

function poblarProvincias() {

    const select = document.getElementById("filtroProvincia");

    select.innerHTML = "<option value=\"\">Toda Costa Rica</option>"
        + estado.provincias.map((p) => `<option value="${p.id}">${p.nombre}</option>`).join("");

}

/* =========================================================
   Solicitud
========================================================= */

function mapearErrores(data) {

    const resultado = {};

    Object.entries(data?.errors ?? {}).forEach(([clave, mensajes]) => {

        const campo = clave.startsWith("vallas") ? "vallas" : clave;

        if (!resultado[campo]) {

            resultado[campo] = Array.isArray(mensajes) ? mensajes[0] : String(mensajes);

        }

    });

    return resultado;

}

async function enviarSolicitud(formulario) {

    if (estado.enviando || !estado.lista.length) {

        return;

    }

    const b = estado.borrador;

    const datos = {

        nombre: b.nombre.trim(),

        empresa: b.empresa.trim() || null,

        telefono: b.telefono.trim(),

        correo: b.correo.trim(),

        mensaje: b.mensaje.trim() || null,

        fecha_inicio_deseada: b.fecha_inicio_deseada || null,

        plazo_meses_deseado: b.plazo_meses_deseado ? Number(b.plazo_meses_deseado) : null,

        vallas: estado.lista,

        sitio_web: formulario.elements.sitio_web?.value ?? ""

    };

    estado.enviando = true;

    estado.errores = {};

    estado.errorGeneral = "";

    renderPanel();

    try {

        const respuesta = await api.enviarSolicitud(datos);

        estado.codigoSolicitud = respuesta?.data?.codigo ?? "";

        estado.tokenSolicitud = respuesta?.data?.token ?? null;

        estado.apartado = {
            apartadas: respuesta?.data?.apartadas ?? [],
            enEspera: respuesta?.data?.en_espera ?? [],
            dias: respuesta?.data?.dias ?? 0
        };

        estado.pago = null;

        estado.pagoMensaje = "";

        estado.pagoSimulado = "";

        await cargarOpcionesPago();

        estado.lista = [];

        guardarLista();

        estado.borrador = { nombre: "", empresa: "", telefono: "", correo: "", fecha_inicio_deseada: "", plazo_meses_deseado: "", mensaje: "" };

        pintarContador();

        aplicarFiltros();

        estado.enviando = false;

        irA("enviado", { tamano: "media" });

    }

    catch (error) {

        estado.enviando = false;

        if (error.status === 422) {

            estado.errores = mapearErrores(error.data);

            estado.errorGeneral = error.data?.errors?.vallas?.[0] ?? "Revisa los campos marcados.";

        }

        else if (error.status === 429) {

            estado.errorGeneral = "Enviaste varias solicitudes seguidas. Espera unos minutos e inténtalo de nuevo.";

        }

        else {

            estado.errorGeneral = error.message || "No se pudo enviar la solicitud. Inténtalo de nuevo.";

        }

        renderPanel();

        contenido.scrollTop = contenido.scrollHeight;

    }

}

/* =========================================================
   Pagos en línea (solo aparecen si el backend los habilita)
========================================================= */

async function cargarOpcionesPago() {

    estado.pago = null;

    if (!estado.tokenSolicitud) {

        return;

    }

    try {

        const configuracion = await api.obtenerConfiguracion();

        if (configuracion?.pagos_habilitados) {

            estado.pago = await api.obtenerOpcionesPago(estado.tokenSolicitud);

        }

    }

    catch {

        // si falla, la pantalla se muestra sin opciones de pago

    }

}

async function iniciarPago(tipo) {

    if (estado.pagando || !estado.tokenSolicitud) {

        return;

    }

    estado.pagando = true;

    estado.pagoMensaje = "";

    renderPanel();

    try {

        const respuesta = await api.iniciarPago(estado.tokenSolicitud, tipo);

        // Se manda al cliente a la pasarela (o a la pantalla de prueba)
        window.location.href = respuesta.url_pago;

    }

    catch (error) {

        estado.pagando = false;

        estado.pagoMensaje = error.data?.errors?.tipo?.[0] || error.message || "No se pudo iniciar el pago.";

        renderPanel();

    }

}

async function simularPago(resultado) {

    if (estado.pagando) {

        return;

    }

    estado.pagando = true;

    renderPanel();

    try {

        await api.simularAviso(estado.pagoSimulado, resultado);

        estado.pagoSimulado = "";

        estado.pagoMensaje = "";

        await cargarOpcionesPago();

    }

    catch (error) {

        estado.pagoMensaje = error.message || "No se pudo registrar el resultado.";

    }

    estado.pagando = false;

    renderPanel();

}

// Al volver de la pasarela: ...portal/index.html?token=XXXX[&pago=simulado&ref=PAG-00001]
async function procesarRetornoPago() {

    const parametros = new URLSearchParams(window.location.search);

    const token = parametros.get("token");

    if (!token) {

        return false;

    }

    estado.tokenSolicitud = token;

    await cargarOpcionesPago();

    if (!estado.pago) {

        return false;

    }

    estado.codigoSolicitud = estado.pago.codigo;

    if (parametros.get("pago") === "simulado") {

        estado.pagoSimulado = parametros.get("ref") ?? "";

    }

    // Se limpia la dirección para que al recargar no se repita
    window.history.replaceState({}, "", window.location.pathname);

    irA("enviado", { tamano: "media" });

    return true;

}

function actualizarMedidor() {

    const contenedor = document.getElementById("medidor");

    if (!contenedor) {

        return;

    }

    const totales = vistas.calcularTotales(vallasDeLaLista());

    contenedor.innerHTML = vistas.htmlMedidor({
        totales,
        presupuesto: estado.presupuesto,
        cabenMas: cabenMas(totales),
        plazo: Number(estado.borrador.plazo_meses_deseado) || 0
    });

}

/* =========================================================
   Eventos
========================================================= */

function registrarEventos() {

    contenido.addEventListener("click", (evento) => {

        const elemento = evento.target.closest("[data-accion]");

        if (!elemento) {

            return;

        }

        const { accion, id } = elemento.dataset;

        if (accion === "abrir") {

            abrirDetalle(Number(id));

        }

        else if (accion === "alternar-lista") {

            alternarLista(Number(id));

        }

        else if (accion === "volver") {

            cerrarDetalle();

        }

        else if (accion === "ver-listado") {

            estado.activaId = null;

            irA("lista", { tamano: "media" });

        }

        else if (accion === "limpiar-filtros") {

            limpiarFiltros();

        }

        else if (accion === "ver-todas") {

            mapa.ajustarA(vallasFiltradas().length ? vallasFiltradas() : estado.vallas);

        }

        else if (accion === "pagar") {

            iniciarPago(elemento.dataset.tipo);

        }

        else if (accion === "simular-pago") {

            simularPago(elemento.dataset.estado);

        }

        else if (accion === "reintentar") {

            cargarDatos(true);

        }

        else if (accion === "galeria") {

            const pista = document.getElementById("galeriaPista");

            pista?.scrollBy({ left: Number(elemento.dataset.dir) * pista.clientWidth, behavior: "smooth" });

        }

    });

    contenido.addEventListener("input", (evento) => {

        const campo = evento.target.dataset?.campo;

        if (!campo) {

            return;

        }

        if (campo === "presupuesto") {

            estado.presupuesto = Math.max(0, Number(evento.target.value) || 0);

            guardarPresupuesto();

            actualizarMedidor();

            return;

        }

        estado.borrador[campo] = evento.target.value;

        // Al cambiar los meses se recalcula el total sin volver a dibujar todo el formulario
        if (campo === "plazo_meses_deseado") {

            actualizarMedidor();

        }

        if (estado.errores[campo]) {

            delete estado.errores[campo];

            evento.target.closest(".campo")?.classList.remove("campo--error");

            evento.target.closest(".campo")?.querySelector(".campo__error")?.remove();

        }

    });

    contenido.addEventListener("submit", (evento) => {

        if (evento.target.id === "formSolicitud") {

            evento.preventDefault();

            enviarSolicitud(evento.target);

        }

    });

    botonMiLista.addEventListener("click", () => {

        if (estado.vista === "milista") {

            irA("lista", { tamano: "media" });

        }

        else {

            irA("milista", { tamano: "alta" });

        }

    });

    document.getElementById("formBusqueda").addEventListener("submit", buscarZona);

    campoBusqueda.addEventListener("search", () => {

        if (!campoBusqueda.value && estado.filtros.busqueda) {

            estado.filtros.busqueda = "";

            aplicarFiltros({ ajustar: true });

        }

    });

    document.getElementById("filtroProvincia").addEventListener("change", (evento) => {

        estado.filtros.provinciaId = evento.target.value;

        aplicarFiltros({ ajustar: true });

    });

    document.querySelectorAll(".seg__op").forEach((boton) => {

        boton.addEventListener("click", () => {

            estado.filtros.disponibilidad = boton.dataset.disp;

            sincronizarSegmentos();

            aplicarFiltros({ ajustar: true });

        });

    });

    document.getElementById("btnLimpiar").addEventListener("click", limpiarFiltros);

    // Panel inferior en celulares: media -> alta -> baja -> media
    document.getElementById("panelAsa").addEventListener("click", () => {

        const siguiente = { media: "alta", alta: "baja", baja: "media" };

        panel.dataset.tamano = siguiente[panel.dataset.tamano] ?? "media";

    });

    document.addEventListener("keydown", (evento) => {

        if (evento.key === "Escape" && estado.vista === "detalle") {

            cerrarDetalle();

        }

    });

    window.addEventListener("resize", () => mapa.recalcularTamano());

}

/* =========================================================
   Arranque
========================================================= */

async function cargarDatos(reintento = false) {

    estado.cargando = true;

    estado.errorCarga = null;

    renderPanel();

    try {

        const [vallas, provincias] = await Promise.all([api.obtenerVallas({ forzar: reintento }), api.obtenerProvincias()]);

        estado.vallas = Array.isArray(vallas) ? vallas : (vallas?.data ?? []);

        estado.provincias = Array.isArray(provincias) ? provincias : (provincias?.data ?? []);

    }

    catch (error) {

        estado.errorCarga = error.message || "Inténtalo de nuevo en un momento.";

    }

    estado.cargando = false;

    // Si una valla de la lista guardada ya no está publicada, se saca
    estado.lista = estado.lista.filter((id) => vallaPorId(id));

    guardarLista();

    pintarContador();

    poblarProvincias();

    if (estado.errorCarga) {

        renderPanel();

        return;

    }

    aplicarFiltros({ ajustar: true });

    renderPanel();

    // Regreso desde la pasarela de pago
    if (await procesarRetornoPago()) {

        return;

    }

    // Enlace directo: ...portal/?valla=SJ-001
    const codigo = new URLSearchParams(window.location.search).get("valla");

    const compartida = codigo
        ? estado.vallas.find((v) => v.codigo.toLowerCase() === codigo.toLowerCase())
        : null;

    if (compartida) {

        abrirDetalle(compartida.id);

    }

}

function iniciar() {

    pintarIconosEstaticos();

    mapa.iniciarMapa("mapa", {

        alElegir: (id) => abrirDetalle(id),

        alMover: () => {

            clearTimeout(temporizadorListado);

            temporizadorListado = setTimeout(() => {

                if (!estado.cargando && estado.vista === "lista") {

                    renderPanel();

                }

            }, 120);

        }

    });

    registrarEventos();

    pintarContador();

    cargarDatos();

}

iniciar();
