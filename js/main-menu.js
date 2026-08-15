// main-menu.js — muestra la lista de platos del menú en menu.html
import { obtenerMenu } from "./menu.js";
import { mostrarMensaje, mostrarCargando } from "./ui.js";

async function cargarVistaMenu() {
    const lista = document.getElementById("listaMenu");
    mostrarCargando("menuMsg", "Cargando menú...");

    try {
        const platos = await obtenerMenu();
        lista.innerHTML = "";

        if (platos.length === 0) {
            mostrarMensaje("menuMsg", "Todavía no hay platos en el menú.");
            return;
        }

        mostrarMensaje("menuMsg", "");
        platos.forEach((plato) => {
            const li = document.createElement("li");
            li.textContent = `${plato.nombre} — $${plato.precio}`;
            lista.appendChild(li);
        });
    } catch (error) {
        console.error("Error cargando el menú:", error);
        mostrarMensaje("menuMsg", "No se pudo cargar el menú. Intenta de nuevo.", "error");
    }
}

cargarVistaMenu();
