
        // Leer y mostrar parámetros
        const params = new URLSearchParams(window.location.search);
        
        document.getElementById('pedido').textContent = params.get('pedido');
        document.getElementById('fecha').textContent = new Date(params.get('fecha')).toLocaleString();
        document.getElementById('total').textContent = params.get('total');

        // Mostrar items
        const itemsList = document.getElementById('items');
        const items = params.get('items').split(',');
        items.forEach(item => {
            const [nombre, cantidad] = item.split(':');
            const li = document.createElement('li');
            li.textContent = `${decodeURIComponent(nombre)} x${cantidad}`;
            itemsList.appendChild(li);
        });