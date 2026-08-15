// ui.js
// Funciones reutilizables para mostrar mensajes, estados de carga
// y manipulación común de la interfaz. No contiene lógica de negocio
// ni llamadas a Firebase.

function mostrarMensaje(idElemento, texto, tipo = "info") {
    const el = document.getElementById(idElemento);
    if (!el) return;
    el.textContent = texto;
    el.dataset.tipo = tipo;
}

function limpiarMensaje(idElemento) {
    mostrarMensaje(idElemento, "");
}

function mostrarCargando(idElemento, texto = "Cargando...") {
    const el = document.getElementById(idElemento);
    if (el) el.textContent = texto;
}

function limpiarFormulario(...ids) {
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function mostrar(idElemento) {
    const el = document.getElementById(idElemento);
    if (el) el.style.display = "";
}

function ocultar(idElemento) {
    const el = document.getElementById(idElemento);
    if (el) el.style.display = "none";
}

export { mostrarMensaje, limpiarMensaje, mostrarCargando, limpiarFormulario, mostrar, ocultar };
