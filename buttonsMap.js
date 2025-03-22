function addMapButtons(map) {
    var myButton = L.control({ position: 'bottomright' }); 

    myButton.onAdd = function (map) {
        var button = L.DomUtil.create('button', 'my-custom-button');
        button.innerHTML = '<i class="fa-solid fa-moon fa-2x" style="color: white;"></i>';
        
        // Estilo del botón circular
        button.style.backgroundColor = '#14181D'; // Color de fondo
        button.style.border = 'none';
        button.style.borderRadius = '50%';  // Esto hace que el botón sea circular
        button.style.width = '50px';  // Tamaño del botón
        button.style.height = '50px';  // Tamaño del botón
        button.style.display = 'flex';
        button.style.alignItems = 'center';
        button.style.justifyContent = 'center';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '0 4px 8px rgba(255, 255, 255, 0.2)';  // Sombra para hacer el botón más visible

        // Acción cuando se haga clic en el botón
        button.onclick = function () {
            var mapContainer = document.querySelector('.leaflet-container');
            mapContainer.classList.toggle('invert-map');
        };

        return button;
    };

    // Añadir el botón al mapa
    myButton.addTo(map);
}