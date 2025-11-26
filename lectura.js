document.addEventListener('DOMContentLoaded', () => {
    
    // Recuperar la info guardada
    const pedido = JSON.parse(localStorage.getItem('ultimoPedido'));

    if (!pedido) {
        document.getElementById('pedido').textContent = "N/A";
        document.getElementById('fecha').textContent = "N/A";
        document.getElementById('total').textContent = "N/A";
        document.getElementById('items').innerHTML = '<li>No se encontraron productos.</li>';
        return;
    }

    // Mostrar información general
    document.getElementById('pedido').textContent = pedido.numeroPedido;
    document.getElementById('fecha').textContent = new Date(pedido.fecha).toLocaleString('es-CO');
    document.getElementById('total').textContent = pedido.total.toLocaleString('es-CO');

    // Mostrar detalles del pedido
    const itemsList = document.getElementById('items');
    itemsList.innerHTML = ""; // limpiar

    pedido.detalles.forEach(det => {
        const li = document.createElement('li');
        li.textContent = `${det.nombre} x${det.cantidad}`;
        itemsList.appendChild(li);
    });

    // Limpiar localStorage si quieres
    localStorage.removeItem('ultimoPedido');
});
