// database.js
// Utilidades generales de base de datos y almacenamiento local.
// Manejo de caché y sincronización.

/**
 * Cache local para evitar consultas repetidas
 */
const cache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene datos del caché si están disponibles y no han expirado
 * @param {string} clave - Clave del caché
 * @returns {any|null} Datos cacheados o null si no existen/expiraron
 */
function obtenerDelCache(clave) {
    if (!cache.has(clave)) return null;

    const { data, expiry } = cache.get(clave);
    if (Date.now() > expiry) {
        cache.delete(clave);
        return null;
    }

    return data;
}

/**
 * Guarda datos en caché local
 * @param {string} clave - Clave del caché
 * @param {any} data - Datos a cachear
 * @param {number} ttl - Tiempo de vida en milisegundos (default: 5 min)
 */
function guardarEnCache(clave, data, ttl = CACHE_EXPIRY) {
    cache.set(clave, {
        data,
        expiry: Date.now() + ttl
    });
}

/**
 * Limpia una entrada del caché
 * @param {string} clave - Clave a limpiar
 */
function limpiarCache(clave) {
    cache.delete(clave);
}

/**
 * Limpia todo el caché
 */
function limpiarTodoCache() {
    cache.clear();
}

/**
 * Usa localStorage para persistencia local (más allá de la sesión)
 * @param {string} clave - Clave del localStorage
 * @returns {any|null} Datos guardados o null
 */
function obtenerDelLocalStorage(clave) {
    try {
        const datos = localStorage.getItem(clave);
        return datos ? JSON.parse(datos) : null;
    } catch (error) {
        console.error(`Error leyendo localStorage["${clave}"]:`, error);
        return null;
    }
}

/**
 * Guarda datos en localStorage
 * @param {string} clave - Clave del localStorage
 * @param {any} datos - Datos a guardar
 */
function guardarEnLocalStorage(clave, datos) {
    try {
        localStorage.setItem(clave, JSON.stringify(datos));
    } catch (error) {
        console.error(`Error guardando en localStorage["${clave}"]:`, error);
    }
}

/**
 * Limpia una entrada del localStorage
 * @param {string} clave - Clave a limpiar
 */
function limpiarLocalStorage(clave) {
    try {
        localStorage.removeItem(clave);
    } catch (error) {
        console.error(`Error limpiando localStorage["${clave}"]:`, error);
    }
}

/**
 * Limpia todo el localStorage de la app (cuidado: destructivo)
 */
function limpiarTodoLocalStorage() {
    try {
        // Solo limpiar claves que empiezan con "restoapp_"
        const clavesParaLimpiar = [];
        for (let i = 0; i < localStorage.length; i++) {
            const clave = localStorage.key(i);
            if (clave && clave.startsWith("restoapp_")) {
                clavesParaLimpiar.push(clave);
            }
        }
        clavesParaLimpiar.forEach(clave => localStorage.removeItem(clave));
    } catch (error) {
        console.error("Error limpiando localStorage:", error);
    }
}

/**
 * Obtiene datos con estrategia: caché → localStorage → null
 * Útil para guardar sesiones o datos críticos offline
 * @param {string} clave - Clave a buscar
 * @returns {any|null} Datos encontrados o null
 */
function obtenerConFallback(clave) {
    // Intentar caché primero
    let datos = obtenerDelCache(clave);
    if (datos !== null) return datos;

    // Luego localStorage
    datos = obtenerDelLocalStorage(clave);
    if (datos !== null) {
        // Repoblar caché para rápido acceso
        guardarEnCache(clave, datos);
    }

    return datos;
}

/**
 * Guarda datos tanto en caché como en localStorage
 * @param {string} clave - Clave a guardar
 * @param {any} datos - Datos a guardar
 * @param {number} ttlCache - TTL del caché en ms
 */
function guardarEnAmbos(clave, datos, ttlCache = CACHE_EXPIRY) {
    guardarEnCache(clave, datos, ttlCache);
    guardarEnLocalStorage(clave, datos);
}

export {
    // Caché
    obtenerDelCache,
    guardarEnCache,
    limpiarCache,
    limpiarTodoCache,
    
    // LocalStorage
    obtenerDelLocalStorage,
    guardarEnLocalStorage,
    limpiarLocalStorage,
    limpiarTodoLocalStorage,
    
    // Combinadas
    obtenerConFallback,
    guardarEnAmbos,
    
    // Constantes
    CACHE_EXPIRY
};
