// Secciones: 
// Información de los productos
// Cada producto tiene un id, un nombre, categoría y precio


class Producto {

    constructor(id, name, price, descripcion, cat){
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
    new Producto(3, "Imprimible", 0, "...", "Otros" )
]
// DOM
//ctes
const contenedorCarrito = document.querySelector(".product-summary");
const cantidadCarrito = document.querySelector(".quant-carrito p");
const costo = document.querySelector(".precio");
//variables

// Cargar carrito desde localStorage al iniciar
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Guardar carrito en localStorage
const guardarCarrito = () => {
    localStorage.setItem('carrito', JSON.stringify(carrito));
};



const actualizarContador = () => {
    const cantidad = carrito.length;
    if(cantidad > 9) {
        cantidadCarrito.textContent = "9+";
    } else {
        cantidadCarrito.textContent = cantidad;
    }
};

const addItem = (id) => {
    const item = productos.find(p => p.id == id);
    if (item) {
        carrito.push(item);
        guardarCarrito();
        actualizarDisplay();
        actualizarContador();
    }
};

const removeItem = (id) => {
    const idx = carrito.findIndex(p => p.id == id);
    if (idx !== -1) {
        carrito.splice(idx, 1);
        guardarCarrito();
        actualizarDisplay();
        actualizarContador();
    }
};

const checkout = () => {
    carrito = [];
    guardarCarrito();
    actualizarDisplay();
    actualizarContador();
};

const actualizarDisplay = () => {
    if (!contenedorCarrito) return;
    
    const total = carrito.reduce((sum, prod) => sum + prod.price, 0);
    costo.textContent = `Total a pagar: $${total}`;
    if (carrito.length === 0) {
        contenedorCarrito.innerHTML = "<p>El carrito está vacío.</p>";
        return;
    }
    contenedorCarrito.innerHTML = carrito.map((item, idx) => `
        <div>
            <span>${item.name} - $${item.price}</span>
            <button onclick="removeItem(${item.id})">Quitar</button>
        </div>
    `).join('');
};

// Inicializar display al cargar la página
actualizarDisplay();
actualizarContador();


// Query params mandar la info del carrito al server







