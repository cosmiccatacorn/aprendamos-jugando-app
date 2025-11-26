// Obtener token desde sessionStorage (igual que en script.js)
function getToken() {
    return sessionStorage.getItem("token");
}

const token = getToken();

// Verifica autenticación
if (!token) {
    window.location.href = "login.html";
}

// Cargar pedidos
async function cargarPedidos() {
    try {
        const resp = await fetch("https://aprendamos-jugando-api.onrender.com/api/pedidos", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!resp.ok) throw new Error("Error " + resp.status);

        const pedidos = await resp.json();
        renderPedidos(pedidos);

    } catch (err) {
        console.error("Error al cargar pedidos:", err);
    }
}

function renderPedidos(pedidos) {
    const tbody = document.querySelector("#tablaPedidos tbody");
    tbody.innerHTML = "";

    pedidos.forEach(pedido => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.nombreCliente}</td>
            <td>
                Tel: ${pedido.telefonoCliente}<br>
                Email: ${pedido.correoCliente}
            </td>
            <td>${pedido.direccionCliente}</td>
            <td>$${pedido.total.toLocaleString("es-CO")}</td>
            <td>${pedido.enviado ? "Enviado" : "Pendiente"}</td>
            <td>
                <button class="btn-ver" data-id="${pedido.id}">
                    Ver detalles
                </button>
                ${
                    pedido.enviado
                    ? `<button class="btn-enviado" disabled>✓ Enviado</button>`
                    : `<button class="btn-enviar" data-id="${pedido.id}">Enviar</button>`
                }
            </td>
        `;

        tbody.appendChild(tr);

        // Fila de detalles expandible
        const detallesRow = document.createElement("tr");
        detallesRow.classList.add("detalles");
        detallesRow.style.display = "none";

        detallesRow.innerHTML = `
            <td colspan="7">
                <h4>Detalles:</h4>
                <ul>
                    ${pedido.detalles.map(d => `
                        <li>
                            <b>${d.producto.nombre}</b>  
                            (x${d.cantidad})  
                            — $${d.producto.precio.toLocaleString("es-CO")}
                        </li>
                    `).join("")}
                </ul>
            </td>
        `;

        tbody.appendChild(detallesRow);
    });

    activarBotones();
}

function activarBotones() {
    document.querySelectorAll(".btn-ver").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            const detallesRow = btn.closest("tr").nextElementSibling;

            detallesRow.style.display =
                detallesRow.style.display === "none" ? "table-row" : "none";
        });
    });

    document.querySelectorAll(".btn-enviar").forEach(btn => {
        btn.addEventListener("click", () => marcarComoEnviado(btn.dataset.id));
    });
}

async function marcarComoEnviado(id) {
    try {
        const resp = await fetch(`https://aprendamos-jugando-api.onrender.com/api/pedidos/${id}/enviado`, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if (!resp.ok) {
            console.log(resp);
        }
        cargarPedidos();

    } catch (err) {
        console.error(err);
    }
}

// Cargar pedidos al iniciar
cargarPedidos();
