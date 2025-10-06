// Secciones: 
// Información de los productos
// Cada producto tiene un id, un nombre, categoría y precio
class Producto {
    constructor(id, name, price, descripcion, cat) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.cat = cat;
        this.descripcion = descripcion;
    }
}

const productos = [
    new Producto(0, "Libro-borrable", 90000, "...", "Libros"),
    new Producto(1, "Libro-sensorial", 150000, "", "Libros"),
    new Producto(2, "Flashcards", 60000, "...", "Flashcards"),
    new Producto(3, "Imprimible", 0, "...", "Otros")
];

// DOM
// ctes
const contenedorCarrito = document.querySelector(".product-summary");
const cantidadCarrito = document.querySelector(".quant-carrito p");
const costo = document.querySelector(".precio");

// variables
// Cargar carrito desde localStorage al iniciar
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Guardar carrito en localStorage
const guardarCarrito = () => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
};

// 🔹 Contador de productos en carrito
const actualizarContador = () => {
    const cantidad = carrito.length;
    if (cantidadCarrito) {
        if (cantidad > 9) {
            cantidadCarrito.textContent = "9+";
        } else {
            cantidadCarrito.textContent = cantidad;
        }
    }
};

// 🔹 Agregar producto
const addItem = (id) => {
    const item = productos.find(p => p.id == id);
    if (item) {
        carrito.push(item);
        guardarCarrito();
        actualizarDisplay();
        actualizarContador();
    }
};

// 🔹 Eliminar producto
const removeItem = (id) => {
    const idx = carrito.findIndex(p => p.id == id);
    if (idx !== -1) {
        carrito.splice(idx, 1);
        guardarCarrito();
        actualizarDisplay();
        actualizarContador();
    }
};

const cleanCarrito = () => {
    carrito = [];
    guardarCarrito();
    actualizarDisplay();
    actualizarContador();
};

const checkoutCarrito = () => {

    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    // Crear objeto para contar cantidad de cada producto
    const itemCount = carrito.reduce((acc, item) => {
        acc[item.id] = (acc[item.id] || 0) + 1;
        return acc;
    }, {});

    // Crear string de items con formato "nombre:cantidad,nombre2:cantidad2"
    const items = Object.entries(itemCount)
        .map(([id, cantidad]) => {
            const producto = productos.find(p => p.id == id);
            return `${encodeURIComponent(producto.name)}:${cantidad}`;
        })
        .join(',');

    const total = carrito.reduce((sum, prod) => sum + prod.price, 0);

    // Construir URL con parámetros
    const params = new URLSearchParams();
    params.set('items', items);
    params.set('total', total);
    params.set('fecha', new Date().toISOString());
    params.set('pedido', Math.random().toString(36).substring(2, 8));

    // Redireccionar a la página de confirmación
    window.location.href = `./confirmacion.html?${params.toString()}`;
    //window.location.href = `carrito.html?${params.toString()}`;

    cleanCarrito();
    actualizarContador();
};




// 🔹 Render del carrito en pantalla
const actualizarDisplay = () => {
    if (!contenedorCarrito || !costo) return;

    const total = carrito.reduce((sum, prod) => sum + prod.price, 0);
    costo.textContent = `Total a pagar: $${total}`;

    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = "<p>El carrito está vacío.</p>";
        return;
    }

    contenedorCarrito.innerHTML = carrito.map((item) => `
        <div>
            <span>${item.name} - $${item.price}</span>
            <button onclick="removeItem(${item.id})">Quitar</button>
        </div>
    `).join('');
};

// Inicializar al cargar
actualizarDisplay();
actualizarContador();








// Query params mandar la info del carrito al server


// URL de la API de Google Sheets
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwYMjMtanyO4SFW-DPVS5LcJw_ojYiWJC25dxirK3F18M2XLrULldWtfoBr_cgN1Iy_/exec";


// === Enviar pedido a Google Sheets ===
async function enviarPedidoGoogle(nombre, telefono, direccion) {
    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    // Contar cantidad de cada producto
    const itemCount = carrito.reduce((acc, item) => {
        acc[item.id] = (acc[item.id] || 0) + 1;
        return acc;
    }, {});

    // Crear array de productos con id, precio y cantidad
    const productosPedido = Object.entries(itemCount).map(([id, cantidad]) => {
        const producto = productos.find(p => p.id == id);
        return {
            id: producto.id,
            nombre: producto.name,
            precio: producto.price,
            cantidad: cantidad
        };
    });

    // Crear objeto JSON del pedido
    const pedido = {
        nombre: nombre,
        telefono: telefono,
        direccion: direccion,
        productos: productosPedido,
        valorTotal: carrito.reduce((sum, prod) => sum + prod.price, 0)
    };

    try {
        const res = await fetch(SHEET_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(pedido)
        });

        if (res.ok) {
            alert("✅ Pedido enviado correctamente");
            cleanCarrito();
            actualizarContador();
            actualizarDisplay();
        } else {
            alert("❌ Error al enviar el pedido");
        }
    } catch (error) {
        console.error("Error al enviar el pedido:", error);
        alert("❌ No se pudo conectar con la API");
    }
}


const checkout = () => {
    if (carrito.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    const nombre = prompt("Ingrese su nombre completo:");
    const telefono = prompt("Ingrese su número de teléfono:");
    const direccion = prompt("Ingrese su dirección:");

    if (!nombre || !telefono || !direccion) {
        alert("Debe llenar todos los campos para enviar el pedido.");
        return;
    }

    // 🔹 Enviar pedido a Google Sheets
    enviarPedidoGoogle(nombre, telefono, direccion);

    // 🔹 Limpiar el carrito después de enviar
    cleanCarrito();
    actualizarContador();
    actualizarDisplay();
};









