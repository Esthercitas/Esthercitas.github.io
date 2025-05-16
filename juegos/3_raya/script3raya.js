// ========== VARIABLES GLOBALES ========== //
// Elementos del DOM
const tablero = document.getElementById('tablero');
const mensaje = document.getElementById('mensaje');
const reiniciar = document.getElementById('reiniciar');

// Estado del juego
let celdas = Array(9).fill(""); // Representación del tablero (9 casillas vacías)
let juegoActivo = true; // Indica si el juego está en curso
let turnoJugador = true; // Controla si es el turno del jugador

// Puntuaciones y rondas
let puntuacionJugador = 0;
let puntuacionMaquina = 0;
let rondasJugador = 0;
let rondasMaquina = 0;
let numRonda = 1; // Contador de rondas

// ========== INICIALIZACIÓN ========== //
document.addEventListener('DOMContentLoaded', () => {
  // Elementos del DOM necesarios para empezar
  const startButton = document.getElementById('start-game-btn');
  const gameContainer = document.querySelector('.game-container');
  const modal = document.getElementById('instructions-modal');
  
  // Precargar sonidos
  const sonidos = ['victoria-sound', 'sonido-jugador', 'sonido-maquina'];
  sonidos.forEach(id => {
    const audio = document.getElementById(id);
    audio.volume = 0.5;
    audio.load();
  });
  
  // Al pulsar el botón de inicio, se oculta el modal y se muestra el juego
  startButton.addEventListener('click', () => {
    modal.style.display = 'none';
    gameContainer.style.display = 'block';
    crearTablero(); // Se crea el tablero inicial
  });
});

// ========== FUNCIÓN PARA CREAR EL TABLERO ========== //
function crearTablero() {
  tablero.innerHTML = ""; // Vacía el contenido anterior del tablero
  celdas = Array(9).fill(""); // Reinicia el estado de las celdas
  juegoActivo = true;
  tablero.style.display = "grid";
  reiniciar.style.display = "block";

  // Crear las 9 celdas del tablero
  celdas.forEach((valor, index) => {
    const celda = document.createElement('div');
    celda.classList.add('celda');
    celda.dataset.index = index; // Guardar el índice como atributo
    celda.textContent = valor;
    celda.addEventListener('click', marcarCeldaJugador); // Asignar evento de click
    tablero.appendChild(celda);
  });

  // Mostrar número de ronda
  document.getElementById('num-ronda').textContent = numRonda;
  mensaje.innerHTML = numRonda === 1 ? "¡Comienza el juego!" : `Ronda ${numRonda}`;

  // Decidir aleatoriamente quién empieza
  turnoJugador = Math.random() < 0.5;
  if (!turnoJugador) {
    setTimeout(() => {
      mensaje.textContent = "Hipólita empieza...";
      setTimeout(turnoMaquina, 800);
    }, 500);
  } else {
    mensaje.textContent = "Tu turno (X)";
  }
}

// ========== LÓGICA DEL JUEGO ========== //
function marcarCeldaJugador(e) {
  const index = e.target.dataset.index;

  // Solo marcar si está vacía, el juego está activo y es el turno del jugador
  if (celdas[index] === "" && juegoActivo && turnoJugador) {
    const sonidoJugador = document.getElementById('sonido-jugador');
    sonidoJugador.currentTime = 0;
    sonidoJugador.play();
    
    celdas[index] = 'X'; // Marcar celda con 'X'
    e.target.classList.add('jugador'); // Añadir clase para estilo
    turnoJugador = false; // Cambiar el turno
    actualizarTablero(); // Mostrar cambios en el tablero
    
    if (comprobarGanador('X')) {
      finRonda("¡Ganaste esta ronda! ⚔️", 'jugador');
      return;
    }
    
    if (!celdas.includes("")) {
      finRonda("¡Ronda empatada!", 'empate');
    } else {
      mensaje.textContent = "Hipólita está pensando...";
      setTimeout(turnoMaquina, 800);
    }
  }
}

function turnoMaquina() {
  if (!juegoActivo || turnoJugador) return;

  const sonidoMaquina = document.getElementById('sonido-maquina');
  sonidoMaquina.currentTime = 0;
  sonidoMaquina.play();
  
  // Buscar celdas vacías y elegir una al azar
  const vacias = celdas.map((valor, index) => valor === "" ? index : null).filter(i => i !== null);
  const jugada = vacias[Math.floor(Math.random() * vacias.length)];

  celdas[jugada] = 'O'; // Marcar la celda con 'O'
  document.querySelector(`.celda[data-index="${jugada}"]`).classList.add('maquina');
  turnoJugador = true;
  actualizarTablero();
  
  if (comprobarGanador('O')) {
    finRonda("¡Hipólita gana esta ronda! 👑", 'maquina');
    return;
  }
  
  if (!celdas.includes("")) {
    finRonda("¡Ronda empatada!", 'empate');
  } else {
    mensaje.textContent = "Tu turno (X)";
  }
}

// Finaliza la ronda y actualiza puntuaciones y rondas
function finRonda(mensajeTexto, ganador) {
  mensaje.textContent = mensajeTexto;
  juegoActivo = false;

  if (ganador === 'jugador') {
    puntuacionJugador++;
    rondasJugador++;
    resaltarCombinacionGanadora('X');
  } else if (ganador === 'maquina') {
    puntuacionMaquina++;
    rondasMaquina++;
    resaltarCombinacionGanadora('O');
  }

  actualizarPuntuacion();
  actualizarMarcadorRondas();
}

// ========== FUNCIONES AUXILIARES ========== //
// Comprueba si un jugador ha ganado
function comprobarGanador(jugador) {
  const combinaciones = [
    [0,1,2], [3,4,5], [6,7,8], // Filas
    [0,3,6], [1,4,7], [2,5,8], // Columnas
    [0,4,8], [2,4,6] // Diagonales
  ];
  
  // Devuelve true si alguna combinación está completa
  return combinaciones.some(combo => {
    const [a, b, c] = combo;
    return celdas[a] === jugador && celdas[b] === jugador && celdas[c] === jugador;
  });
}

// Resalta la combinación ganadora en el tablero
function resaltarCombinacionGanadora(jugador) {
  const combinaciones = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  
  const combinacionGanadora = combinaciones.find(combo => {
    const [a, b, c] = combo;
    return celdas[a] === jugador && celdas[b] === jugador && celdas[c] === jugador;
  });
  
  if (combinacionGanadora) {
    combinacionGanadora.forEach(index => {
      document.querySelector(`.celda[data-index="${index}"]`).classList.add('ganadora');
    });
  }
}

// Actualiza el contenido visual de las celdas
function actualizarTablero() {
  document.querySelectorAll('.celda').forEach((celda, index) => {
    celda.textContent = celdas[index];
  });
}

// Muestra los puntos de cada jugador
function actualizarPuntuacion() {
  document.getElementById('puntuacion-jugador').textContent = puntuacionJugador;
  document.getElementById('puntuacion-maquina').textContent = puntuacionMaquina;
}

// Muestra cuántas rondas ha ganado cada uno y decide si mostrar el resultado final
function actualizarMarcadorRondas() {
  document.getElementById('rondas-jugador').textContent = rondasJugador;
  document.getElementById('rondas-maquina').textContent = rondasMaquina;

  if (numRonda >= 3) {
    mostrarResultadoFinal();
  } else {
    numRonda++;
    setTimeout(crearTablero, 1500);
  }
}

// Muestra el resultado final de la serie de rondas
function mostrarResultadoFinal() {
  if (rondasJugador > rondasMaquina) {
    // Jugador gana
    mensaje.innerHTML = '<a href="../../trabajos/trabajo10.html" style="color: #4a752c; text-decoration: none; font-weight: bold; font-size: 24px;">¡Victoria!</a>';
    const victoriaSound = document.getElementById('victoria-sound');
    victoriaSound.currentTime = 0;
    victoriaSound.play();
  } else {
    // Máquina gana
    mensaje.innerHTML = '<a href="../../trabajos/trabajo09.html" style="color: #a0151c; text-decoration: none; font-weight: bold; font-size: 24px;">¡Derrota!</a>';
  }

  // Oculta el tablero y el botón de reinicio
  tablero.style.display = "none";
  reiniciar.style.display = "none";
}

// Reinicia toda la serie de rondas desde el principio
function reiniciarSerie() {
  rondasJugador = 0;
  rondasMaquina = 0;
  numRonda = 1;
  puntuacionJugador = 0;
  puntuacionMaquina = 0;
  tablero.style.display = "grid";
  reiniciar.style.display = "block";
  actualizarPuntuacion();
  actualizarMarcadorRondas();
  crearTablero();
}


