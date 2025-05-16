// Elementos del DOM 
// Botones de elección de Heracles
const piedraBtn = document.getElementById('piedra');
const papelBtn = document.getElementById('papel');
const tijeraBtn = document.getElementById('tijera');

// Elementos para mostrar elecciones y resultados
const eleccionJugador = document.getElementById('eleccion-jugador');
const eleccionComputadora = document.getElementById('eleccion-computadora');
const resultadoTexto = document.getElementById('resultado');
const puntosJugador = document.getElementById('puntos-jugador');
const puntosComputadora = document.getElementById('puntos-computadora');
const rondaTexto = document.getElementById('ronda');

// Elementos de sonido
const sonidoVictoria = document.getElementById('sonido-victoria');
const sonidoDerrota = document.getElementById('sonido-derrota');

// Botón para comenzar la batalla y elementos de UI
const startButton = document.getElementById('start-battle-btn');
const modal = document.getElementById('instructions-modal');
const gameContainer = document.querySelector('.game-container');

// Variables del juego
let jugadorPuntos = 0;
let computadoraPuntos = 0;
let rondaActual = 1;
const TOTAL_RONDAS = 5;
let gameActive = false; // Indica si el juego está en curso

// Opciones del Jabalí
const opcionesJabali = ['colmillo', 'bosque', 'carga'];

// Elementos de audio
const sonidoRoca = new Audio('sounds/roca.mp3');
const sonidoRed = new Audio('sounds/red.mp3');
const sonidoEspada = new Audio('sounds/espada.mp3');
const sonidoJabali = new Audio('sounds/oink.mp3'); // Sonido del Jabalí

// Función para que el Jabalí elija primero
function eleccionJabaliPrimero() {
    if (!gameActive || rondaActual > TOTAL_RONDAS) return;

    // El Jabalí elige primero
    const eleccionJabali = opcionesJabali[Math.floor(Math.random() * 3)];

    // Mostrar en el DOM la elección traducida
    eleccionComputadora.textContent = `El Jabalí usó: ${traducirEleccionJabali(eleccionJabali)}`;
    
    // Reproducir sonido del Jabalí
    sonidoJabali.play();
    
    // Habilitar botones para que Heracles elija
    piedraBtn.disabled = false;
    papelBtn.disabled = false;
    tijeraBtn.disabled = false;
    
    return eleccionJabali;
}

// Función para reproducir sonidos de Heracles
function reproducirSonidoHeracles(eleccion) {
    switch(eleccion) {
        case 'piedra':
            sonidoRoca.play();
            break;
        case 'papel':
            sonidoRed.play();
            break;
        case 'tijera':
            sonidoEspada.play();
            break;
    }
}

// Función principal 
function jugar(eleccionUsuario) {
    if (!gameActive) return;

    // Deshabilitar botones mientras se procesa
    piedraBtn.disabled = true;
    papelBtn.disabled = true;
    tijeraBtn.disabled = true;

    // Reproducir sonido correspondiente de Heracles
    reproducirSonidoHeracles(eleccionUsuario);

    // Obtener la elección del Jabalí del texto mostrado
    const textoEleccionJabali = eleccionComputadora.textContent.split(": ")[1];
    let eleccionJabali = '';
    
    // Convertir el texto mostrado a la opción interna
    if (textoEleccionJabali.includes('Colmillos')) eleccionJabali = 'colmillo';
    else if (textoEleccionJabali.includes('Bosque')) eleccionJabali = 'bosque';
    else if (textoEleccionJabali.includes('Carga')) eleccionJabali = 'carga';

    let resultado = "";

    // Lógica del juego
    if (
        (eleccionUsuario === 'piedra' && eleccionJabali === 'colmillo') ||
        (eleccionUsuario === 'papel' && eleccionJabali === 'carga') ||
        (eleccionUsuario === 'tijera' && eleccionJabali === 'bosque')
    ) {
        resultado = "¡Heracles gana esta ronda! ⚔️";
        jugadorPuntos++;
    } else if (eleccionUsuario === eleccionJabali) {
        resultado = "¡Empate! 🤝";
    } else {
        resultado = "¡El Jabalí gana esta ronda! 🐗";
        computadoraPuntos++;
    }

    // Mostrar resultados
    eleccionJugador.textContent = `Heracles usó: ${traducirEleccion(eleccionUsuario)}`;
    resultadoTexto.textContent = resultado;
    puntosJugador.textContent = `Heracles: ${jugadorPuntos}`;
    puntosComputadora.textContent = `Jabalí: ${computadoraPuntos}`;

    // Actualizar ronda
    rondaActual++;
    rondaTexto.textContent = `Ronda: ${Math.min(rondaActual, TOTAL_RONDAS)}/${TOTAL_RONDAS}`;

    // Verificar fin del juego
    if (rondaActual > TOTAL_RONDAS) {
        gameActive = false;
        if (jugadorPuntos > computadoraPuntos) {
            resultadoTexto.innerHTML = '<a href="../../trabajos/trabajo05.html" style="color: #FFD700; text-decoration: none; animation: pulse 1.5s infinite;">¡VICTORIA! 🏆</a>';
            sonidoVictoria.play();
        } else {
            resultadoTexto.innerHTML = '<a href="../../trabajos/trabajo04.html" style="color: #a0151c; text-decoration: none;">¡DERROTA! 💀</a>';
            sonidoDerrota.play();
        }
    } else {
        // Preparar siguiente ronda
        setTimeout(() => {
            eleccionJugador.textContent = 'Heracles usó: ';
            eleccionComputadora.textContent = 'El Jabalí usó: ';
            resultadoTexto.textContent = 'Elige tu movimiento...';
            eleccionJabaliPrimero();
        }, 1500);
    }
}

// Reiniciar juego
function reiniciarJuego() {
    jugadorPuntos = 0;
    computadoraPuntos = 0;
    rondaActual = 1;
    rondaTexto.textContent = `Ronda: ${rondaActual}/${TOTAL_RONDAS}`;
    puntosJugador.textContent = `Heracles: 0`;
    puntosComputadora.textContent = `Jabalí: 0`;
    resultadoTexto.textContent = 'Elige tu movimiento...';
    eleccionJugador.textContent = 'Heracles usó: ';
    eleccionComputadora.textContent = 'El Jabalí usó: ';
    gameActive = true;
    
    // Deshabilitar botones inicialmente
    piedraBtn.disabled = true;
    papelBtn.disabled = true;
    tijeraBtn.disabled = true;
}

// Traducir elecciones
function traducirEleccion(eleccion) {
    const opcionesHercules = {
        'piedra': '🗿 Roca',
        'papel': '🕸️ Red',
        'tijera': '⚔️ Espada'
    };
    return opcionesHercules[eleccion];
}

function traducirEleccionJabali(eleccion) {
    const opcionesJabali = {
        'colmillo': '🦷 Colmillos',
        'bosque': '🌿 Bosque',
        'carga': '🐗 Carga'
    };
    return opcionesJabali[eleccion];
}

// Event listeners

// Al hacer clic en las opciones, se juega la ronda
piedraBtn.addEventListener('click', () => jugar('piedra'));
papelBtn.addEventListener('click', () => jugar('papel'));
tijeraBtn.addEventListener('click', () => jugar('tijera'));

// Inicialización
startButton.addEventListener('click', () => {
    modal.style.display = 'none'; // Ocultar instrucciones
    gameContainer.style.display = 'block'; // Mostrar contenedor de juego
    reiniciarJuego(); // Reiniciar estado del juego
    // El Jabalí comienza primero
    eleccionJabaliPrimero();
});

// Deshabilitar botones inicialmente
reiniciarJuego();