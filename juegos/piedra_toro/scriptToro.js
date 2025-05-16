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

// Opciones del Toro
const opcionesJabali = ['cuernos', 'furia', 'embiste'];

// Elementos de audio
const sonidoRoca = new Audio('sounds/roca.mp3');
const sonidoRed = new Audio('sounds/red.mp3');
const sonidoEspada = new Audio('sounds/espada.mp3');
const sonidoJabali = new Audio('sounds/moo.mp3'); // Sonido del Toro

// Función para que el Toro elija primero
function eleccionJabaliPrimero() {
    if (!gameActive || rondaActual > TOTAL_RONDAS) return;

    // El Toro elige primero
    const eleccionJabali = opcionesJabali[Math.floor(Math.random() * 3)];

    // Mostrar en el DOM la elección traducida
    eleccionComputadora.textContent = `El Toro usó: ${traducirEleccionJabali(eleccionJabali)}`;
    
    // Reproducir sonido del Toro
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

    // Obtener la elección del Toro del texto mostrado
    const textoEleccionJabali = eleccionComputadora.textContent.split(": ")[1];
    let eleccionJabali = '';
    
    // Convertir el texto mostrado a la opción interna
    if (textoEleccionJabali.includes('Cuernos')) eleccionJabali = 'cuernos';
    else if (textoEleccionJabali.includes('Furia')) eleccionJabali = 'furia';
    else if (textoEleccionJabali.includes('Embiste')) eleccionJabali = 'embiste';

    let resultado = "";

    // Lógica del juego
    if (
        (eleccionUsuario === 'piedra' && eleccionJabali === 'cuernos') ||
        (eleccionUsuario === 'papel' && eleccionJabali === 'embiste') ||
        (eleccionUsuario === 'tijera' && eleccionJabali === 'furia')
    ) {
        resultado = "¡Heracles gana esta ronda! ⚔️";
        jugadorPuntos++;
    } else if (eleccionUsuario === eleccionJabali) {
        resultado = "¡Empate! 🤝";
    } else {
        resultado = "¡El Toro gana esta ronda! 🐂";
        computadoraPuntos++;
    }

    // Mostrar resultados
    eleccionJugador.textContent = `Heracles usó: ${traducirEleccion(eleccionUsuario)}`;
    resultadoTexto.textContent = resultado;
    puntosJugador.textContent = `Heracles: ${jugadorPuntos}`;
    puntosComputadora.textContent = `Toro: ${computadoraPuntos}`;

    // Actualizar ronda
    rondaActual++;
    rondaTexto.textContent = `Ronda: ${Math.min(rondaActual, TOTAL_RONDAS)}/${TOTAL_RONDAS}`;

    // Verificar fin del juego
    if (rondaActual > TOTAL_RONDAS) {
        gameActive = false;
        if (jugadorPuntos > computadoraPuntos) {
            resultadoTexto.innerHTML = '<a href="../../trabajos/trabajo08.html" style="color: #FFD700; text-decoration: none; animation: pulse 1.5s infinite;">¡VICTORIA! 🏆</a>';
            sonidoVictoria.play();
        } else {
            resultadoTexto.innerHTML = '<a href="../../trabajos/trabajo07.html" style="color: #a0151c; text-decoration: none;">¡DERROTA! 💀</a>';
            sonidoDerrota.play();
        }
    } else {
        // Preparar siguiente ronda
        setTimeout(() => {
            eleccionJugador.textContent = 'Heracles usó: ';
            eleccionComputadora.textContent = 'El Toro usó: ';
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
    puntosComputadora.textContent = `Toro: 0`;
    resultadoTexto.textContent = 'Elige tu movimiento...';
    eleccionJugador.textContent = 'Heracles usó: ';
    eleccionComputadora.textContent = 'El Toro usó: ';
    gameActive = true;
    
    // Deshabilitar botones inicialmente
    piedraBtn.disabled = true;
    papelBtn.disabled = true;
    tijeraBtn.disabled = true;
}

// Traducir elecciones
function traducirEleccion(eleccion) {
    const opcionesHercules = {
        'piedra': '🛡️ Escudo',
        'papel': '🔥 Antorcha',
        'tijera': '🪓 Hacha'
    };
    return opcionesHercules[eleccion];
}

function traducirEleccionJabali(eleccion) {
    const opcionesJabali = {
        'cuernos': '👹 Cuernos',
        'furia': '😡 Furia',
        'embiste': '🐂 Embiste'
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
    // El Toro comienza primero
    eleccionJabaliPrimero();
});

// Deshabilitar botones inicialmente
reiniciarJuego();