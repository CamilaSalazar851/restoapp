// auth.js
// Autenticación del sistema.
//
// LIMITACIÓN IMPORTANTE (léase antes de modificar):
// Este proyecto es un sitio 100% estático (sin backend) por decisión del
// taller. En un sitio estático no existe ningún lugar realmente seguro
// para guardar credenciales: todo el JavaScript que se envía al navegador
// puede leerse desde las herramientas de desarrollador. La solución
// correcta a largo plazo es usar Firebase Authentication (requiere agregar
// el "apiKey" del proyecto en firebase.js, algo que solo la dueña del
// proyecto puede obtener desde la consola de Firebase) o construir un
// backend propio. Mientras tanto, esta limitación se documenta y se
// centraliza aquí en un único módulo, en vez de repetirla por el código.
const ADMIN_USER = "admin";
const ADMIN_PASS = "admin";

const CLAVE_SESION = "restoapp_autenticado";

function iniciarSesion(usuario, clave) {
    if (usuario === ADMIN_USER && clave === ADMIN_PASS) {
        sessionStorage.setItem(CLAVE_SESION, "true");
        return true;
    }
    return false;
}

function cerrarSesion() {
    sessionStorage.removeItem(CLAVE_SESION);
}

function estaAutenticado() {
    return sessionStorage.getItem(CLAVE_SESION) === "true";
}

// Redirige a login.html si la página actual requiere sesión iniciada.
// Se llama al principio de cada página protegida (por ejemplo admin.html).
function protegerPagina(paginaLogin = "login.html") {
    if (!estaAutenticado()) {
        window.location.href = paginaLogin;
    }
}

export { iniciarSesion, cerrarSesion, estaAutenticado, protegerPagina };
