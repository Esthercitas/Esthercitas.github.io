// ============ [ VARIABLES GLOBALES ] ============ // 
let tiempoRestante = 100; // Tiempo total del juego en segundos
let intervalo; // Variable para guardar el intervalo del temporizador
let terminado = false; // Indicador para saber si el juego ha terminado
let mezclando = false; // Indicador para saber si el puzzle está en proceso de mezcla
let puzzle = document.getElementById('puzzle'); // Referencia al contenedor del puzzle en el DOM
let tiles = []; // Array que almacenará la posición actual de las piezas

// Objetos con los sonidos del juego para acciones como mover, ganar o perder
const sounds = {
    move: new Audio('sounds/deslizar.mp3'),
    win: new Audio('sounds/victoria.mp3'),
    lose: new Audio('sounds/sounds_error.wav')
};

// ============ [ INICIALIZACIÓN ] ============ //
// Cuando el contenido del DOM esté listo, se ejecuta esta función
document.addEventListener('DOMContentLoaded', () => {
    // Ocultar juego y mostrar modal al cargar
    document.querySelector('.game-container').style.display = 'none';
    document.getElementById('instructions-modal').style.display = 'flex';

    // Precarga de sonidos
    Object.values(sounds).forEach(sound => sound.load());

    // Botón de inicio
    document.getElementById('start-puzzle-btn').addEventListener('click', () => {
        // Ocultar modal de instrucciones y mostrar juego
        document.getElementById('instructions-modal').style.display = 'none';
        document.querySelector('.game-container').style.display = 'block';
        crearPuzzle();
    });

    // Botón de mezclar
    document.getElementById('mezclar-btn').addEventListener('click', mezclar);
});

// ============ [ FUNCIONES DEL JUEGO ] ============ //
// Crear el estado inicial del puzzle con piezas ordenadas y espacio vacío
function crearPuzzle() {
    let indices = [...Array(15).keys()]; // [0, 1, 2, ..., 14]
    indices.push(null); // Espacio vacío
    tiles = indices; // Asignar al array global tiles
    renderizar(); // Dibujar el puzzle en pantalla
    // Limpiar mensajes y estado
    document.getElementById('mensaje').textContent = '';
    document.getElementById('mensaje').className = '';
    terminado = false; // Marcar el juego como no terminado
}

// Renderiza el puzzle en el DOM, creando cada pieza y asignando su posición visual
function renderizar() {
    puzzle.innerHTML = ''; // Limpiar contenido previo
    tiles.forEach((index, i) => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        if (index === null) {
            // Pieza vacía: sin imagen y cursor deshabilitado
            tile.classList.add('empty');
        } else {
            // Calcular posición de la imagen de fondo para cada pieza según su índice
            const x = index % 4;
            const y = Math.floor(index / 4);
            tile.style.backgroundPosition = `-${x * 75}px -${y * 75}px`;
            // Al hacer click en una pieza, se intenta moverla
            tile.onclick = () => mover(i);
        }
        puzzle.appendChild(tile); // Añadir pieza al tablero
    });
}

// Función que maneja el movimiento de una pieza si es válido
// sinComprobarVictoria sirve para evitar verificar victoria cuando se mezcla
function mover(i, sinComprobarVictoria = false) {
    if (terminado) return; // No permitir movimientos si el juego terminó

    const vacio = tiles.indexOf(null); // Índice del espacio vacío
    // Posibles posiciones adyacentes (izquierda, derecha, arriba, abajo)
    const valido = [i - 1, i + 1, i - 4, i + 4];

    // Comprobar si la pieza a mover está adyacente al espacio vacío
    if (valido.includes(vacio) && esAdyacente(i, vacio)) {
        // Efecto de sonido
        sounds.move.currentTime = 0;
        sounds.move.play();

        // Animación
        const tile = puzzle.children[i];
        tile.classList.add('tile-move');
        setTimeout(() => tile.classList.remove('tile-move'), 300);

        // Intercambiar posiciones
        [tiles[i], tiles[vacio]] = [tiles[vacio], tiles[i]];
        renderizar(); // Actualizar visualmente

        // Si no está mezclando y no se omite, comprobar si se ha ganado
        if (!mezclando && !sinComprobarVictoria) {
            comprobarVictoria();
        }
    }
}

// Función para comprobar si dos índices son adyacentes en la cuadrícula 4x4
function esAdyacente(i, j) {
    const filaI = Math.floor(i / 4), colI = i % 4;
    const filaJ = Math.floor(j / 4), colJ = j % 4;
    // Son adyacentes si la suma de diferencias absolutas de filas y columnas es 1
    return (Math.abs(filaI - filaJ) + Math.abs(colI - colJ)) === 1;
}

// Función que mezcla aleatoriamente las piezas del puzzle antes de iniciar el juego
function mezclar() {
    mezclando = true; // Marcar que está en proceso de mezcla
    sounds.move.currentTime = 0;
    sounds.move.play();

    let movimientos = 0;
    // Intervalo que mueve piezas aleatorias adyacentes al espacio vacío repetidamente
    const intervaloMezcla = setInterval(() => {
        const vecinos = obtenerVecinos(tiles.indexOf(null)); // Obtener posiciones válidas
        const aleatorio = vecinos[Math.floor(Math.random() * vecinos.length)]; // Elegir una al azar
        mover(aleatorio, true); // evitar comprobación de victoria

        if (++movimientos >= 200) { // Parar después de 200 movimientos
            clearInterval(intervaloMezcla);
            mezclando = false; // Mezcla terminada
            iniciarCuentaAtras(); // Iniciar el temporizador del juego
        }
    }, 10);
}

// Obtener las posiciones vecinas válidas al espacio vacío en la cuadrícula
function obtenerVecinos(index) {
    const vecinos = [];
    const fila = Math.floor(index / 4);
    const col = index % 4;

    if (col > 0) vecinos.push(index - 1); // Vecino izquierda
    if (col < 3) vecinos.push(index + 1); // Vecino derecha
    if (fila > 0) vecinos.push(index - 4); // Vecino arriba
    if (fila < 3) vecinos.push(index + 4); // Vecino abajo

    return vecinos;
}

// Inicia la cuenta atrás del temporizador del juego
function iniciarCuentaAtras() {
    clearInterval(intervalo); // Limpiar cualquier temporizador previo
    tiempoRestante = 100; // Reiniciar tiempo
    updateTimer(); // Actualizar visualmente

    // Crear intervalo que decrementa tiempo cada segundo
    intervalo = setInterval(() => {
        tiempoRestante--;
        updateTimer();
        
        // Si se acaba el tiempo y el juego no terminó, mostrar derrota
        if (tiempoRestante <= 0) {
            clearInterval(intervalo);
            if (!terminado) {
                sounds.lose.play();
                document.getElementById('mensaje').innerHTML = '<a href="../../trabajos/trabajo11.html">¡Derrota!</a>';
                document.getElementById('mensaje').className = 'derrota';
            }
        }
    }, 1000);
}

// Actualiza el texto y estilo del temporizador según el tiempo restante
function updateTimer() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `Tiempo: ${tiempoRestante}`;
    
    // Cambiar color según tiempo (verde > 30s, amarillo > 10s, rojo)
    timerElement.className = '';
    if (tiempoRestante <= 10) {
        timerElement.classList.add('low-time');
    } else if (tiempoRestante <= 30) {
        timerElement.classList.add('medium-time');
    }
}

// Comprueba si el puzzle está en el estado ganador (orden correcto)
function comprobarVictoria() {
    const victoria = tiles.slice(0, 15).every((val, idx) => val === idx) && tiles[15] === null;
    if (victoria) {
        clearInterval(intervalo); // Detener temporizador
        terminado = true; // Marcar juego como terminado
        sounds.win.play(); // Reproducir sonido de victoria
        const mensaje = document.getElementById('mensaje');
        mensaje.innerHTML = '<a href="../../trabajos/trabajo12.html">¡Victoria!</a>';
        mensaje.className = 'victoria';
        
        // Efecto de confeti (opcional)
        puzzle.classList.add('celebrate');
    }
}
