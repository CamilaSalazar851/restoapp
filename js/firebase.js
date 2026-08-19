// firebase.js
// Punto único de conexión con Firebase Realtime Database.
// Ningún otro archivo debe construir URLs de Firebase directamente:
// todos importan las funciones de este módulo.

const FIREBASE_DB_URL = "https://restos-pop-default-rtdb.firebaseio.com/";

/**
 * Obtiene datos de un nodo específico de Firebase
 * @param {string} nodo - Ruta del nodo (ej: 'menu', 'pedidos/2024')
 * @returns {Promise<any>} Los datos JSON del nodo
 */
async function obtenerDatos(nodo) {
    const respuesta = await fetch(`${FIREBASE_DB_URL}${nodo}.json`);
    if (!respuesta.ok) {
        throw new Error(`No se pudo leer "${nodo}" (código ${respuesta.status})`);
    }
    return respuesta.json();
}

/**
 * Guarda datos en un nodo (genera un ID automático como en push())
 * @param {string} nodo - Ruta del nodo
 * @param {any} datos - Objeto/valor a guardar
 * @returns {Promise<any>} Respuesta con el ID generado
 */
async function guardarDatos(nodo, datos) {
    const respuesta = await fetch(`${FIREBASE_DB_URL}${nodo}.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });
    if (!respuesta.ok) {
        throw new Error(`No se pudo guardar en "${nodo}" (código ${respuesta.status})`);
    }
    return respuesta.json();
}

/**
 * Actualiza un nodo específico (PATCH: solo actualiza campos enviados)
 * @param {string} nodo - Ruta del nodo (ej: 'menu/platoId')
 * @param {any} datos - Datos a actualizar
 * @returns {Promise<any>} Los datos actualizados
 */
async function actualizarDatos(nodo, datos) {
    const respuesta = await fetch(`${FIREBASE_DB_URL}${nodo}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });
    if (!respuesta.ok) {
        throw new Error(`No se pudo actualizar "${nodo}" (código ${respuesta.status})`);
    }
    return respuesta.json();
}

/**
 * Reemplaza completamente un nodo (PUT: reemplaza todo)
 * @param {string} nodo - Ruta del nodo
 * @param {any} datos - Datos que reemplazarán el nodo
 * @returns {Promise<any>} Los datos guardados
 */
async function reemplazarDatos(nodo, datos) {
    const respuesta = await fetch(`${FIREBASE_DB_URL}${nodo}.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });
    if (!respuesta.ok) {
        throw new Error(`No se pudo reemplazar "${nodo}" (código ${respuesta.status})`);
    }
    return respuesta.json();
}

/**
 * Elimina un nodo completamente
 * @param {string} nodo - Ruta del nodo a eliminar
 * @returns {Promise<void>}
 */
async function eliminarDatos(nodo) {
    const respuesta = await fetch(`${FIREBASE_DB_URL}${nodo}.json`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
    });
    if (!respuesta.ok) {
        throw new Error(`No se pudo eliminar "${nodo}" (código ${respuesta.status})`);
    }
}

/**
 * Se suscribe a cambios en tiempo real (usa polling con intervalos)
 * @param {string} nodo - Ruta del nodo a monitorear
 * @param {function} callback - Función llamada cuando hay cambios (recibe los datos)
 * @param {number} intervalo - Milisegundos entre consultas (default: 2000)
 * @returns {function} Función para desuscribirse
 */
function suscribirseADatos(nodo, callback, intervalo = 2000) {
    let ultimosDatos = null;
    
    const id = setInterval(async () => {
        try {
            const datos = await obtenerDatos(nodo);
            // Solo ejecutar callback si los datos realmente cambiaron
            if (JSON.stringify(datos) !== JSON.stringify(ultimosDatos)) {
                ultimosDatos = datos;
                callback(datos);
            }
        } catch (error) {
            console.error(`Error monitoreando "${nodo}":`, error);
        }
    }, intervalo);

    // Retornar función de desuscripción
    return () => clearInterval(id);
}

export { 
    FIREBASE_DB_URL, 
    obtenerDatos, 
    guardarDatos, 
    actualizarDatos, 
    reemplazarDatos, 
    eliminarDatos,
    suscribirseADatos 
};