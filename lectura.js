  const params = new URLSearchParams(window.location.search);
  const items = params.get("items");
  const total = params.get("total");

  if (items) {
    const lista = document.getElementById("lista-carrito");
    items.split(",").forEach(item => {
      const [nombre, cantidad] = item.split(":");
      const li = document.createElement("li");
      li.textContent = `${decodeURIComponent(nombre)} x${cantidad}`;
      lista.appendChild(li);
    });

    document.getElementById("total").textContent = "Total: $" + total;
  }