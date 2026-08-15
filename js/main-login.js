// main-login.js — conecta el formulario de login.html con auth.js
import { iniciarSesion, estaAutenticado } from "./auth.js";
import { mostrarMensaje } from "./ui.js";

// Si ya hay una sesión activa, no tiene sentido mostrar el login de nuevo.
if (estaAutenticado()) {
    window.location.href = "admin.html";
}

document.getElementById("form-login").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const usuario = document.getElementById("user").value;
    const clave = document.getElementById("pass").value;

    if (iniciarSesion(usuario, clave)) {
        window.location.href = "admin.html";
    } else {
        mostrarMensaje("authMsg", "Credenciales inválidas", "error");
    }
});
