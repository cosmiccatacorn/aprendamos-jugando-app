  const params = new URLSearchParams(window.location.search);
  console.log("Query params recibidos:", params.toString()); // 👀 DEBUG

  const items = params.get("items");
  const total = params.get("total");

  if (items) {
    const lista = document.getElementById("product-summary");
    items.split(",").forEach(item => {
      const [nombre, cantidad] = item.split(":");
      const li = document.createElement("li");
      li.textContent = `${decodeURIComponent(nombre)} x${cantidad}`;
      lista.appendChild(li);
    });

    document.getElementById("total").textContent = "Total: $" + total;
  }