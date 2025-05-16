document.addEventListener('DOMContentLoaded', () => { 
    // Obtener referencias a los elementos del DOM
    const board = document.getElementById('board');
    const movesDisplay = document.getElementById('moves');
    const timerDisplay = document.getElementById('timer');
    const resetButton = document.getElementById('reset-btn');
    const startButton = document.getElementById('start-game-btn');
    const gameContainer = document.querySelector('.game-container');
    const modal = document.getElementById('instructions-modal');

    // Crear un elemento para mostrar el resultado del juego
    const resultDisplay = document.createElement('div');
    resultDisplay.classList.add('result');
    gameContainer.appendChild(resultDisplay);

    // Variables del juego
    let cards = [];
    let hasFlippedCard = false;
    let lockBoard = false;
    let firstCard, secondCard;
    let moves = 0;
    let matchedPairs = 0;
    let timer = 50; // tiempo inicial
    let timerInterval;
    const totalPairs = 8; // número total de parejas a encontrar

    // Array con las rutas de las imágenes de las cartas
    const images = [
        'images/manzana.png',
        'images/pera.png',
        'images/platano.png',
        'images/sandia.png',
        'images/melocoton.png',
        'images/fresa.png',
        'images/kiwi.png',
        'images/pinia.png'
    ];

    // Sonidos
    const sounds = {
        click: new Audio('sounds/click.wav'),
        right: new Audio('sounds/right.wav'),
        wrong: new Audio('sounds/wrong.wav'),
        win: new Audio('sounds/win.wav'),
        lose: new Audio('sounds/lose.wav')
    };

    // Función para iniciar el juego
    function initGame() {
        resetGame(); // Reinicia el estado del juego
        createBoard(); // Crea y muestra las cartas
        startTimer(); // Inicia el temporizador
        resultDisplay.textContent = ''; // Limpia el resultado anterior
    }

    // Crear el tablero
    function createBoard() {
        const cardContents = [...images, ...images]; // Duplicar imágenes para formar parejas
        cardContents.sort(() => Math.random() - 0.5); // Mezclar aleatoriamente

        cardContents.forEach((content, index) => {
            const card = document.createElement('div');
            card.classList.add('card');
            card.dataset.content = content;
            card.dataset.index = index;
            
            const img = document.createElement('img');
            img.src = content;
            img.classList.add('card-image');
            img.style.display = 'none'; // Ocultar imagen al inicio
            card.appendChild(img);
            
            card.addEventListener('click', flipCard); // Agrega evento de click
            board.appendChild(card);
            cards.push(card); // Guarda la carta en el array
        });
    }

    // Girar carta
    function flipCard() {
        // Evita acciones si el tablero está bloqueado o si se hace clic en la misma carta
        if (lockBoard || this === firstCard || this.classList.contains('matched')) return;
        
        // Reproduce el sonido de clic y muestra la imagen
        sounds.click.currentTime = 0;
        sounds.click.play();
        this.classList.add('flipped');
        this.querySelector('.card-image').style.display = 'block';

        // Si es la primera carta girada
        if (!hasFlippedCard) {
            hasFlippedCard = true;
            firstCard = this;
            return;
        }
        
        // Segunda carta girada
        secondCard = this;
        moves++; // Incrementa los movimientos
        movesDisplay.textContent = `Movimientos: ${moves}`;
        checkForMatch(); // Verifica si hay coincidencia
    }

    // Verificar coincidencia
    function checkForMatch() {
        const isMatch = firstCard.dataset.content === secondCard.dataset.content;
        
        if (isMatch) {
            sounds.right.currentTime = 0;
            sounds.right.play();
            disableMatchedCards(); // Marca las cartas como emparejadas
            matchedPairs++;
            // Si se emparejaron todas las cartas, finaliza el juego
            if (matchedPairs === totalPairs) {
                endGame(true);
            }
        } else {
            sounds.wrong.currentTime = 0;
            sounds.wrong.play();
            unflipCards(); // Gira las cartas de nuevo
        }
    }

    // Deshabilitar cartas emparejadas
    function disableMatchedCards() {
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        resetBoard(); // Restablece variables de control
    }

    // Girar cartas no coincidentes
    function unflipCards() {
        lockBoard = true; // Bloquea el tablero temporalmente
        
        // Espera 1 segundo antes de girar
        setTimeout(() => {
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            firstCard.querySelector('.card-image').style.display = 'none';
            secondCard.querySelector('.card-image').style.display = 'none';
            resetBoard();
        }, 1000);
    }

    // Reiniciar estado del tablero
    function resetBoard() {
        [hasFlippedCard, lockBoard] = [false, false];
        [firstCard, secondCard] = [null, null];
    }

    // Inicia y gestiona el temporizador
    function startTimer() {
        timer = 50;
        timerDisplay.textContent = `Tiempo: ${timer}s`;
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            timer--;
            timerDisplay.textContent = `Tiempo: ${timer}s`;
            
            // Si el tiempo se acaba, termina el juego con derrota
            if (timer <= 0) {
                clearInterval(timerInterval);
                endGame(false);
            }
        }, 1000);
    }

    // Finalizar juego
    function endGame(isWinner) {
        clearInterval(timerInterval);
        const timeSpent = 50 - timer; // Calcula el tiempo usado (50s iniciales - tiempo restante)
        
        if (isWinner) {
            sounds.win.currentTime = 0;
            sounds.win.play();
            resultDisplay.innerHTML = `
                ¡Felicidades!<br>
                Completaste el juego en ${moves} movimientos.<br>
                Tiempo invertido: ${timeSpent} segundos.<br>
                <a href="../../trabajos/trabajo12.html">Continuar</a>
            `;
        } else {
            sounds.lose.currentTime = 0;
            sounds.lose.play();
            resultDisplay.innerHTML = `
                ¡Perdiste!<br>
                Movimientos realizados: ${moves}.<br>
                
                <a href="../../trabajos/trabajo11.html">Volver</a>
            `;
        }
    }

    // Reiniciar juego
    function resetGame() {
        board.innerHTML = ''; // Limpia el tablero
        cards = [];
        hasFlippedCard = lockBoard = false;
        firstCard = secondCard = null;
        moves = matchedPairs = 0;
        movesDisplay.textContent = 'Movimientos: 0';
        timerDisplay.textContent = 'Tiempo: 0s';
        clearInterval(timerInterval); // Detiene el temporizador si está activo
    }

    // Eventos
    startButton.addEventListener('click', () => {
        modal.style.display = 'none'; // Oculta las instrucciones
        gameContainer.style.display = 'block'; // Muestra el juego
        initGame();
    });

    // Evento para reiniciar el juego desde el botón de reinicio
    resetButton.addEventListener('click', initGame);

    // Precarga de sonidos
    Object.values(sounds).forEach(sound => sound.load());
});