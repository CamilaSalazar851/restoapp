// firebase.js
// Punto único de conexión con Firebase Realtime Database.
// Ningún otro archivo debe construir URLs de Firebase directamente:
// todos importan las funciones de este módulo.

const FIREBASE_DB_URL = "https://restos-pop-default-rtdb.firebaseio.com/";

async function obtenerDatos(nodo) {
    const respuesta = await fetch(`${FIREBASE_DB_URL}${nodo}.json`);
    if (!respuesta.ok) {
        throw new Error(`No se pudo leer "${nodo}" (código ${respuesta.status})`);
    }
    return respuesta.json();
}

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

export { FIREBASE_DB_URL, obtenerDatos, guardarDatos };
