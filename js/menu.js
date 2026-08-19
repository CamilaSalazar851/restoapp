// menu.js
// Todo lo relacionado con los platos: leerlos de Firebase y crear nuevos.
// No toca el DOM: solo devuelve datos u lanza errores con mensajes claros.

import { obtenerDatos, guardarDatos, actualizarDatos, eliminarDatos, suscribirseADatos } from "./firebase.js";

const NODO_MENU = "menu";

// Firebase puede devolver el nodo "menu" como arreglo o como objeto,
// dependiendo de cómo se hayan creado las claves. Esta función normaliza
// ambos casos a una lista de platos con la misma forma.
function normalizarMenu(datos) {
    const platos = [];

    if (datos === null) {
        return platos; // Nodo vacío
    }

    if (Array.isArray(datos)) {
        datos.forEach((item, indice) => {
            if (!item) return;
            const id = item.id ?? indice;
            platos.push({
                id,
                nombre: item.name || item.nombre || `Plato ${id}`,
                precio: Number(item.price ?? item.precio ?? 0)
            });
        });
    } else if (datos && typeof datos === "object") {
        Object.keys(datos).forEach((clave) => {
            const item = datos[clave] || {};
            platos.push({
                id: clave,
                nombre: item.name || item.nombre || clave,
                precio: Number(item.price ?? item.precio ?? 0)
            });
        });
    }

    return platos;
}

/**
 * Obtiene la lista actual de platos del menú
 * @returns {Promise<Array>} Array de platos {id, nombre, precio}
 */
async function obtenerMenu() {
    const datos = await obtenerDatos(NODO_MENU);
    return normalizarMenu(datos);
}

/**
 * Crea un nuevo plato en el menú (genera ID automático)
 * @param {string} nombre - Nombre del plato
 * @param {number} precio - Precio del plato
 * @returns {Promise<string>} ID del nuevo plato
 */
async function crearProducto(nombre, precio) {
    const nombreLimpio = (nombre || "").trim();

    if (nombreLimpio === "") {
        throw new Error("Debes ingresar el nombre del producto.");
    }
    if (!Number.isFinite(precio) || precio <= 0) {
        throw new Error("El precio debe ser un número mayor que cero.");
    }

    const respuesta = await guardarDatos(NODO_MENU, { 
        name: nombreLimpio, 
        price: precio,
        createdAt: new Date().toISOString()
    });
    
    // Firebase devuelve {name: "idGenerado"} al hacer POST
    return respuesta.name;
}

/**
 * Actualiza un plato existente
 * @param {string} idPlato - ID del plato
 * @param {Object} cambios - {nombre?, precio?} cambios a aplicar
 * @returns {Promise<void>}
 */
async function actualizarProducto(idPlato, cambios) {
    const datosActualizacion = {};

    if (cambios.nombre !== undefined) {
        const nombreLimpio = (cambios.nombre || "").trim();
        if (nombreLimpio === "") {
            throw new Error("El nombre del producto no puede estar vacío.");
        }
        datosActualizacion.name = nombreLimpio;
    }

    if (cambios.precio !== undefined) {
        if (!Number.isFinite(cambios.precio) || cambios.precio <= 0) {
            throw new Error("El precio debe ser un número mayor que cero.");
        }
        datosActualizacion.price = cambios.precio;
    }

    if (Object.keys(datosActualizacion).length === 0) {
        throw new Error("No hay cambios para actualizar.");
    }

    datosActualizacion.updatedAt = new Date().toISOString();
    
    await actualizarDatos(`${NODO_MENU}/${idPlato}`, datosActualizacion);
}

/**
 * Elimina un plato del menú
 * @param {string} idPlato - ID del plato
 * @returns {Promise<void>}
 */
async function eliminarProducto(idPlato) {
    if (!idPlato || idPlato.trim() === "") {
        throw new Error("ID de plato inválido.");
    }
    await eliminarDatos(`${NODO_MENU}/${idPlato}`);
}

/**
 * Se suscribe a cambios en el menú (en tiempo real)
 * @param {function} callback - Llamada con array de platos cuando hay cambios
 * @param {number} intervalo - Milisegundos entre consultas (default: 2000)
 * @returns {function} Función para desuscribirse
 */
function suscribirseAlMenu(callback, intervalo = 2000) {
    return suscribirseADatos(NODO_MENU, (datos) => {
        const platos = normalizarMenu(datos);
        callback(platos);
    }, intervalo);
}

export { 
    obtenerMenu, 
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    suscribirseAlMenu
};