// ============ [ CONFIGURACIÓN INICIAL ] ============ //
// Objeto que representa al personaje Heracles
const heracles = {
    name: "Heracles",
    maxHp: 1000, // Vida máxima
    ps: 1000, // Puntos de salud actuales
    attacks: [
        { name: "Furia de Nemea", damage: 40 },
        { name: "Flechas de Hidra", damage: 35 },
        { name: "Fuerza Olímpica", damage: 60 },
        { name: "Terremoto colosal", damage: 70 }
    ]
};

// Objeto que representa al enemigo
const leonNemea = {
    name: "Cerbero",
    maxHp: 1000,
    ps: 1000,
    attacks: [
        { name: "Triple Mordisco", damage: 40 },
        { name: "Aliento del Inframundo", damage: 30 },
        { name: "Guardian de las Puertas", damage: 100 },
        { name: "Aullido Aterrador", damage: 55 }
    ]
}; 

// ============ [ VARIABLES GLOBALES ] ============ //
let currentPlayer = "player"; // Turno actual
let potions = 5; // Cantidad de pociones
let gameActive = false; // Indica si la batalla está activa

// Sonidos del juego
const sounds = {
    hit: new Audio('sounds/golpe.mp3'),
    win: new Audio('sounds/victoria.mp3')
};

// ============ [ INICIALIZACIÓN ] ============ //
document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('start-battle-btn');
    const gameContainer = document.querySelector('.game-container');
    const modal = document.getElementById('instructions-modal');
    
    // Precarga sonidos
    sounds.hit.load();
    sounds.win.load();
    
    // Empieza la batalla al hacer clic en el botón
    startButton.addEventListener('click', () => {
        modal.style.display = 'none'; // Oculta las instrucciones
        gameContainer.style.display = 'block'; // Muestra el juego
        gameActive = true; // Activa el juego
        startBattle(); // Inicia la batalla
    });
});

// ============ [ FUNCIONES DEL JUEGO ] ============ //
// Comienza la batalla reiniciando el log y actualizando las barras de vida
function startBattle() {
    clearLog();
    addToLog("¡Comienza el combate!");
    updateHpBars();
}

// Actualiza las barras de puntos de salud en la interfaz
function updateHpBars() {
    // Jugador
    const playerHpFill = document.getElementById("player-ps");
    const playerHpText = document.getElementById("player-ps-text");
    const playerHpPercent = (heracles.ps / heracles.maxHp) * 100;
    
    playerHpFill.style.width = `${playerHpPercent}%`;
    playerHpText.textContent = `${heracles.ps} / ${heracles.maxHp} PS`;
    
    // Actualizar clases de color (jugador)
    playerHpFill.classList.remove('medium', 'low');
    if (playerHpPercent <= 25) {
        playerHpFill.classList.add('low');
    } else if (playerHpPercent <= 50) {
        playerHpFill.classList.add('medium');
    }

    // Enemigo
    const enemyHpFill = document.getElementById("enemy-ps");
    const enemyHpText = document.getElementById("enemy-ps-text");
    const enemyHpPercent = (leonNemea.ps / leonNemea.maxHp) * 100;
    
    enemyHpFill.style.width = `${enemyHpPercent}%`;
    enemyHpText.textContent = `${leonNemea.ps} / ${leonNemea.maxHp} PS`;
    
    // Actualizar clases de color (enemigo)
    enemyHpFill.classList.remove('medium', 'low');
    if (enemyHpPercent <= 25) {
        enemyHpFill.classList.add('low');
    } else if (enemyHpPercent <= 50) {
        enemyHpFill.classList.add('medium');
    }
}

// Limpia el registro de eventos del combate
function clearLog() {
    document.getElementById("battle-log").innerHTML = '';
}

// Añade un mensaje al log del combate
function addToLog(message) {
    const log = document.getElementById("battle-log");
    const logEntry = document.createElement("p");
    logEntry.textContent = message;
    log.appendChild(logEntry);
    log.scrollTop = log.scrollHeight;
}

// Activa una animación CSS temporalmente
function triggerAnimation(element, animationClass) {
    element.classList.remove(animationClass);
    void element.offsetWidth;
    element.classList.add(animationClass);
    element.addEventListener('animationend', () => {
        element.classList.remove(animationClass);
    }, { once: true });
}

// Acción de ataque del jugador
function playerAttack(attackIndex) {
    if (!gameActive || currentPlayer !== "player") return;

    // Reproduce sonido de golpe
    sounds.hit.currentTime = 0;
    sounds.hit.play();

    triggerAnimation(document.querySelector('.player img'), 'attacking');
    
    setTimeout(() => {
        const attack = heracles.attacks[attackIndex];
        leonNemea.ps -= attack.damage;
        addToLog(`¡${heracles.name} usa ${attack.name}! Causa ${attack.damage} de daño.`);
        updateHpBars();

        // Efecto de daño al enemigo
        triggerAnimation(document.querySelector('.enemy .ps-fill'), 'taking-damage');

        // Verifica si el enemigo fue derrotado
        if (leonNemea.ps <= 0) {
            leonNemea.ps = 0;
            gameActive = false;
            addToLog(`¡${leonNemea.name} fue derrotado! ¡${heracles.name} gana!`);
            updateHpBars();
            showVictory();
            return;
        }
        
        switchTurn(); // Cambia el turno
    }, 400); // Espera para sincronizar animación
}

// Acción de ataque del enemigo
function enemyAttack() {
    if (!gameActive || currentPlayer !== "enemy") return;

    sounds.hit.currentTime = 0;
    sounds.hit.play();

    triggerAnimation(document.querySelector('.enemy img'), 'attacking');
    
    setTimeout(() => {
        const attackIndex = Math.floor(Math.random() * leonNemea.attacks.length);
        const attack = leonNemea.attacks[attackIndex];
        heracles.ps -= attack.damage;
        addToLog(`¡${leonNemea.name} usa ${attack.name}! Causa ${attack.damage} de daño.`);
        updateHpBars();

        // Efecto de daño al jugador
        triggerAnimation(document.querySelector('.player .ps-fill'), 'taking-damage');

        // Verifica si Heracles fue derrotado
        if (heracles.ps <= 0) {
            heracles.ps = 0;
            gameActive = false;
            addToLog(`¡${heracles.name} fue derrotado! ¡${leonNemea.name} gana!`);
            updateHpBars();
            showDefeat();
            return;
        }
        
        switchTurn(); // Cambia el turno
    }, 400);
}

// Muestra el mensaje y efectos de victoria
function showVictory() {
    sounds.win.play();
    const enemyArea = document.querySelector('.enemy');
    enemyArea.classList.add('enemy-defeated');
    
    const victoryLink = document.createElement('a');
    victoryLink.href = '../../trabajos/victoria.html';
    victoryLink.className = 'victory-message'; 
    victoryLink.textContent = 'VICTORIA';
    enemyArea.appendChild(victoryLink);
}

// Muestra el mensaje y efectos de derrota
function showDefeat() {
    const playerArea = document.querySelector('.player');
    playerArea.classList.add('player-defeated');
    
    const defeatLink = document.createElement('a');
    defeatLink.href = '../../trabajos/derrota.html';
    defeatLink.className = 'defeat-message';
    defeatLink.textContent = 'DERROTA';
    playerArea.appendChild(defeatLink);
}

// Permite al jugador usar una poción si tiene y necesita
function usePotion() {
    if (!gameActive || currentPlayer !== "player") return;
    
    if (potions <= 0) {
        addToLog("¡No te queda Ambrosía Sagrada!");
        return;
    }

    if (heracles.ps >= heracles.maxHp) {
        addToLog("¡La vida de Heracles ya está al máximo!");
        return;
    }

    // Suma 20 PS pero no supera el máximo
    heracles.ps = Math.min(heracles.ps + 20, heracles.maxHp);
    potions--;
    document.getElementById("potion-count").textContent = `(${potions} restantes)`;
    addToLog("¡Usaste una Ambrosía Sagrada! Heracles recupera 20 PS.");
    updateHpBars();
    switchTurn();
}

// Cambia el turno entre jugador y enemigo
function switchTurn() {
    currentPlayer = currentPlayer === "player" ? "enemy" : "player";
    if (currentPlayer === "enemy" && gameActive) {
        setTimeout(enemyAttack, 1000); // Espera antes de que el enemigo ataque
    }
}