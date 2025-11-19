/* ============================
    CONFIGURACIÓN GENERAL
============================= */

const API_BASE = "https://aprendamos-jugando-api.onrender.com/api";

// Token JWT almacenado localmente
function getToken() {
    return localStorage.getItem("token");
}

function setToken(token) {
    localStorage.setItem("token", token);
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "login.html";
}

/* ============================
        LOGIN EMPLEADO
============================= */

async function loginEmpleado(username, password) {
    try {
        const resp = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (!resp.ok) {
            alert("Usuario o contraseña incorrectos");
            return;
        }

        const data = await resp.json();
        setToken(data.token);

        window.location.href = "dashboard.html";

    } catch (err) {
        console.error("Error login:", err);
    }
}

/* ============================
        PRODUCTOS
============================= */

let productos = [];

async function cargarProductos() {
    const cont = document.querySelector(".opciones-productos");
    if (!cont) return;

    const categoryFilter = cont.dataset.categoryFilter; // "SENSORIAL", "FLASHCARDS", etc.

    cont.innerHTML = `
        <div class="loader-container">
            <svg viewBox="25 25 50 50">
                <circle r="20" cy="50" cx="50"></circle>
            </svg>
        </div>
    `;

    let url = `${API_BASE}/productos`;

    // Si hay categoría → construir el endpoint adecuado
    if (categoryFilter) {
        const categoriaBackend = categoryFilter.toLowerCase(); // backend usa minúsculas
        url = `${API_BASE}/productos/categoria/${categoriaBackend}`;
    }

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

        productos = await resp.json(); // backend ya retorna array limpio
        console.log("Productos cargados:", productos);

    } catch (err) {
        console.error("Error cargando productos desde backend:", err);
        cont.innerHTML = "<p>Error cargando los productos 😢</p>";
        return;
    }

    renderProductos();
}

function renderProductos() {
    const cont = document.querySelector(".opciones-productos");
    if (!cont) return;

    if (productos.length === 0) {
        cont.innerHTML = "<p>No se encontraron productos en esta categoría.</p>";
        return;
    }

    cont.innerHTML = productos.map(p => `
        <div class="producto-card">
            <img class="imagen-descripcion" src="${p.imagenUrl || 'assets/logo-removebg-preview.png'}" alt="${p.nombre}">
            <div class="producto-info">
                <h3>${p.nombre}</h3>
                <p>${p.descripcion}</p> 
                <p class="precio-tag">$${p.precio.toLocaleString('es-CO')}</p>
            </div>
            <button class="add-btn" data-id="${p.id}">Añadir al carrito</button>
        </div>
    `).join('');
}


/* ============================
        CARRITO
============================= */

let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function addItem(id) {
    const prod = productos.find(p => p.id == id);
    if (!prod) return;

    const item = carrito.find(p => p.id == id);

    if (item) item.cantidad++;
    else carrito.push({ ...prod, cantidad: 1 });

    guardarCarrito();
    actualizarDisplay();
    actualizarContador();
}

function removeItem(id) {
    const item = carrito.find(p => p.id == id);
    if (!item) return;

    item.cantidad--;

    if (item.cantidad <= 0)
        carrito = carrito.filter(p => p.id != id);

    guardarCarrito();
    actualizarDisplay();
    actualizarContador();
}

function actualizarContador() {
    const elem = document.querySelector(".quant-carrito p");
    if (!elem) return;

    const total = carrito.reduce((sum, i) => sum + i.cantidad, 0);
    elem.textContent = total > 9 ? "9+" : total;
}

function actualizarDisplay() {
    const cont = document.querySelector(".product-summary");
    const costo = document.querySelector(".precio");

    if (!cont || !costo) return;

    if (carrito.length === 0) {
        cont.innerHTML = "<p>El carrito está vacío.</p>";
        costo.textContent = "Total: $0";
        return;
    }

    cont.innerHTML = carrito.map(item => `
        <div class="cart-item">
            <span>${item.nombre} (x${item.cantidad}) - $${(item.precio * item.cantidad).toLocaleString('es-CO')}</span>
            <button class="remove-btn" data-id="${item.id}">Quitar</button>
        </div>
    `).join('');

    const total = carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    costo.textContent = `Total a pagar: $${total.toLocaleString('es-CO')}`;
}

/* ============================
        ENVIAR PEDIDO
============================= */

async function enviarPedido() {
    const nombre = document.getElementById('nombre_cliente')?.value;
    const telefono = document.getElementById('telefono_cliente')?.value;
    const direccion = document.getElementById('direccion_cliente')?.value;
    const correo = document.getElementById('correo_cliente')?.value;

    if (!nombre || !telefono || !direccion || !correo) {
        alert("Por favor completa todos tus datos");
        return;
    }

    if (carrito.length === 0) {
        alert("El carrito está vacío");
        return;
    }

    const detalles = carrito.map(item => ({
        producto: { id: item.id },
        cantidad: item.cantidad
    }));

    const pedido = {
        nombreCliente: nombre,
        telefonoCliente: telefono,
        direccionCliente: direccion,
        correoCliente: correo,
        detalles: detalles
    };

    try {
        const resp = await fetch(`${API_BASE}/pedidos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(pedido)
        });

        if (!resp.ok) throw new Error("Error enviando pedido");

        const data = await resp.json();

        // 1. Guardar en localStorage antes de limpiar el carrito
        const ultimoPedido = {
            numeroPedido: data.id, // ID del pedido desde el backend
            fecha: new Date().toISOString(),
            total: carrito.reduce((sum, item) => sum + item.precio * item.cantidad, 0),
            detalles: carrito.map(item => ({
                nombre: item.nombre,
                cantidad: item.cantidad
            }))
        };

        localStorage.setItem("ultimoPedido", JSON.stringify(ultimoPedido));

        // 2. Limpiar el carrito
        carrito = [];
        guardarCarrito();

        // 3. Redirigir a la página de confirmación
        window.location.href = `confirmacion.html?id=${data.id}`;

    } catch (err) {
        console.error("Error:", err);
        alert("No se pudo procesar tu pedido.");
    }
}

/* ============================
    EMPLEADO: VER PEDIDOS
============================= */

async function cargarPedidos() {
    const token = getToken();
    if (!token) {
        alert("No tienes permiso");
        return;
    }

    const resp = await fetch(`${API_BASE}/pedidos`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (!resp.ok) {
        alert("Error cargando pedidos");
        return;
    }

    const lista = await resp.json();
    renderPedidos(lista);
}

function renderPedidos(lista) {
    const cont = document.getElementById("pedidos");
    if (!cont) return;

    cont.innerHTML = lista.map(p => `
        <div class="pedido-card">
            <h3>Pedido #${p.id}</h3>
            <p><strong>Cliente:</strong> ${p.nombreCliente}</p>
            <p><strong>Total:</strong> $${p.total.toLocaleString('es-CO')}</p>
            <p><strong>Estado:</strong> ${p.enviado ? "Enviado" : "Pendiente"}</p>
            <button onclick="marcarEnviado(${p.id})">Marcar enviado</button>
        </div>
    `).join('');
}

/* ============================
 EMPLEADO: MARCAR COMO ENVIADO
============================= */

async function marcarEnviado(id) {
    const token = getToken();
    if (!token) return alert("No autorizado");

    await fetch(`${API_BASE}/pedidos/${id}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}` }
    });

    cargarPedidos();
}

/* ============================
    LISTENERS GLOBALES
============================= */

document.addEventListener("click", e => {
    if (e.target.classList.contains("add-btn")) {
        addItem(Number(e.target.dataset.id));
    }

    if (e.target.classList.contains("remove-btn")) {
        removeItem(Number(e.target.dataset.id));
    }

    if (e.target.id === "checkout-btn") {
        enviarPedido();
    }
});

/* ============================
    INICIALIZACIÓN AUTOMÁTICA
============================= */

document.addEventListener("DOMContentLoaded", () => {

    // Si estamos en la página de login y ya hay token, redirige al dashboard
    const isLoginPage = window.location.pathname.endsWith('login.html') 
        || window.location.pathname.endsWith('/login') 
        || Boolean(document.querySelector('form.login'));
    if (isLoginPage && getToken()) {
        window.location.href = 'dashboard.html';
        return;
    }

    // Cargar productos si estamos en catálogo
    if (document.querySelector(".opciones-productos")) {
        cargarProductos();
    }

    // Mostrar carrito si estamos en checkout
    actualizarDisplay();
    actualizarContador();

    // Cargar pedidos si estamos en panel del empleado
    if (document.getElementById("pedidos")) {
        cargarPedidos();
    }
});
