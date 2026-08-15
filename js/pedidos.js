// pedidos.js
// Lógica de negocio para tomar un pedido: validar los datos y calcular
// subtotal, IVA y total. No toca el DOM.

const IVA = 0.19;

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

function formatearPedido(pedido) {
    return `Pedido: ${pedido.platoId} | Subtotal: $${pedido.subtotal.toFixed(2)} | `
        + `IVA: $${pedido.impuesto.toFixed(2)} | Total: $${pedido.total.toFixed(2)}`;
}

export { calcularPedido, formatearPedido, IVA };
