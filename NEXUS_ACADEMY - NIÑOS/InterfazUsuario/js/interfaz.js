//Seccion de
const menu= document.getElementById('menu');
const sidebar= document.getElementById('sidebar');

menu.addEventListener('click',()=> {
    sidebar.classList.toggle('menu-toggle');
    menu.classList.toggle('menu-toggle');
});

// Selección de elementos
const perfil = document.getElementById('perfile');
const profileMenu = document.getElementById('profile-menu');
const notificaciones = document.getElementById('notification-link');
const box = document.getElementById('box'); // Asegúrate de que este elemento exista en tu HTML

// Función para alternar la visibilidad del menú
function toggleMenu(menu) {
    if (menu.style.display === 'none' || menu.style.display === '') {
        menu.style.display = 'block';
    } else {
        menu.style.display = 'none';
    }
}

// Evento para abrir/cerrar el menú de perfil
perfil.addEventListener('click', (event) => {
    event.stopPropagation(); // Evita cerrar el menú al hacer clic dentro de él
    toggleMenu(profileMenu);
    if (box) {
        box.style.display = 'none'; // Oculta las notificaciones al abrir el menú de perfil
    }
});

// Evento para abrir/cerrar notificaciones
notificaciones.addEventListener('click', (event) => {
    event.stopPropagation();
    if (box) {
        toggleMenu(box);
        profileMenu.style.display = 'none'; // Oculta el menú de perfil al abrir notificaciones
    }
});

// Evento global para cerrar menús al hacer clic fuera de ellos
document.addEventListener('click', (e) => {
    if (profileMenu && !profileMenu.contains(e.target) && !perfil.contains(e.target)) {
        profileMenu.style.display = 'none';
    }
    if (box && !box.contains(e.target) && !notificaciones.contains(e.target)) {
        box.style.opacity = '0';
        setTimeout(() => {
            box.style.display = 'none';
        }, 300); // Tiempo para transición suave
    }
});


// NOTIFICACIONES
document.getElementById('notification-link').addEventListener('click', function(event) {
    event.preventDefault();

    // Obtiene la ventana de notificaciones
    var notificationPopup = document.getElementById('notification-popup');

    // Muestra u oculta la ventana de notificaciones
    if (notificationPopup.style.display === 'block') {
        notificationPopup.style.display = 'none';
    } else {
        notificationPopup.style.display = 'block';

        // Restablecer la posición al principio (por ejemplo, desplazarse al principio del contenido)
        notificationPopup.scrollTop = 0;
    }

    // Opcional: Cambiar el color del icono cuando las notificaciones se muestran
    this.classList.toggle('active');
});

// Marcar todas como leídas
document.getElementById('mark-read').addEventListener('click', function() {
    // Opcional: Cambiar el estado visual de las notificaciones a "leídas"
    var notifications = document.querySelectorAll('.notification-new');
    notifications.forEach(function(notification) {
        notification.style.display = 'none'; // Ocultar "Nuevo"
    });
});

// Selecciona todos los íconos de eliminar
const deleteIcons = document.querySelectorAll('.notification-delete');

// Agrega un evento de clic a cada ícono
deleteIcons.forEach(icon => {
    icon.addEventListener('click', function() {
        // Encuentra el elemento padre (la notificación) y elimínalo
        const notificationItem = this.parentElement;
        notificationItem.remove();
    });
});

// Cerrar el popup cuando se hace clic fuera de él
document.addEventListener('click', function(event) {
    var notificationPopup = document.getElementById('notification-popup');
    var notificationLink = document.getElementById('notification-link');

    // Verifica si el clic fue fuera del popup y del enlace de notificaciones
    if (!notificationPopup.contains(event.target) && !notificationLink.contains(event.target)) {
        notificationPopup.style.display = 'none';
        notificationLink.classList.remove('active');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Obtén los contenedores de los carruseles y los botones de desplazamiento
    const carruseles = document.querySelectorAll('.carrusel-list');
    const leftButtons = document.querySelectorAll('.scroll-left');
    const rightButtons = document.querySelectorAll('.scroll-right');
    
    // Función para mover el carrusel a la izquierda
    function moveLeft(event, carrusel) {
        event.stopPropagation(); // Detén la propagación del clic
        const scrollAmount = 200; // Ajusta el valor según el tamaño de cada tarjeta
        carrusel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }

    // Función para mover el carrusel a la derecha
    function moveRight(event, carrusel) {
        event.stopPropagation(); // Detén la propagación del clic
        const scrollAmount = 200; // Ajusta el valor según el tamaño de cada tarjeta
        carrusel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }

    // Asocia los eventos de clic para cada botón de desplazamiento
    leftButtons.forEach((button, index) => {
        button.addEventListener('click', (event) => {
            moveLeft(event, carruseles[index]);
        });
    });

    rightButtons.forEach((button, index) => {
        button.addEventListener('click', (event) => {
            moveRight(event, carruseles[index]);
        });
    });
});

function App() {}

window.onload = function(event) {
    var app = new App();
    window.app = app;
};

App.prototype.processingButton = function(event) {
    const btn = event.currentTarget;
    const carruselList = btn.closest('.carrusel-list'); // Asegúrate de encontrar el elemento padre correcto
    const track = carruselList.querySelector('#track');
    const carruselCards = track.querySelectorAll('.course-card');

    const carruselWidth = carruselCards[0].offsetWidth; // Ancho de la tarjeta
    const trackWidth = track.scrollWidth; // Total del ancho de las tarjetas
    const listWidth = carruselList.offsetWidth; // Ancho del contenedor del carrusel

    let leftPosition = track.style.left === "" ? 0 : parseFloat(track.style.left) * -1;


    if (btn.dataset.button === "button-prev") {
        prevAction(leftPosition, carruselWidth, track);
    } else {
        nextAction(leftPosition, trackWidth, listWidth, carruselWidth, track);
    }
};

let prevAction = (leftPosition, carruselWidth, track) => {
    if (leftPosition > 0) {
        track.style.left = `${-1 * (leftPosition - carruselWidth)}px`;
    }
};

let nextAction = (leftPosition, trackWidth, listWidth, carruselWidth, track) => {
    if (leftPosition < (trackWidth - listWidth)) {
        track.style.left = `${-1 * (leftPosition + carruselWidth)}px`;
    }
};