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

// Seleccionar elementos del DOM
const botonPublicar = document.querySelector('.btn-publicar');
const areaTexto = document.querySelector('.nueva-publicacion textarea');
const contenedorPublicaciones = document.querySelector('.cuadro.grande');

// Agregar evento al botón de publicar
botonPublicar.addEventListener('click', () => {
    // Obtener el texto del área de publicación
    const texto = areaTexto.value.trim();

    // Validar que no esté vacío
    if (texto === '') {
        alert('Por favor, escribe algo antes de publicar.');
        return;
    }

    // Crear una nueva publicación
    const nuevaPublicacion = document.createElement('div');
    nuevaPublicacion.classList.add('publicacion');

    // Agregar contenido dinámico a la publicación
    nuevaPublicacion.innerHTML = `
        <div class="btn-eliminar">🗑️</div>
        <img src="Img/image.png" alt="Usuario" class="avatar">
        <div class="contenido-publicacion">
            <h3>Jochechito</h3>
            <p>${texto}</p>
        </div>
    `;

    // Agregar la nueva publicación al contenedor (al final)
    contenedorPublicaciones.appendChild(nuevaPublicacion);

    // Limpiar el área de texto
    areaTexto.value = '';
});

// Delegar el evento de eliminación en el contenedor principal
contenedorPublicaciones.addEventListener('click', (e) => {
    // Verificar si el clic fue en un botón de eliminar
    if (e.target.classList.contains('btn-eliminar')) {
        const publicacion = e.target.closest('.publicacion'); // Buscar la publicación más cercana
        publicacion.remove(); // Eliminar la publicación del DOM
    }
});

function rellenarperfil() {
    window.location.href = 'completarperfil.html'; // Cambia 'inicio.html' por la ruta de tu interfaz de inicio
}