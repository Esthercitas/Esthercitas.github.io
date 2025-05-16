// Base de datos de personajes (puedes mover esto a un archivo JSON separado)
const mythologyDatabase = [ // Se define la base de datos de personajes mitológicos
    {
        id: 1, // ID único para cada personaje
        name: "Zeus", // Nombre del personaje
        title: "Rey de los dioses", // Título del personaje
        category: "Griega", // cultura a la que pertenece el personaje
        description: "Dios del cielo y el trueno, gobernante del Olimpo.", // Descripción del personaje
        page: "zeus.html" // Página de detalle del personaje
    },
    {
        id: 2,
        name: "Hera",
        title: "Reina de los dioses",
        category: "Griega",
        description: "Diosa del matrimonio y la familia, esposa de Zeus.",
        page: "hera.html"
    },
    {
        id: 3,
        name: "Thor",
        title: "Dios del trueno",
        category: "Nórdica",
        description: "Portador del martillo Mjolnir, protector de Asgard.",
        page: "thor.html"
    },
    {
        id: 4,
        name: "Anubis",
        title: "Dios de los muertos",
        category: "Egipcia",
        description: "Guía de las almas al más allá, pesador de corazones.",
        page: "anubis.html"
    },
    {
        id: 5,
        name: "Heracles",
        title: "Héroe griego",
        category: "Griega",
        description: "Conocido por sus doce trabajos, hijo de Zeus.",
        page: "historia_heracles.html"
    },
    {
        id: 6,
        name: "Cerbero",
        title: "Guardián del inframundo",
        category: "Griega",
        description: "Perro de tres cabezas que custodia las puertas del Hades.",
        page: "historia_cerbero.html"
    }
];

// Elementos del DOM
const searchInput = document.getElementById('search-input'); // Input donde se escribe la búsqueda
const searchButton = document.getElementById('search-button'); // Botón de búsqueda
const searchResults = document.getElementById('search-results'); // Contenedor de los resultados de búsqueda

// Función para buscar en la base de datos
function searchMythology(query) { /// Definimos la función de búsqueda que toma un parámetro 'query' (texto a buscar)
    if (!query) return []; // Si no hay texto, retorna un array vacío
    
    const lowerCaseQuery = query.toLowerCase();  // Convierte la consulta a minúsculas para hacer la búsqueda insensible a mayúsculas
    
    // Filtra los elementos de la base de datos para que coincidan con cualquier campo del personaje
    return mythologyDatabase.filter(item => { // Filtra la base de datos
        return (
            item.name.toLowerCase().includes(lowerCaseQuery) || // Coincidencia con el nombrev
            item.title.toLowerCase().includes(lowerCaseQuery) || // Coincidencia con el título
            item.category.toLowerCase().includes(lowerCaseQuery) || // Coincidencia con la categoría
            item.description.toLowerCase().includes(lowerCaseQuery) // Coincidencia con la descripción
        );
    });
}

// Función para mostrar resultados
function displayResults(results) { // Función para mostrar los resultados de la búsqueda
    searchResults.innerHTML = ''; // Limpia cualquier resultado anterior
    
    if (results.length === 0) { // Si no hay resultados, muestra un mensaje
        const noResults = document.createElement('div'); // Crea un nuevo div para mostrar el mensaje
        noResults.className = 'no-results'; // Asigna una clase CSS para el estilo
        noResults.textContent = 'No se encontraron resultados'; // Establece el texto del mensaje
        searchResults.appendChild(noResults); // Añade el mensaje al contenedor de resultados
    } else { // Si hay resultados, crea un elemento por cada resultado
        results.forEach(result => { // Recorre cada uno de los resultados
            const resultItem = document.createElement('div'); // Crea un div para cada resultado
            resultItem.className = 'search-result-item'; // Asigna una clase CSS para el estilo
            resultItem.innerHTML = ` 
                <h3>${result.name} - ${result.title}</h3> 
                <p>${result.category} • ${result.description}</p>
            `;
            
            // Al hacer clic en un resultado, redirige a la página del personaje
            resultItem.addEventListener('click', () => { // Añade un evento de clic
                window.location.href = result.page;  // Redirige a la página correspondiente
            });
            
            searchResults.appendChild(resultItem); // Añade el resultado a la lista de resultados
        });
    }
    
    // Asegura que el contenedor de resultados se muestre, aunque no haya resultados
    searchResults.style.display = results.length > 0 ? 'block' : 'block';
}

// Event listeners
searchInput.addEventListener('input', () => { // Añade un evento para cuando el usuario escriba en el input
    const query = searchInput.value.trim(); // Obtiene el texto ingresado, eliminando espacios innecesarios
    const results = searchMythology(query); // Llama a la función de búsqueda con el texto ingresado
    displayResults(results); // Muestra los resultados
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim(); // Añade un evento para cuando el usuario haga clic en el botón de búsqueda
    const results = searchMythology(query); // Obtiene el texto ingresado, eliminando espacios innecesarios
    displayResults(results); // Llama a la función de búsqueda con el texto ingresado
    
    // Si hay solo un resultado, redirigir directamente
    if (results.length === 1) {  // Si solo hay un resultado
        window.location.href = results[0].page; // Redirige a la página del primer resultado
    }
});

// Ocultar resultados al hacer clic fuera
document.addEventListener('click', (e) => { // Añade un evento de clic en el documento
    if (!searchBar.contains(e.target)) { // Si el clic no fue dentro de la barra de búsqueda
        searchResults.style.display = 'none'; // Oculta los resultados de búsqueda
    }
});

// Manejar tecla Enter
searchInput.addEventListener('keypress', (e) => { // Añade un evento para cuando se presione una tecla
    if (e.key === 'Enter') { // Si la tecla presionada es "Enter"
        const query = searchInput.value.trim(); // Obtiene el texto ingresado, eliminando espacios innecesarios
        const results = searchMythology(query); // Llama a la función de búsqueda con el texto ingresado
        
        if (results.length === 1) { // Si hay un solo resultado
            window.location.href = results[0].page; // Redirige a la página del primer resultado
        } else if (results.length > 1) { // Si hay más de un resultado
            displayResults(results); // Muestra los resultados
        }
    }
});