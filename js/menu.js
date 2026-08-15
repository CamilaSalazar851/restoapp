// menu.js
// Todo lo relacionado con los platos: leerlos de Firebase y crear nuevos.
// No toca el DOM: solo devuelve datos u lanza errores con mensajes claros.

import { obtenerDatos, guardarDatos } from "./firebase.js";

const NODO_MENU = "menu";

// Firebase puede devolver el nodo "menu" como arreglo o como objeto,
// dependiendo de cómo se hayan creado las claves. Esta función normaliza
// ambos casos a una lista de platos con la misma forma.
function normalizarMenu(datos) {
    const platos = [];

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

async function obtenerMenu() {
    const datos = await obtenerDatos(NODO_MENU);
    return normalizarMenu(datos);
}

async function crearProducto(nombre, precio) {
    const nombreLimpio = (nombre || "").trim();

    if (nombreLimpio === "") {
        throw new Error("Debes ingresar el nombre del producto.");
    }
    if (!Number.isFinite(precio) || precio <= 0) {
        throw new Error("El precio debe ser un número mayor que cero.");
    }

    return guardarDatos(NODO_MENU, { name: nombreLimpio, price: precio });
}

export { obtenerMenu, crearProducto };
