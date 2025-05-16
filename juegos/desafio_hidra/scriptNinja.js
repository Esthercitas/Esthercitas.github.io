// Variables globales
let puntos = 0; // Puntos acumulados por el jugador
let tiempoRestante = 60; // Tiempo restante del juego (en segundos)
let nivel = 1; // Nivel actual del jugador
let intervaloJuego; // Intervalo para crear elementos
let intervaloTiempo; // Intervalo del temporizador

// Elementos del DOM
// Acceso a los elementos HTML por su ID
const juego = document.getElementById('juego');
const mensajeContainer = document.getElementById('mensaje-container');
const botonIniciar = document.getElementById('iniciar');
const botonReiniciar = document.getElementById('reiniciar');
const displayPuntos = document.getElementById('puntos');
const displayTemporizador = document.getElementById('temporizador');
const displayNivel = document.getElementById('nivel');
const startButton = document.getElementById('start-game-btn');
const modal = document.getElementById('instructions-modal');

// Elementos de audio
const sonidoVictoria = document.getElementById('sonidoVictoria');
const sonidoDerrota = document.getElementById('sonidoDerrota');
const sonidoEspada = document.getElementById('sonidoEspada');
const sonidoPupa = document.getElementById('sonidoPupa');

// Configuración de dificultad
const configDificultad = {
    velocidadInicial: 800, // Intervalo inicial de aparición de elementos (ms)
    velocidadMinima: 300, // Velocidad mínima que se alcanza al subir de nivel
    vidaInicial: 1500, // Tiempo de vida de un elemento (ms)
    vidaMinima: 800, // Vida mínima que puede tener un elemento
    probabilidades: [0.5, 0.8, 1.0] // 50% rojo, 30% azul, 20% dorado
};

// Función para reproducir sonidos
function reproducirSonido(elementoAudio) {
    elementoAudio.currentTime = 0;
    elementoAudio.play().catch(e => console.log("Error de sonido:", e));
}

// Iniciar juego
function iniciarJuego() {
    // Resetear estado
    puntos = 0;
    nivel = 1;
    tiempoRestante = 60;

    // Actualizar interfaz
    displayPuntos.textContent = `Puntos: 0/50`;
    displayTemporizador.textContent = `Tiempo: 60s`;
    displayNivel.textContent = `Nivel: ${nivel}`;
    mensajeContainer.innerHTML = '';
    
    // Mostrar/ocultar botones
    botonIniciar.style.display = 'none';
    botonReiniciar.style.display = 'block';
    botonReiniciar.disabled = false;

    // Limpiar elementos existentes
    document.querySelectorAll('.circulo').forEach(c => c.remove());

    // Iniciar temporizador
    intervaloTiempo = setInterval(() => {
        tiempoRestante--;
        displayTemporizador.textContent = `Tiempo: ${tiempoRestante}s`;

        if (tiempoRestante <= 0) {
            clearInterval(intervaloTiempo);
            clearInterval(intervaloJuego);
            finalizarJuego();
        }
    }, 1000);

    // Iniciar generación de elementos
    iniciarGeneracionElementos();
}

// Generación de elementos
function iniciarGeneracionElementos() {
    clearInterval(intervaloJuego);
    
    // Reducir velocidad según el nivel, respetando un mínimo
    const velocidad = Math.max(
        configDificultad.velocidadMinima,
        configDificultad.velocidadInicial - (nivel * 50)
    );
    
    intervaloJuego = setInterval(crearElemento, velocidad);
}

// Crear elemento (rojo, azul o dorado)
function crearElemento() {
    const elemento = document.createElement('div');
    elemento.classList.add('circulo');

    // Determinar tipo de elemento
    const random = Math.random();
    let tipo, valorPuntos, sonido, tiempoVida, tamaño;

    if (random < configDificultad.probabilidades[0]) {
        // Rojo
        tipo = 'rojo';
        valorPuntos = 1;
        sonido = sonidoEspada;
        tiempoVida = configDificultad.vidaInicial;
        tamaño = 60;
        elemento.style.backgroundImage = 'url(images/rojo.png)';
        elemento.classList.add('rojo');
    } 
    else if (random < configDificultad.probabilidades[1]) {
        // Azul
        tipo = 'azul';
        valorPuntos = -1;
        sonido = sonidoPupa;
        tiempoVida = configDificultad.vidaInicial;
        tamaño = 60;
        elemento.style.backgroundImage = 'url(images/azul.png)';
        elemento.classList.add('azul');
    } 
    else {
        // Dorado
        tipo = 'dorado';
        valorPuntos = 2;
        sonido = sonidoEspada;
        tiempoVida = configDificultad.vidaInicial * 0.7;
        tamaño = 70;
        elemento.style.backgroundImage = 'url(images/dorado.png)';
        elemento.classList.add('dorado');
    }

    // Ajustar dificultad por nivel
    tiempoVida = Math.max(
        configDificultad.vidaMinima,
        tiempoVida - (nivel * 70)
    );

    // Establecer tamaño y posición aleatoria
    elemento.style.width = `${tamaño}px`;
    elemento.style.height = `${tamaño}px`;
    const x = Math.random() * (juego.clientWidth - tamaño);
    const y = Math.random() * (juego.clientHeight - tamaño);
    elemento.style.left = `${x}px`;
    elemento.style.top = `${y}px`;

    // Efecto visual para niveles altos
    if (nivel > 3) {
        elemento.classList.add('nivel-alto');
    }

    // Evento al hacer clic sobre el elemento
    elemento.addEventListener('click', () => {
        // Sumar o restar puntos
        puntos = Math.max(0, puntos + valorPuntos);
        displayPuntos.textContent = `Puntos: ${puntos}/50`;
        reproducirSonido(sonido);

        // Subir de nivel cada 5 puntos
        if (puntos > 0 && puntos % 5 === 0) {
            const nuevoNivel = Math.floor(puntos / 5) + 1;
            if (nuevoNivel > nivel) {
                nivel = nuevoNivel;
                displayNivel.textContent = `Nivel: ${nivel}`;
                iniciarGeneracionElementos(); // Aumentar dificultad
            }
        }

        // Animación al desaparecer
        elemento.classList.add('desaparecer');
        setTimeout(() => elemento.remove(), 200);
    });

    // Eliminar elemento tras su vida útil
    setTimeout(() => {
        if (juego.contains(elemento)) {
            elemento.classList.add('desaparecer');
            setTimeout(() => elemento.remove(), 200);
        }
    }, tiempoVida);

    // Añadir el elemento al área de juego
    juego.appendChild(elemento);
}

// Finalizar juego
function finalizarJuego() {
    const gano = puntos >= 50;
    
    // Reproducir sonido de victoria o derrota
    if (gano) {
        reproducirSonido(sonidoVictoria);
    } else {
        reproducirSonido(sonidoDerrota);
    }
    
    // Mostrar mensaje final
    const enlaceResultado = document.createElement('a');
    enlaceResultado.className = `mensaje-final ${gano ? 'victoria' : 'derrota'}`;
    enlaceResultado.textContent = gano ? '¡Victoria!' : '¡Derrota!';
    enlaceResultado.href = gano ? '../../trabajos/trabajo03.html' : '../../trabajos/trabajo02.html';
    mensajeContainer.appendChild(enlaceResultado);
    
    // Deshabilitar controles
    botonReiniciar.disabled = true;
}

// Event Listeners
startButton.addEventListener('click', () => {
    modal.style.display = 'none';
    document.getElementById('titulo').style.display = 'block';
    document.getElementById('contadores').style.display = 'flex';
    document.getElementById('juego').style.display = 'block';
    document.getElementById('botones').style.display = 'flex';
    iniciarJuego();
});

// Reiniciar el juego al hacer clic en el botón correspondiente
botonReiniciar.addEventListener('click', () => {
    clearInterval(intervaloTiempo);
    clearInterval(intervaloJuego);
    iniciarJuego();
});

// Ocultar los botones de inicio/reinicio al cargar
botonReiniciar.style.display = 'none';
botonIniciar.style.display = 'none'; // Ocultar el botón "Comenzar Juego" anterior