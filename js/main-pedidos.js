// main-pedidos.js — conecta el formulario de pedidos.html con menu.js y pedidos.js
import { obtenerMenu } from "./menu.js";
import { calcularPedido, formatearPedido } from "./pedidos.js";
import { mostrarMensaje, limpiarFormulario } from "./ui.js";

let precioPorPlato = {};

async function cargarSelectorDePlatos() {
    const select = document.getElementById("plato");

    try {
        const platos = await obtenerMenu();
        precioPorPlato = {};
        select.innerHTML = '<option value="">--Selecciona plato--</option>';

        platos.forEach((plato) => {
            precioPorPlato[plato.id] = plato.precio;
            const opcion = document.createElement("option");
            opcion.value = plato.id;
            opcion.textContent = `${plato.nombre} ($${plato.precio})`;
            select.appendChild(opcion);
        });
    } catch (error) {
        console.error("Error cargando el menú:", error);
        select.innerHTML = '<option value="">--Error cargando menú--</option>';
    }
}

// Autocompletar el precio unitario al elegir un plato.
document.getElementById("plato").addEventListener("change", (evento) => {
    const id = evento.target.value;
    if (precioPorPlato[id] !== undefined) {
        document.getElementById("precio").value = precioPorPlato[id];
    }
});

document.getElementById("form-pedido").addEventListener("submit", (evento) => {
    evento.preventDefault();

    const plato = document.getElementById("plato").value;
    const cantidad = Number(document.getElementById("cantidad").value);
    const precio = Number(document.getElementById("precio").value);

    try {
        const pedido = calcularPedido(plato, cantidad, precio);
        mostrarMensaje("resultadoPedido", formatearPedido(pedido), "exito");
        limpiarFormulario("plato", "cantidad", "precio");
    } catch (error) {
        mostrarMensaje("resultadoPedido", error.message, "error");
    }
});

cargarSelectorDePlatos();
