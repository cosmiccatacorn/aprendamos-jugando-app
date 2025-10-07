const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbysTDJglp8qscqpJ2yshvuPbnsGcF5mrrIaPU6XvdLJxJnd2_P6XDCOyrRI5hU30Sjn/exec"; // ej: "https://script.google.com/macros/s/XXX/exec"

// === Clase Producto
class Producto {
    constructor(id, name, price, descripcion = "", cat = "", imagen = "") {
        this.id = Number(id);
        this.name = name;
        this.price = Number(price) || 0;
        this.cat = cat;
        this.descripcion = descripcion;
        this.imagen = imagen;
    }
}



// variables
let productos = []; // se llenará desde fetch
const contenedorCarrito = document.querySelector(".product-summary");
const cantidadCarrito = document.querySelector(".quant-carrito p");
const costo = document.querySelector(".precio");

// Cargar carrito desde localStorage al iniciar
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

const guardarCarrito = () => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
};

// Agregar producto (con agrupación)
const addItem = (id) => {
    const item = productos.find(p => p.id == id);
    if (!item) return;

    const existingItem = carrito.find(p => p.id == id);

    if (existingItem) {
        existingItem.cantidad++;
    } else {
        carrito.push({ ...item, cantidad: 1 });
    }

    guardarCarrito();
    actualizarDisplay();
    actualizarContador();
};

// quitar producto, uno por uno si hay varios del mismo
const removeItem = (id) => {
    const existingItem = carrito.find(p => p.id == id);
    if (!existingItem) return;

    existingItem.cantidad--;

    if (existingItem.cantidad <= 0) {
        carrito = carrito.filter(p => p.id != id);
    }

    guardarCarrito();
    actualizarDisplay();
    actualizarContador();
};

// Muestra el número chiquito junto al carrito de compras :D
const actualizarContador = () => {
    const cantidad = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    if (cantidadCarrito) {
        cantidadCarrito.textContent = cantidad > 9 ? "9+" : cantidad;
    }
};


// renderizar carrito 
const actualizarDisplay = () => {
    if (!contenedorCarrito || !costo) return;

    const total = carrito.reduce((sum, prod) => sum + (prod.price * prod.cantidad), 0);
    costo.textContent = `Total a pagar: $${total.toLocaleString('es-CO')}`;

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = "<p>El carrito está vacío.</p>";
        return;
    }

    contenedorCarrito.innerHTML = carrito.map((item) => `
        <div class="cart-item" data-id="${item.id}">
            <span>${item.name} (x${item.cantidad}) - $${(item.price * item.cantidad).toLocaleString('es-CO')}</span>
            <button class="remove-btn" data-id="${item.id}">Quitar</button>
        </div>
    `).join('');
};

// === Mapear posibles claves del JSON remoto a Producto ===
//ni idea, lo hizo chat :(
function mapRemoteProduct(raw) {
    // detecta campos comunes y los normaliza
    const id = raw.id ?? raw.ID ?? raw.Id ?? raw.index ?? raw.row ?? raw.numero ?? raw.productId ?? raw.product_id;
    const name = raw.name ?? raw.nombre ?? raw.title ?? raw.producto ?? raw.nombre_producto;
    const price = raw.price ?? raw.precio ?? raw.Price ?? raw.Precio;
    const descripcion = raw.descripcion ?? raw.description ?? raw.desc ?? raw.info ?? "";
    const cat = raw.cat ?? raw.category ?? raw.categoria ?? "";
    const imagen = raw.imagen ?? raw.image ?? raw.img ?? raw.foto ?? "";

    return new Producto(id, name, price, descripcion, cat, imagen);
}

//ya ez
async function cargarProductos() {
    const cont = document.querySelector(".opciones-productos");
    if (!cont) return; 

    // 1. Mostrar el loader para q se vea bonitoo
    cont.innerHTML = `
        <div class="loader-container">
            <svg viewBox="25 25 50 50">
                <circle r="20" cy="50" cx="50"></circle>
            </svg>
        </div>
    `;

    if (!ENDPOINT_URL) {
        console.warn("ENDPOINT_URL no configurado :(");
        return;
    }

    try {
        const resp = await fetch(ENDPOINT_URL);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const apiResponse = await resp.json();

        // la api retorna { data: [...] }, así que accedemos a .data
        if (Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
            productos = apiResponse.data.map(mapRemoteProduct);
            console.log("Productos cargados desde endpoint:", productos.length);
        } else {
            console.warn("El endpoint devolvió un formato inesperado.");
            
        }
    } catch (err) {
        console.error("Error cargando productos desde endpoint:", err);
        
    } finally {
        renderProductos(); 
    }
}

// mostrar los productos
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
        
        const itemsInfo = carrito.map(p => `${encodeURIComponent(p.name)}:${p.cantidad}`).join(',');
        params.set('items', itemsInfo);

        // Limpiar el carrito ANTES de redirigir
        carrito = [];
        guardarCarrito();
        window.location.href = `confirmacion.html?${params.toString()}`;

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





