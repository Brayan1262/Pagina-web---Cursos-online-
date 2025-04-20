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

// JS DE CARRITO Y ARGEGACION DE RUTAS//

// Inicializar el carrito desde el almacenamiento local
if (!localStorage.getItem('cart')) {
   localStorage.setItem('cart', JSON.stringify([]));
}
let cart = JSON.parse(localStorage.getItem('cart'));

// Función para actualizar la vista del carrito y el contador del icono
function updateCartView() {
   const purchaseList = document.querySelector('.summary-box');

   if (!purchaseList) return; // Verifica que el contenedor exista antes de continuar

   // Vaciar el contenedor para regenerarlo
   purchaseList.innerHTML = `<h3 class="title">Lista de Compras</h3>`;

   // Total inicial en 0
   let total = 0;

   // Crear elementos de cada artículo en el carrito
   cart.forEach((item, index) => {
       total += item.price; // Sumar el precio al total
       const purchaseItem = document.createElement('div');
       purchaseItem.classList.add('purchase-item');
       purchaseItem.innerHTML = `
           <img src="${item.image}" alt="${item.name}" class="product-image">
           <p>${item.name}: <strong>$${item.price.toFixed(2)}</strong></p>
           <button class="remove-item" data-index="${index}" title="Eliminar producto"><i class="fas fa-trash"></i></button>
       `;
       purchaseList.appendChild(purchaseItem);
   });

   // Añadir el total actualizado
   purchaseList.innerHTML += `<hr><p>Total: <strong>$${total.toFixed(2)}</strong></p>`;

   // Actualizar el contador en el icono del carrito
   const cartIcon = document.getElementById('cart-btn');
   if (cartIcon) {
       cartIcon.setAttribute('data-count', cart.length);
   }

   // Añadir el evento de eliminación para cada botón de eliminar
   const removeButtons = document.querySelectorAll('.remove-item');
   removeButtons.forEach(button => {
       button.addEventListener('click', removeFromCart);
   });
}

// Función para eliminar un artículo del carrito
function removeFromCart(event) {
   const itemIndex = event.currentTarget.dataset.index; // Obtener el índice del elemento
   cart.splice(itemIndex, 1); // Eliminar el artículo del array
   localStorage.setItem('cart', JSON.stringify(cart)); // Guardar el nuevo carrito en localStorage
   updateCartView(); // Actualizar la vista del carrito
}

// Función para añadir un producto al carrito
function addToCart(courseName, coursePrice, courseImage) {
    const product = {
        name: courseName,
        price: coursePrice,
        image: courseImage
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(product);
    localStorage.setItem('cart', JSON.stringify(cart));

    // Actualizar la vista del carrito
    updateCartView();

    // Actualizar el contador de artículos en el carrito
    const cartIcon = document.getElementById('cart-btn');
    let itemCount = cart.length; // Obtener la cantidad de artículos
    cartIcon.setAttribute('data-count', itemCount); // Actualizar el atributo de conteo

    // Animación del contador
    cartIcon.classList.add('animate'); // Agregar clase para animación
    setTimeout(() => {
        cartIcon.classList.remove('animate'); // Remover la clase después de un tiempo
    }, 500); // Tiempo en milisegundos (500 ms)
}

