// ========== VARIABLES GLOBALES ========== //
// Referencias a elementos del DOM (interfaz)
const gameBoard = document.getElementById('game-board'); // Tablero de juego
const staminaBar = document.getElementById('stamina-bar'); // Barra de energía
const staminaText = document.getElementById('stamina-text'); // Texto de energía
const counterElement = document.getElementById('counter'); // Contador de capturas y tiempo
const messageElement = document.getElementById('message'); // Mensaje al jugador
const startButton = document.getElementById('start-game-btn'); // Botón para empezar el juego
const modal = document.getElementById('instructions-modal'); // Ventana de instrucciones
const gameContainer = document.querySelector('.game-container'); // Contenedor principal del juego

// Variables del juego
let hX = 100, hY = 100; // Posición de Heracles
let cX = 300, cY = 200; // Posición de la cierva
let intentos = 0;  // Número de capturas realizadas
let stamina = 100; // Nivel de energía de Heracles
let tiempoRestante = 60; // Tiempo total del juego en segundos
let velocidadCierva = 1000; // Intervalo de movimiento de la cierva (ms)
const boardWidth = 500; // Ancho del tablero
const boardHeight = 400; // Alto del tablero
const obstaculos = []; // Lista de obstáculos (árboles)
let timer, intervaloCierva; // Identificadores de intervalos para el tiempo y la cierva
let heraclesDir = 'derecha'; // Dirección de Heracles
let ciervaDir = 'derecha'; // Dirección de la cierva
let juegoActivo = false; // Controla si el juego está en curso

// Sistema de sonidos
const sounds = {
    captura: new Audio('sounds/pick.mp3'), // Sonido al capturar la cierva
    victoria: new Audio('sounds/victoria.mp3'), // Sonido de victoria
    derrota: new Audio('sounds/error.wav'), // Sonido de derrota
    pasos: new Audio('sounds/pasos.mp3') // Sonido de pasos
};

// Ajustar el volumen de todos los sonidos
Object.values(sounds).forEach(sound => {
    if (sound) sound.volume = 0.6;
});
let sonidosActivados = false; // Controla si los sonidos están activos

// ========== INICIALIZACIÓN ========== //
document.addEventListener('DOMContentLoaded', () => {
    // Al hacer clic en el botón de inicio, se oculta el modal y comienza el juego
    startButton.addEventListener('click', () => {
        modal.style.display = 'none';
        gameContainer.style.display = 'block';
        initGame();
    });
});

// Inicializa todas las variables y el estado del juego
function initGame() {
    juegoActivo = true;
    hX = 100; hY = 100;
    cX = 300; cY = 200;
    intentos = 0;
    stamina = 100;
    tiempoRestante = 60;
    velocidadCierva = 1000;

    // Limpiar tablero
    gameBoard.innerHTML = '';
    obstaculos.length = []; // Vaciar lista de obstáculos

    // Iniciar elementos
    precargarRecursos(); // Precargar imágenes
    crearPersonajes(); // Añadir Heracles y la cierva
    generarObstaculos(); // Crear árboles aleatoriamente
    iniciarTemporizador(); // Iniciar cuenta regresiva
    intervaloCierva = setInterval(moveCierva, velocidadCierva); // Movimiento de la cierva
    actualizarStamina(); // Mostrar energía inicial
    activarSonidos(); // Activar sistema de sonido

    // Mostrar mensaje inicial
    messageElement.textContent = "¡Persigue a la cierva sagrada!";
    counterElement.textContent = `Capturas: 0/5 | Tiempo: 60s`;
}

// ========== FUNCIONES DEL JUEGO ========== //
// Precarga imágenes para que no haya retraso visual
function precargarRecursos() {
    const imagenes = ['heracles.png', 'heracles2.png', 'cierva.png', 'cierva2.png', 'arbol.png'];
    imagenes.forEach(img => {
        const image = new Image();
        image.src = `images/${img}`;
    });
}

// Crea y posiciona los personajes en el tablero
function crearPersonajes() {
    // Crear Heracles
    const heracles = document.createElement('div');
    heracles.className = 'character';
    heracles.id = 'heracles';
    heracles.style.backgroundImage = "url('images/heracles.png')";
    heracles.style.left = `${hX}px`;
    heracles.style.top = `${hY}px`;
    gameBoard.appendChild(heracles);

    // Crear Cierva
    const cierva = document.createElement('div');
    cierva.className = 'character';
    cierva.id = 'cierva';
    cierva.style.backgroundImage = "url('images/cierva.png')";
    cierva.style.left = `${cX}px`;
    cierva.style.top = `${cY}px`;
    gameBoard.appendChild(cierva);
}

// Genera obstáculos en posiciones aleatorias válidas
function generarObstaculos() {
    for (let i = 0; i < 5; i++) {
        const arbol = document.createElement('div');
        arbol.className = 'obstaculo';
        arbol.style.backgroundImage = "url('images/arbol.png')";
        
        let posX, posY;
        let posicionValida = false;
        let intentosPosicion = 0;

        do {
            posX = Math.floor(Math.random() * (boardWidth - 50));
            posY = Math.floor(Math.random() * (boardHeight - 50));
            
            // Verificar distancia con personajes
            const lejosDeHeracles = Math.sqrt((posX - hX) ** 2 + (posY - hY) ** 2) > 100;
            const lejosDeCierva = Math.sqrt((posX - cX) ** 2 + (posY - cY) ** 2) > 100;
            
            // Verificar superposición con otros obstáculos
            const superposicion = obstaculos.some(obs => {
                const obsX = parseInt(obs.style.left);
                const obsY = parseInt(obs.style.top);
                return (
                    posX < obsX + 50 &&
                    posX + 50 > obsX &&
                    posY < obsY + 50 &&
                    posY + 50 > obsY
                );
            });
            
            posicionValida = lejosDeHeracles && lejosDeCierva && !superposicion;
            intentosPosicion++;
            
        } while (!posicionValida && intentosPosicion < 100);

        if (posicionValida) {
            arbol.style.left = `${posX}px`;
            arbol.style.top = `${posY}px`;
            gameBoard.appendChild(arbol);
            obstaculos.push(arbol);
        }
    }
}

// Verifica si hay colisión con los bordes o con un obstáculo
function hayColision(x, y, width = 50, height = 50) {
    // Verificar bordes del tablero
    if (x < 0 || y < 0 || x + width > boardWidth || y + height > boardHeight) {
        return true; // Colisión con bordes
    }
    
    // Verificar obstáculos
    return obstaculos.some(obstaculo => {
        const obsX = parseInt(obstaculo.style.left);
        const obsY = parseInt(obstaculo.style.top);
        return (
            x < obsX + 50 &&
            x + 50 > obsX &&
            y < obsY + 50 &&
            y + 50 > obsY
        );
    });
}

// Inicia y actualiza el temporizador del juego
function iniciarTemporizador() {
    clearInterval(timer);
    timer = setInterval(() => {
        tiempoRestante--;
        counterElement.textContent = `Capturas: ${intentos}/5 | Tiempo: ${tiempoRestante}s`;
        
        if (tiempoRestante <= 0) {
            finDelJuego(false); // Pierde por tiempo
        }
    }, 1000);
}

// Mueve a la cierva aleatoriamente si el juego está activo
function moveCierva() {
    if (!juegoActivo) return;
    
    // Movimiento aleatorio
    const movimientoX = (Math.random() - 0.5) * 80;
    const movimientoY = (Math.random() - 0.5) * 80;
    let newCX = cX + movimientoX;
    let newCY = cY + movimientoY;

    // Cambiar imagen según dirección
    const nuevaDir = movimientoX > 0 ? 'derecha' : 'izquierda';
    if (nuevaDir !== ciervaDir) {
        ciervaDir = nuevaDir;
        document.getElementById('cierva').style.backgroundImage = 
            `url('images/cierva${ciervaDir === 'izquierda' ? '2' : ''}.png')`;
    }

    // Verificar colisiones antes de mover
    if (!hayColision(newCX, newCY)) {
        cX = newCX;
        cY = newCY;
        document.getElementById('cierva').style.left = `${cX}px`;
        document.getElementById('cierva').style.top = `${cY}px`;
    }

    // Animación de movimiento
    const cierva = document.getElementById('cierva');
    cierva.classList.add('moving');
    clearTimeout(cierva.movementTimer);
    cierva.movementTimer = setTimeout(() => {
        cierva.classList.remove('moving');
    }, 300);

    checkCapture(); // Comprobar si fue capturada
}

// Actualiza la barra de energía visual y su color
function actualizarStamina() {
    stamina = Math.max(0, Math.min(100, stamina));
    staminaBar.style.width = `${stamina}%`;
    staminaText.textContent = `Energía: ${stamina}%`;
    
    // Actualizar color según nivel de energía
    staminaBar.classList.remove('medium', 'low');
    if (stamina <= 25) {
        staminaBar.classList.add('low');
    } else if (stamina <= 50) {
        staminaBar.classList.add('medium');
    }
}

// Comprueba si Heracles ha capturado a la cierva
function checkCapture() {
    if (!juegoActivo) return;
    
    const distancia = Math.sqrt((hX - cX) ** 2 + (hY - cY) ** 2);
    
    if (distancia < 30) { // Rango de captura
        playSound('captura');
        intentos++;
        counterElement.textContent = `Capturas: ${intentos}/5 | Tiempo: ${tiempoRestante}s`;
        
        // Efecto visual de captura
        const cierva = document.getElementById('cierva');
        cierva.classList.add('captura-effect');
        setTimeout(() => cierva.classList.remove('captura-effect'), 500);
        
        // Verificar si ganó
        if (intentos >= 5) {
            finDelJuego(true);
            return;
        }
        
        // Aumentar dificultad cada 3 capturas
        if (intentos % 3 === 0 && velocidadCierva > 300) {
            velocidadCierva -= 200;
            clearInterval(intervaloCierva);
            intervaloCierva = setInterval(moveCierva, velocidadCierva);
            messageElement.textContent = "¡La cierva se asusta y acelera!";
            setTimeout(() => {
                if (messageElement.textContent === "¡La cierva se asusta y acelera!") {
                    messageElement.textContent = "";
                }
            }, 2000);
        }
        
        // Reposicionar cierva
        reposicionarCierva();
    }
}

function reposicionarCierva() {
    // Reubicar la cierva aleatoriamente después de una captura
    let nuevaCX, nuevaCY;
    let intentosReposicion = 0;
    let posicionValida = false;
    
    // Busca posición válida para la cierva
    do {
        nuevaCX = Math.random() * (boardWidth - 50);
        nuevaCY = Math.random() * (boardHeight - 50);
        
        // Verificar que no colisione y esté a cierta distancia de Heracles
        posicionValida = !hayColision(nuevaCX, nuevaCY) && 
                         Math.sqrt((nuevaCX - hX) ** 2 + (nuevaCY - hY) ** 2) > 100;
        
        intentosReposicion++;
    } while (!posicionValida && intentosReposicion < 100);
    
    // Si encontró posición válida, actualiza coordenadas
    if (posicionValida) {
        cX = nuevaCX;
        cY = nuevaCY;
        document.getElementById('cierva').style.left = `${cX}px`;
        document.getElementById('cierva').style.top = `${cY}px`;
    }
}

// ========== CONTROL DE TECLADO ========== //
// Manejador de eventos para telcado
document.addEventListener('keydown', (e) => {
    if (stamina <= 0 || !juegoActivo) return; // No mover si el juego no está activo
    
    const tecla = e.key.toLowerCase();
    const step = 20; // Píxeles a mover por tecla presionada
    let newHX = hX;
    let newHY = hY;
    let moved = false; // Bandera de movimiento válido    

    // Manejo de teclas de dirección
    switch(tecla) {
        case 'w': case 'arrowup': // Arriba
            newHY = hY - step;
            if (!hayColision(hX, newHY)) {
                hY = newHY;
                moved = true;
            }
            break;
            
        case 's': case 'arrowdown': // Abajo
            newHY = hY + step;
            if (!hayColision(hX, newHY)) {
                hY = newHY;
                moved = true;
            }
            break;
            
        case 'a': case 'arrowleft': // Izquierda
            newHX = hX - step;
            if (!hayColision(newHX, hY)) {
                hX = newHX;
                moved = true;
                // cambia imagen si cambió de dirección
                if (heraclesDir !== 'izquierda') {
                    heraclesDir = 'izquierda';
                    document.getElementById('heracles').style.backgroundImage = "url('images/heracles2.png')";
                }
            }
            break;
            
        case 'd': case 'arrowright': // Derecha
            newHX = hX + step;
            if (!hayColision(newHX, hY)) {
                hX = newHX;
                moved = true;
                // cambia imagen si cambió de dirección
                if (heraclesDir !== 'derecha') {
                    heraclesDir = 'derecha';
                    document.getElementById('heracles').style.backgroundImage = "url('images/heracles.png')";
                }
            }
            break;
    }
    
    if (moved) {
        // Actualizar posición de Heracles
        const heracles = document.getElementById('heracles');
        heracles.style.left = `${hX}px`;
        heracles.style.top = `${hY}px`;
        
        // Animación de movimiento
        heracles.classList.add('moving');
        clearTimeout(heracles.movementTimer);
        heracles.movementTimer = setTimeout(() => {
            heracles.classList.remove('moving');
        }, 200);
        
        // Reduce energía
        stamina -= 3;
        actualizarStamina();
        playSound('pasos'); // Sonido de pasos
        
        // Verificar si se quedó sin energía
        if (stamina <= 0) {
            messageElement.textContent = "¡Hércules está agotado! Espera 3 segundos.";
            setTimeout(() => {
                stamina = 100; // Restaura energía 
                actualizarStamina();
                messageElement.textContent = "";
            }, 3000);
        }
        
        // Verificar captura
        checkCapture();
    } else if (['a','d','arrowleft','arrowright','w','s','arrowup','arrowdown'].includes(tecla)) {
        // Muestra mensaje si el movimiento está bloqueado
        messageElement.textContent = "¡Camino bloqueado!";
        setTimeout(() => {
            if (messageElement.textContent === "¡Camino bloqueado!") {
                messageElement.textContent = "";
            }
        }, 1000);
    }
});

// ========== FIN DEL JUEGO ========== //
// Maneja el final del juego (victoria/derrota)
function finDelJuego(victoria) {
    juegoActivo = false; // Desactiva el juego
    clearInterval(timer); // Detiene temporizador
    clearInterval(intervaloCierva); // Detiene movimiento de la cierva
    
    if (victoria) {
        playSound('victoria'); // Sonido de victoria
        mostrarMensajeFinal("¡Victoria! Haz click para continuar", "../../trabajos/trabajo04.html");
    } else {
        playSound('derrota'); // Sonido de derrota
        mostrarMensajeFinal("¡Derrota! Haz click para reintentar", "../../trabajos/trabajo03.html");
    }
}

// Muestra mensaje final con opción para redireccionar
function mostrarMensajeFinal(mensaje, pagina) {
    messageElement.textContent = mensaje;
    messageElement.classList.add('clickeable'); // Estilo para indicar que es clickeable 
    
    // Clonar para eliminar event listeners previos
    const nuevoMensaje = messageElement.cloneNode(true);
    messageElement.replaceWith(nuevoMensaje);
    
    // Configura evento de click (sólo una vez)
    nuevoMensaje.addEventListener('click', () => {
        window.location.href = pagina;
    }, { once: true });
}

// ========== SISTEMA DE SONIDOS ========== //
// Intenta activar los sonidos al inicio
function activarSonidos() {
    sounds.captura.play().then(() => {
        sonidosActivados = true; // Marca sonidos como activados
        sounds.captura.pause();
        sounds.captura.currentTime = 0;
    }).catch(e => mostrarBotonSonido()); // Si falla, muestra botón de activación
}

// Muestra advertencia y botón para activar sonidos manualmente
function mostrarBotonSonido() {
    const warning = document.createElement('div');
    warning.id = 'sound-warning';
    warning.innerHTML = '<p>Los sonidos están desactivados</p><button id="enable-sound">Activar sonidos</button>';
    document.body.appendChild(warning);
    
    // Configura botón de activación
    document.getElementById('enable-sound').addEventListener('click', () => {
        sounds.victoria.play().then(() => {
            sonidosActivados = true; // Marca sonidos como activados
            warning.remove(); // Elimina la advertencia
            sounds.victoria.pause();
            sounds.victoria.currentTime = 0;
        });
    });
}

// Reproduce un efecto de sonido si están activados
function playSound(nombre) {
    if (!sonidosActivados || !sounds[nombre]) return;
    try {
        sounds[nombre].currentTime = 0;
        sounds[nombre].play().catch(e => console.error(`Error al reproducir ${nombre}:`, e));
    } catch (e) {
        console.error(`Error con el sonido ${nombre}:`, e);
    }
}