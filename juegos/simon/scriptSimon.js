// Se obtienen referencias a elementos del DOM: marcador de ronda, botones del juego y botón de inicio
const round = document.getElementById('round');
const simonButtons = document.getElementsByClassName('square');
const startButton = document.getElementById('startButton');

// Definición de la clase Simon, que contiene toda la lógica del juego
class Simon { 
    constructor(simonButtons, startButton, round) {
        // Estado inicial del juego
        this.round = 0; // ronda actual
        this.userPosition = 0; // posición del jugador en la secuencia
        this.totalRounds = 8; // número total de rondas que hay que superar
        this.sequence = []; // secuencia generada por el juego
        this.speed = 800; // velocidad inicial con la que se muestran los botones
        this.blockedButtons = true; // flag para bloquear los botones cuando no es turno del jugador
        
        // Conversión de HTMLCollection a array para facilitar el uso de métodos como forEach
        this.buttons = Array.from(simonButtons);
        // Agrupación de elementos de la interfaz
        this.display = {
            startButton,
            round
        }
        // Sonido al fallar
        this.errorSound = new Audio('sounds/sounds_error.wav');

        // Array con sonidos correspondientes a cada botón del juego
        this.buttonSounds = [
            new Audio('sounds/sounds_1.mp3'),
            new Audio('sounds/sounds_2.mp3'),
            new Audio('sounds/sounds_3.mp3'),
            new Audio('sounds/sounds_4.mp3'),
            new Audio('sounds/sounds_5.mp3'),
            new Audio('sounds/sounds_6.mp3'),
            new Audio('sounds/sounds_7.mp3'),
            new Audio('sounds/sounds_8.mp3'),
            new Audio('sounds/sounds_9.mp3')
        ];

        // Sonido que se reproduce al ganar
        this.victorySound = new Audio('sounds/victoria.mp3');
        
        // Botón de rendirse
        this.giveUpBtn = document.getElementById('giveUpBtn');
        this.giveUpBtn.onclick = () => this.giveUp(); // evento al hacer click
    }

    // Inicializa el juego cuando se hace clic en el botón de inicio
    init() {
        this.display.startButton.onclick = () => this.startGame();
    }

    // Comienza una nueva partida
    startGame() {
        this.display.startButton.disabled = true; // desactiva el botón de inicio
        this.updateRound(0); // reinicia la ronda
        this.userPosition = 0;
        this.sequence = this.createSequence(); // genera una nueva secuencia

        // Limpia clases y asigna eventos de clic a los botones
        this.buttons.forEach((element, i) => {
            element.classList.remove('winner');
            element.onclick = () => this.buttonClick(i);
        });

        this.showSequence(); // muestra la secuencia generada
    }

    // Actualiza el número de ronda mostrado en pantalla
    updateRound(value) {
        this.round = value;
        this.display.round.textContent = `Ronda ${this.round}`;
    }

    // Crea una secuencia aleatoria de colores (botones)
    createSequence() {
        return Array.from({length: this.totalRounds}, () => this.getRandomColor());
    }

    // Genera un número aleatorio del 0 al 8 (para 9 botones)
    getRandomColor() {
        return Math.floor(Math.random() * 9);
    }

    // Lógica cuando el usuario pulsa un botón
    buttonClick(value) {
        if (!this.blockedButtons) {
            this.validateChosenColor(value);
        }
    }

    // Verifica si el botón pulsado coincide con la secuencia
    validateChosenColor(value) {
        if (this.sequence[this.userPosition] === value) {
            this.buttonSounds[value].play(); // sonido correcto

            if (this.round === this.userPosition) {
                this.updateRound(this.round + 1); // avanza de ronda
                this.speed = Math.max(500, this.speed * 0.95); // aumenta la dificultad
                this.isGameOver(); // revisa si el juego ha terminado
            } else {
                this.userPosition++; // pasa al siguiente botón en la secuencia
            }
        } else {
            this.gameLost(); // si falla, termina el juego
        }
    }

    // Verifica si se ha alcanzado la última ronda
    isGameOver() {
        if (this.round === this.totalRounds) {
            this.gameWon(); // si se completaron todas las rondas
        } else {
            this.userPosition = 0; // reinicia la posición del jugador
            this.showSequence(); // muestra la nueva secuencia ampliada
        }
    }

    // Muestra la secuencia de botones iluminándolos uno a uno
    showSequence() {
        this.blockedButtons = true; // bloquea los botones durante la animación
        let sequenceIndex = 0;

        // Reproduce cada botón de la secuencia con un intervalo
        let timer = setInterval(() => {
            const button = this.buttons[this.sequence[sequenceIndex]];
            this.buttonSounds[this.sequence[sequenceIndex]].play();
            this.toggleButtonStyle(button); // activa visualmente
            setTimeout(() => this.toggleButtonStyle(button), this.speed / 2); // desactiva
            sequenceIndex++;
            if (sequenceIndex > this.round) {
                this.blockedButtons = false; // desbloquea después de mostrar la secuencia
                clearInterval(timer); // detiene el intervalo
            }
        }, this.speed);
    }

    // Alterna la clase 'active' para mostrar efecto visual
    toggleButtonStyle(button) {
        button.classList.toggle('active');
    }

    // Se llama cuando el usuario falla
    gameLost() {
        this.errorSound.play();
        this.display.startButton.disabled = false; 
        this.blockedButtons = true;
        alert(`¡Perdiste! Llegaste a la ronda ${this.round}`);
    }

    // Se llama cuando el usuario gana el juego
    gameWon() {
        this.victorySound.play();
        this.display.startButton.disabled = false; 
        this.blockedButtons = true;
        
        // Crea un mensaje de victoria como enlace a otra página
        const victoryLink = document.createElement('a');
        victoryLink.href = '../../trabajos/trabajo03.html';
        victoryLink.className = 'victory-message';
        victoryLink.textContent = '¡GANASTE! 🏆';
        document.querySelector('.game-container-simon').appendChild(victoryLink);
        
        this.updateRound('');
    }

    // Permite al jugador rendirse
    giveUp() {
        if (confirm("¿Seguro que quieres rendirte?")) {
            window.location.href = "../../trabajos/trabajo02.html"; // redirige a otra página
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('instructions-modal');
    const startSimonBtn = document.getElementById('startSimonBtn');
    
    modal.style.display = 'flex'; // muestra las instrucciones
    
    // Oculta el modal y lanza el juego al hacer clic en el botón
    startSimonBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        const simon = new Simon(simonButtons, startButton, round);
        simon.init();
    });
});