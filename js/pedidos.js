// pedidos.js
// Gestión de pedidos: crear, listar, actualizar estado, eliminar.
// Conexión completa con Firebase Realtime Database.

import { obtenerDatos, guardarDatos, actualizarDatos, eliminarDatos, suscribirseADatos } from "./firebase.js";

const NODO_PEDIDOS = "pedidos";
const IVA = 0.19;

/**
 * Normaliza datos de pedidos (pueden venir como array u objeto)
 * @param {any} datos - Datos crudos de Firebase
 * @returns {Array} Array de pedidos normalizados
 */
function normalizarPedidos(datos) {
    const pedidos = [];

    if (datos === null) {
        return pedidos;
    }

    if (Array.isArray(datos)) {
        datos.forEach((item, indice) => {
            if (!item) return;
            pedidos.push({
                id: item.id ?? indice,
                mesa: item.mesa || `Mesa ${indice + 1}`,
                platos: item.platos || [],
                total: item.total || 0,
                estado: item.estado || "pendiente", // pendiente, en-preparacion, listo, entregado
                createdAt: item.createdAt || new Date().toISOString(),
                notas: item.notas || ""
            });
        });
    } else if (datos && typeof datos === "object") {
        Object.keys(datos).forEach((clave) => {
            const item = datos[clave] || {};
            pedidos.push({
                id: clave,
                mesa: item.mesa || "Sin mesa",
                platos: item.platos || [],
                total: item.total || 0,
                estado: item.estado || "pendiente",
                createdAt: item.createdAt || new Date().toISOString(),
                notas: item.notas || ""
            });
        });
    }

    return pedidos;
}

/**
 * Calcula un pedido individual (para cada plato)
 */
function calcularPedido(platoId, cantidad, precioUnitario) {
    if (!platoId) {
        throw new Error("Debes seleccionar un plato.");
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
        throw new Error("La cantidad debe ser un número mayor que cero.");
    }
    if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
        throw new Error("El precio unitario no es válido.");
    }

    const subtotal = cantidad * precioUnitario;
    const impuesto = subtotal * IVA;
    const total = subtotal + impuesto;

    return { platoId, cantidad, precioUnitario, subtotal, impuesto, total };
}

/**
 * Formatea un pedido para mostrar
 */
function formatearPedido(pedido) {
    return `Pedido: ${pedido.platoId} | Subtotal: $${pedido.subtotal.toFixed(2)} | `
        + `IVA: $${pedido.impuesto.toFixed(2)} | Total: $${pedido.total.toFixed(2)}`;
}

/**
 * Obtiene lista de todos los pedidos
 * @returns {Promise<Array>} Array de pedidos
 */
async function obtenerPedidos() {
    const datos = await obtenerDatos(NODO_PEDIDOS);
    return normalizarPedidos(datos);
}

/**
 * Obtiene un pedido específico por ID
 * @param {string} idPedido - ID del pedido
 * @returns {Promise<Object>} Objeto del pedido
 */
async function obtenerPedido(idPedido) {
    if (!idPedido || idPedido.trim() === "") {
        throw new Error("ID de pedido inválido.");
    }
    
    const datos = await obtenerDatos(`${NODO_PEDIDOS}/${idPedido}`);
    
    if (!datos) {
        throw new Error(`No se encontró el pedido con ID: ${idPedido}`);
    }

    return {
        id: idPedido,
        mesa: datos.mesa || "Sin mesa",
        platos: datos.platos || [],
        total: datos.total || 0,
        estado: datos.estado || "pendiente",
        createdAt: datos.createdAt || new Date().toISOString(),
        notas: datos.notas || ""
    };
}

/**
 * Crea un nuevo pedido
 * @param {Object} datosPedido - {mesa, platos, notas?}
 *        platos debe ser array de {id, nombre, precio, cantidad}
 * @returns {Promise<string>} ID del nuevo pedido
 */
async function crearPedido(datosPedido) {
    const { mesa, platos, notas } = datosPedido;

    // Validaciones
    if (!mesa || mesa.trim() === "") {
        throw new Error("Debes especificar la mesa.");
    }

    if (!Array.isArray(platos) || platos.length === 0) {
        throw new Error("El pedido debe contener al menos un plato.");
    }

    // Validar cada plato
    platos.forEach((plato, idx) => {
        if (!plato.id || !plato.nombre || !Number.isFinite(plato.precio) || !Number.isFinite(plato.cantidad)) {
            throw new Error(`Plato ${idx + 1}: datos incompletos o inválidos.`);
        }
        if (plato.cantidad <= 0) {
            throw new Error(`Plato ${idx + 1}: cantidad debe ser mayor a cero.`);
        }
    });

    // Calcular total (sin IVA por ahora, pero disponible)
    const total = platos.reduce((sum, plato) => sum + (plato.precio * plato.cantidad), 0);

    const nuevoPedido = {
        mesa: mesa.trim(),
        platos,
        total,
        estado: "pendiente",
        createdAt: new Date().toISOString(),
        notas: (notas || "").trim()
    };

    const respuesta = await guardarDatos(NODO_PEDIDOS, nuevoPedido);
    return respuesta.name; // ID generado
}

/**
 * Actualiza el estado de un pedido
 * @param {string} idPedido - ID del pedido
 * @param {string} nuevoEstado - pendiente | en-preparacion | listo | entregado | cancelado
 * @returns {Promise<void>}
 */
async function actualizarEstadoPedido(idPedido, nuevoEstado) {
    const estadosValidos = ["pendiente", "en-preparacion", "listo", "entregado", "cancelado"];

    if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error(`Estado no válido. Opciones: ${estadosValidos.join(", ")}`);
    }

    await actualizarDatos(`${NODO_PEDIDOS}/${idPedido}`, {
        estado: nuevoEstado,
        updatedAt: new Date().toISOString()
    });
}

/**
 * Actualiza notas de un pedido
 * @param {string} idPedido - ID del pedido
 * @param {string} notas - Nuevas notas
 * @returns {Promise<void>}
 */
async function actualizarNotasPedido(idPedido, notas) {
    await actualizarDatos(`${NODO_PEDIDOS}/${idPedido}`, {
        notas: (notas || "").trim(),
        updatedAt: new Date().toISOString()
    });
}

/**
 * Elimina un pedido completamente
 * @param {string} idPedido - ID del pedido
 * @returns {Promise<void>}
 */
async function eliminarPedido(idPedido) {
    if (!idPedido || idPedido.trim() === "") {
        throw new Error("ID de pedido inválido.");
    }
    await eliminarDatos(`${NODO_PEDIDOS}/${idPedido}`);
}

/**
 * Se suscribe a cambios en los pedidos (en tiempo real)
 * @param {function} callback - Llamada con array de pedidos cuando hay cambios
 * @param {number} intervalo - Milisegundos entre consultas (default: 1000, más rápido para pedidos)
 * @returns {function} Función para desuscribirse
 */
function suscribirse(callback, intervalo = 1000) {
    return suscribirseADatos(NODO_PEDIDOS, (datos) => {
        const pedidos = normalizarPedidos(datos);
        callback(pedidos);
    }, intervalo);
}

export { 
    // Cálculos locales (sin persistencia)
    calcularPedido,
    formatearPedido,
    IVA,
    
    // Operaciones con Firebase
    obtenerPedidos,
    obtenerPedido,
    crearPedido,
    actualizarEstadoPedido,
    actualizarNotasPedido,
    eliminarPedido,
    suscribirse
};
