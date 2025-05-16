// Secuencia correcta que el usuario debe reproducir 
const correctSequence = ['do', 'do', 'sol', 'sol', 'la', 'la', 'sol', 'fa', 'fa', 'mi', 'mi', 're', 're', 'do'];

// Variables del juego
let userSequence = []; // Secuencia ingresada por el usuario
let gameStarted = false; // Indica si el usuario ya empezó a tocar
let timeLeft = 120; // Tiempo total en segundos (2 minutos)
let timerInterval; // Variable para el intervalo del temporizador
let gameActive = false; // Indica si el juego está activo

// Elementos del DOM
const messageEl = document.getElementById('message'); // Elemento donde se muestran mensajes
const progressBar = document.getElementById('progress'); // Barra de progreso visual
const noteButtons = document.querySelectorAll('.note-btn'); // Botones de notas musicales
const timerEl = document.getElementById('timer'); // Temporizador en pantalla
const victorySound = document.getElementById('victorySound'); // Sonido al ganar
const errorSound = document.getElementById('errorSound'); // Sonido al fallar
const startGameBtn = document.getElementById('start-game-btn'); // Botón para comenzar el juego
const gameContainer = document.querySelector('.game-container'); // Contenedor principal del juego
const modal = document.getElementById('instructions-modal'); // Modal de instrucciones
const yeguasImage = document.getElementById('yeguas-image'); // Imagen que cambia según el resultado

// Inicialización del juego
document.addEventListener('DOMContentLoaded', () => {
    // Precarga de sonidos
    victorySound.load();
    errorSound.load();
    
    // Iniciar el juego al hacer clic en el botón
    startGameBtn.addEventListener('click', () => {
        modal.style.display = 'none'; // Oculta el modal de instrucciones
        gameContainer.style.display = 'block'; // Muestra el juego
        gameActive = true; // Marca el juego como activo
        resetGame(); // Reinicia los valores iniciales
    });
});

// Función para reiniciar el juego
function resetGame() {
    userSequence = []; // Vaciar secuencia del usuario
    gameStarted = false;
    timeLeft = 120; // Reiniciar tiempo
    updateProgress(); // Reiniciar barra de progreso
    messageEl.textContent = "Presiona cualquier nota para comenzar";
    messageEl.innerHTML = messageEl.textContent; // Eliminar cualquier enlace anterior
    yeguasImage.src = "images/yeguas-nerviosas.png"; // Resetear imagen
    startTimer(); // Iniciar el temporizador
    
    // Habilitar todos los botones
    noteButtons.forEach(button => {
        button.disabled = false;
    });
}

// Función para actualizar el temporizador
function updateTimer() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        gameOver(false); // El tiempo se ha agotado => derrota
    }
    timeLeft--;
}

// Función para iniciar el temporizador
function startTimer() {
    clearInterval(timerInterval); // Limpiar temporizadores anteriores
    timeLeft = 120; 
    updateTimer();
    timerInterval = setInterval(updateTimer, 1000); // Llamar a updateTimer cada segundo
}

// Función para reproducir notas
function playNote(note) {
    let frequency;
    
    // Frecuencias aproximadas para las notas musicales (en Hz)
    switch(note) {
        case 'do': frequency = 261.63; break;
        case 're': frequency = 293.66; break;
        case 'mi': frequency = 329.63; break;
        case 'fa': frequency = 349.23; break;
        case 'sol': frequency = 392.00; break;
        case 'la': frequency = 440.00; break;
        case 'si': frequency = 493.88; break;
        case 'do2': frequency = 523.25; break;
        default: frequency = 440.00; // Nota por defecto
    }
    
    // Crear oscilador de sonido
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.5); // Duración: 0.5 segundos
}

// Función de fin de juego
function gameOver(isVictory) {
    clearInterval(timerInterval);
    gameActive = false;
    
    // Deshabilitar botones
    noteButtons.forEach(button => {
        button.disabled = true;
    });
    
    if (isVictory) {
        // Animación de transición de imagen
        yeguasImage.classList.add('fade-out');
        
        yeguasImage.addEventListener('animationend', () => {
            yeguasImage.src = "images/yeguas-calmadas.png";
            yeguasImage.classList.remove('fade-out');
            yeguasImage.classList.add('fade-in');
            
            yeguasImage.addEventListener('animationend', () => {
                yeguasImage.classList.remove('fade-in');
            }, { once: true });
        }, { once: true });
        
        // Mostrar mensaje de victoria y reproducir sonido
        messageEl.innerHTML = '<a href="../../trabajos/trabajo09.html" class="victory">¡Victoria!</a>';
        victorySound.play();
    } else {
        // Mostrar mensaje de derrota y reproducir sonido
        messageEl.innerHTML = '<a href="../../trabajos/trabajo08.html" class="defeat">¡Derrota!</a>';
        errorSound.play();
    }
} 

// Manejar clic en los botones de notas
noteButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!gameActive) return;
        
        if (!gameStarted) {
            gameStarted = true;
            messageEl.textContent = "¡Comienza! Tienes 2 minutos";
        }
        
        const note = button.dataset.note; // Obtener la nota del botón
        playNote(note); // Reproducir el sonido
        
        // Efecto visual
        button.classList.add('active');
        setTimeout(() => {
            button.classList.remove('active');
        }, 200);
        
        // Agregar nota a la secuencia del usuario
        userSequence.push(note);
        
        // Verificar si la nota actual es correcta
        if (note !== correctSequence[userSequence.length - 1]) {
            // Nota incorrecta - reiniciar
            messageEl.textContent = "¡Nota incorrecta! Sigue intentando";
            userSequence = [];
            updateProgress();
            return;
        }
        
        // Actualizar progreso
        updateProgress();
        
        // Verificar si completó la secuencia
        if (userSequence.length === correctSequence.length) {
            gameOver(true);
        }
    });
});

// Actualizar barra de progreso
function updateProgress() {
    const progress = (userSequence.length / correctSequence.length) * 100;
    progressBar.style.width = `${progress}%`;
}

// Inicializar el contexto de audio al cargar la página
const audioContext = new (window.AudioContext || window.webkitAudioContext)();