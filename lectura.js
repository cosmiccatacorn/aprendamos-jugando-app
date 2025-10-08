document.addEventListener('DOMContentLoaded', () => {
    // Leer y mostrar parámetros de la URL
    const params = new URLSearchParams(window.location.search);
    
    document.getElementById('pedido').textContent = params.get('pedido') || 'N/A';
    document.getElementById('fecha').textContent = new Date(params.get('fecha')).toLocaleString('es-CO');
    document.getElementById('total').textContent = Number(params.get('total')).toLocaleString('es-CO');

    // Mostrar items con su cantidad
    const itemsList = document.getElementById('items');
    const itemsParam = params.get('items');

    if (itemsParam) {
        const items = itemsParam.split(',');
        items.forEach(itemString => {
            const [nombre, cantidad] = itemString.split(':');
            const li = document.createElement('li');
            li.textContent = `${decodeURIComponent(nombre)} x${cantidad}`;

            itemsList.appendChild(li);
        });
    } else {
        itemsList.innerHTML = '<li>No se encontraron productos.</li>';
    }
});

