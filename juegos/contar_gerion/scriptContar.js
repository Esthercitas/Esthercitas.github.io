// ============ [ VARIABLES GLOBALES ] ============ //
// Elemento de transición visual (pantalla intermedia)
const transicion = document.getElementById('transicion');
// Array con los nombres de las imágenes disponibles
const imagenes = ['amarillo', 'gris', 'marron', 'negro', 'rojo'];

// Contador de cuántos toros rojos han aparecido en la ronda actual
let conteoRojos = 0;
// Variable que guardará el intervalo de aparición de imágenes
let intervalo;
// Contador de rondas (máximo 5)
let ronda = 1;
// Puntuación del jugador (aciertos)
let puntaje = 0;
// Velocidad de aparición de las imágenes (en milisegundos)
let velocidad = 300;
// indica si el juego ha terminado
let juegoTerminado = false;
// evitar cargar el audio múltiples veces
let audioCargado = false;

// Elementos del DOM
const juego = document.getElementById('juego');
const pregunta = document.getElementById('pregunta');
const continuar = document.getElementById('continuar');
const resultado = document.getElementById('resultado');
const btnInicio = document.getElementById('inicio');
const modal = document.getElementById('instructions-modal');
const startGameBtn = document.getElementById('start-game-btn');
const mensajeFinal = document.getElementById('mensaje-final');
const mensajeVictoriaDerrota = document.getElementById('mensaje-victoria-derrota');
const audioVictoria = document.getElementById('audio-victoria');
const audioError = document.getElementById('audio-error');

// Objeto para los elementos de audio
// Carga los audios que se reproducen al ganar o perder
const audioElements = {
    victoria: new Audio('sounds/victoria.mp3'),
    error: new Audio('sounds/sounds_error.wav')
};

// ============ [ INICIALIZACIÓN ] ============ //
// Espera a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    // Oculta ciertos elementos al inicio
    btnInicio.style.display = 'none';
    pregunta.style.display = 'none';
    continuar.style.display = 'none';
    transicion.style.opacity = 0;
    modal.style.display = 'flex';
    
    // Al hacer clic en "Empezar", se oculta el modal y se muestra el botón de inicio
    startGameBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        btnInicio.style.display = 'inline-block';
    });
});

// ============ [ FUNCIONES DEL JUEGO ] ============ //
// Inicia el juego cuando se hace clic en el botón "inicio"
btnInicio.addEventListener('click', () => {
    ronda = 1;
    puntaje = 0;
    velocidad = 300;
    juegoTerminado = false;
    // Oculta elementos de estado anterior
    btnInicio.style.display = 'none';
    mensajeFinal.style.display = 'none';
    iniciarRonda();
});

// Inicia una nueva ronda
function iniciarRonda() {
    // Limpia el contenido anterior
    juego.innerHTML = '';
    conteoRojos = 0;
    pregunta.style.display = 'none';
    continuar.style.display = 'none';
    resultado.textContent = '';
    // Muestra texto de transición con el número de ronda
    transicion.textContent = `Preparados para la ronda ${ronda}...`;
    transicion.style.opacity = 1;

    // Espera un momento antes de empezar a mostrar imágenes
    setTimeout(() => {
        transicion.style.opacity = 0;
        // Inicia el intervalo para mostrar imágenes aleatorias
        intervalo = setInterval(crearImagen, velocidad);
    
        // Finaliza la aparición de imágenes después de 6 segundos
        setTimeout(() => {
            clearInterval(intervalo);

            // Muestra la pregunta después de medio segundo
            setTimeout(() => {
                juego.innerHTML = '';
                pregunta.style.display = 'block';
                document.getElementById('textoPregunta').textContent = `Ronda ${ronda}: ¿Cuántos toros rojos viste?`;
            }, 500);
        }, 6000);
    }, 1500);
}

// Crea una imagen aleatoria y la posiciona en la pantalla
function crearImagen() {
    const elemento = document.createElement('img');
    elemento.classList.add('elemento-imagen');

    // Selecciona una imagen al azar del array
    const imagenAleatoria = imagenes[Math.floor(Math.random() * imagenes.length)];
    elemento.src = `images/${imagenAleatoria}.png`;
    elemento.alt = `Imagen ${imagenAleatoria}`;

    // Aumenta el contador si la imagen es roja
    if (imagenAleatoria === 'rojo') conteoRojos++;

    // Posición aleatoria en la pantalla
    elemento.style.top = Math.random() * (juego.clientHeight - 30) + 'px';
    elemento.style.left = Math.random() * (juego.clientWidth - 30) + 'px';

    // Añade la imagen al contenedor
    juego.appendChild(elemento);

    // Elimina la imagen después de 800 ms
    setTimeout(() => {
        if (juego.contains(elemento)) juego.removeChild(elemento);
    }, 800);
}

// Verifica la respuesta del usuario
function verificarRespuesta() {
    // Cargar audio la primera vez que el usuario interactúa
    if (!audioCargado) {
        audioCargado = true;
        // Precargar los sonidos
        audioElements.victoria.load();
        audioElements.error.load();
    }

    // Obtiene la respuesta del input
    const respuesta = parseInt(document.getElementById('respuesta').value);
    // Verifica si es correcta
    if (respuesta === conteoRojos) {
        resultado.textContent = '✅ ¡Correcto!';
        resultado.style.color = 'green';
        resultado.classList.add('correcto');
        resultado.classList.remove('incorrecto');
        puntaje++;
    } else {
        resultado.textContent = `❌ Incorrecto. Había ${conteoRojos} toros rojos.`;
        resultado.style.color = 'red';
        resultado.classList.add('incorrecto');
        resultado.classList.remove('correcto');
    }
    
    continuar.style.display = 'inline-block';
    
    // Si es la última ronda, se muestra el resultado final
    if (ronda === 5) {
        juegoTerminado = true;
        mensajeFinal.style.display = 'block';
        
        if (puntaje >= 3) {
            // Si gana, reproduce sonido y muestra mensaje de victoria
            audioElements.victoria.play().catch(e => {
                console.error("Error al reproducir victoria.mp3:", e);
                
            });
            mensajeVictoriaDerrota.innerHTML = '<span style="color: green; font-weight: bold;">¡Victoria! </span><a href="../../trabajos/trabajo11.html" style="color: green;">Continuar</a>';
        } else {
            // Si pierde, reproduce sonido y muestra mensaje de derrota
            audioElements.error.play().catch(e => {
                console.error("Error al reproducir sounds_error.wav:", e);
            
            });
            mensajeVictoriaDerrota.innerHTML = '<span style="color: red; font-weight: bold;">¡Derrota! </span><a href="../../trabajos/trabajo10.html" style="color: red;">Volver</a>';
        }
    }
}

// Pasa a la siguiente ronda o reinicia el juego si ya terminó
function siguienteRonda() {
    if (!juegoTerminado) {
        ronda++;
        if (ronda <= 5) {
            velocidad -= 50; // Aumenta la dificultad haciendo el juego más rápido
            iniciarRonda();
            document.getElementById('respuesta').value = '';
            resultado.classList.remove('correcto', 'incorrecto');
        }
    } else {
        // Reiniciar el juego si ya terminó
        btnInicio.style.display = 'inline-block';
        btnInicio.textContent = 'Jugar otra vez';
        pregunta.style.display = 'none';
    }
}