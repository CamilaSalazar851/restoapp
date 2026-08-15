// main-admin.js — protege admin.html y conecta el formulario de creación
// de productos con menu.js
import { protegerPagina, cerrarSesion } from "./auth.js";
import { crearProducto } from "./menu.js";
import { mostrarMensaje, limpiarFormulario } from "./ui.js";

// Primera línea del módulo: si no hay sesión, redirige a login.html
// y no sigue ejecutando el resto del archivo.
protegerPagina();

document.getElementById("logoutBtn").addEventListener("click", () => {
    cerrarSesion();
    window.location.href = "login.html";
});

document.getElementById("form-producto").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const nombre = document.getElementById("newName").value;
    const precio = Number(document.getElementById("newPrice").value);

    try {
        await crearProducto(nombre, precio);
        mostrarMensaje("prodMsg", "Producto creado correctamente.", "exito");
        limpiarFormulario("newName", "newPrice");
    } catch (error) {
        mostrarMensaje("prodMsg", error.message, "error");
    }
});
