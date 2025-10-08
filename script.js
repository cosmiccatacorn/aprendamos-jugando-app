function renderProductos() {
    const cont = document.querySelector(".opciones-productos");
    if (!cont) {
        return;
    }

    cont.innerHTML = productos.map(p => `
        <div class="producto-card" data-cat="${p.cat}">
            <img class="imagen-descripcion" src="${p.imagen || 'assets/logo-removebg-preview.png'}" alt="${p.name}">
            
            <div class="producto-info">
                <h3>${p.name}</h3>
                <p>${p.descripcion}</p> 
                <p class="precio-tag">$${p.price.toLocaleString('es-CO')}</p>
            </div>

            <button class="add-btn" data-id="${p.id}">Añadir al carrito</button>
        </div>
    `).join('');
}

// hacer el pedido y enviarlo usando Post

async function enviarPedido() {
    const nombre = document.getElementById('nombre_cliente').value;
    const telefono = document.getElementById('telefono_cliente').value;
    const direccion = document.getElementById('direccion_cliente').value;

    if (!nombre || !telefono || !direccion) {
        alert("Por favor, completa todos tus datos.");
        return;
    }

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }
    const productosPedido = carrito.map(item => ({
        id: item.id,
        precio: item.price,
        cantidad: item.cantidad
    }));
    const valorTotal = carrito.reduce((sum, item) => sum + (item.price * item.cantidad), 0);

    // Genera el número de pedido UNA SOLA VEZ y guárdalo en una variable.
    const numeroPedido = Math.random().toString(36).substring(2, 9).toUpperCase();

    // esto se manda en el post
    const pedidoPOST = {
        numero_pedido: numeroPedido,
        fecha: new Date().toISOString(), // Crea el objeto de la fecha
        nombre_cliente: nombre,
        telefono_cliente: telefono,
        direccion_cliente: direccion,
        productos: JSON.stringify(productosPedido),
        valor_total: valorTotal
    };

    // Envía el pedido
    try {
        await fetch(ENDPOINT_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(pedidoPOST)
        });

        const params = new URLSearchParams();
        params.set('pedido', numeroPedido);
        params.set('fecha', pedidoPOST.fecha);
        params.set('total', valorTotal);

        // Se usa el template literal para construir el string
        const itemsInfo = carrito.map(p => `${ encodeURIComponent(p.name) }:${ p.cantidad }`).join(',');
        params.set('items', itemsInfo);

        // Limpiar el carrito ANTES de redirigir
        carrito = [];
        guardarCarrito();
        
        // 🚨 CORRECCIÓN DE SINTAXIS: Se reemplazó la sintaxis ternaria incorrecta 
        // por la concatenación de la URL base con los parámetros.
        window.location.href = `confirmacion.html?${ params.toString() }`;

    } catch (error) {
        console.error('Error al enviar el pedido:', error);
        alert("Hubo un error al procesar tu pedido. Por favor, intenta de nuevo.");
    }
}


//eventos
document.addEventListener('click', (e) => {
    // Agregar
    const addBtn = e.target.closest('.add-btn');
    if (addBtn) {
        const id = Number(addBtn.dataset.id);
        addItem(id);
        return;
    }

    // Quitar
    const remBtn = e.target.closest('.remove-btn');
    if (remBtn) {
        const id = Number(remBtn.dataset.id);
        removeItem(id);
        return;
    }

    // Checkout
    const checkoutBtn = e.target.closest('#checkout-btn');
    if (checkoutBtn) {
        enviarPedido();
    }
});

// inicizlizar :D
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector(".opciones-productos")) {
        cargarProductos();
    }

    actualizarDisplay();
    actualizarContador();
});
