// Dataset procedente: https://www.businessintelligence.info/varios/longitud-latitud-pueblos-espana.html
var map = L.map('map', {
    center: [40.1923, -3.676], 
    zoom: 5,
    minZoom: 6,
    maxBounds: [
        [27.0, -18.0],  // Suroeste (Islas Canarias)
        [44.5, 5.0]     // Noreste (Pirineos)
    ],
    maxBoundsViscosity: 1.0 // Hace que el límite sea estricto
});/*
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);
*/
L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/attributions">CartoDB</a> contributors'
}).addTo(map);

addMapButtons(map);

let mapData = new Map();
loadData(mapData); // Cargamos los datos de los municipios
let totalTowns = 0;
let totalPopulation = 0;
var markers = L.markerClusterGroup();
let mapColors = {
    "Madrid" : ["#ff5733", "#9e5545"],
    "Valencia" : ["#00ABE7", "#006C94"],
    "País Vasco" : ["#96E6B3", "#6AA37F"],
    "Navarra" : ["#464E47", "#313732"],
    "Murcia" : ["#51513D", "#303024"],
    "La Rioja" : ["#EFBDEB", "#B68CB8"],
    "Andalucía" : ["#314CB6", "#253A8F"],
    "Aragón": ["#764134", "#522C22"],
    "Asturias" : ["#6CD4FF", "#4C95B4"],
    "Cantabria" : ["#CFB1B7", "#8D777C"],
    "Castilla La Mancha" : ["#EEFFDB", "#B8C5A9"],
    "Castilla León" : ["#66101F", "#3E0A12"],
    "Catalunya" : ["#8A8E91", "#5B5E60"],
    "Extremadura" : ["#FF8552", "#AF5935"],
    "Galicia" : ["#7D8CC4", "#5E6991"],
    "Islas Baleares" : ["#F4A261", "#C76A29"],  
    "Canarias" : ["#FFD166", "#D19C00"],  
    "Ceuta y Melilla" : ["#5E5D5C", "#3A3A39"]
}

document.getElementById("find-town").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchTown(null);
    }
});
document.getElementById("img-search").addEventListener("click", searchTown);
document.getElementById("clearButton").addEventListener("click", clearData);

/*
* Encargada de comprar si el municipio introducido es correcto 
*/
function searchTown(selectedTown){
    let municipio = null
    if (selectedTown == null){
        municipio = document.getElementById('find-town').value.toLowerCase();
    }
    else {
        municipio = selectedTown
    }
    if(mapData.get(municipio)){
        const info = mapData.get(municipio)
        const community = info[0]
        const coordX = info[1]
        const coordY = info[2]
        const population = info[3]

        const colors = mapColors[community]
        //L.marker([coordX, coordY]).addTo(map)
        //    .bindPopup('<strong>Municipio:</strong> '+municipio+'<br><strong>Población: </strong>'+population);
        L.circle([coordX, coordY], {
            radius: (Math.sqrt(population / Math.PI)) * 70  ,  // Radio dinámico según la población
            color: colors[1], // Color del borde
            fillColor: colors[0], // Color de relleno
            fillOpacity: 0.5 // Opacidad del relleno
        }).addTo(map)
          .bindPopup('<strong>Municipio:</strong> ' + municipio + '<br><strong>Población: </strong>' + population);
        document.getElementById("find-town").value = ""
        totalTowns = totalTowns + 1
        totalPopulation = totalPopulation + parseInt(population)
        document.getElementById("towns-count").textContent = "Municipios totales: "+totalTowns
        document.getElementById("population-count").textContent = "Población total: "+totalPopulation
        addCardTown(population, community, municipio)
        mapData.delete(municipio)

        // LocalStorage save
        let storedTowns = JSON.parse(localStorage.getItem('townsSelected')) || [];
        if (!storedTowns.includes(municipio)) {  
            storedTowns.push(municipio);
        }
        localStorage.setItem('townsSelected', JSON.stringify(storedTowns));
    }
    else{
        console.log('No existe')
    }
}

/*
* Leemos el archivo csv y leemos su contenido
*/
    function loadData(mapData){
        // Load the CSV data
        const csvPath = './municipios_final.csv'; // Asegúrate de que el archivo esté en la misma carpeta
        fetch(csvPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al cargar el archivo CSV');
                }
                return response.text();
            })
            .then(data => {
                procesarCSV(data, mapData);
                // If the cache has elements, load the data
                let towns = JSON.parse(localStorage.getItem('townsSelected')) 
                towns.forEach(town => {
                    searchTown(town)
                });
            })
            .catch(error => console.error('Error:', error));
        
    }

/*
* Leemos el contenido del csv y guardamos la informacion en el mapa
*/
function procesarCSV(contenido, mapData){
    const filas = contenido.split('\n')
    for (let i = 0; i < filas.length; i++) {
        let fila = filas[i];
        if (i != 0){
            let listInfo = []
            const campos = fila.split(',')
            const community = campos[0].replace(/"/g, '')
            const municipio = campos[2].toLowerCase().replace(/"/g, '')
            const coordX = campos[4].replace(',', '.')
            const coordY = campos[5].replace(',', '.')
            const population = campos[3]
            listInfo = [community, coordX, coordY, population]

            const municipios = municipio.split(/[-/]/).map(m => m.trim());
            municipios.forEach(mun => {
                mapData.set(mun, listInfo);
            });
        }
    };
}

/*
* Agrega la información del municipio al div de la lista de municipios
*/
function addCardTown(population, comunidad, municipio){
    // Capitalizamos la primera letra
    municipio = String(municipio).charAt(0).toUpperCase() + String(municipio).slice(1);

    const countDiv = document.getElementById('count-div');
    const cardTownDiv = document.createElement('div');
    cardTownDiv.id = 'card-town';
    cardTownDiv.innerHTML = `
    <h4 class="semi-title">${municipio}</h4>
    <div id="info-town-div">
        <div style="display: flex; align-items: center;">
            <i class="fa fa-user fa-lg icon" style="color: white;"></i>
            <h5 class="text">${population}</h5>
        </div>
        <div style="display: flex; align-items: center;">
            <i class="fa fa-map-marker fa-lg icon" style="color: white;"></i>
            <h5 class="text">${comunidad}</h5>
        </div>
    </div>
    `;
    countDiv.appendChild(cardTownDiv);
}

/*
* Clear the data info of the local storage
*/
function clearData(){
    localStorage.clear();
    window.location.reload();
}