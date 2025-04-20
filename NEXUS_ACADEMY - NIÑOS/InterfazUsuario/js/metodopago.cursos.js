// Función para añadir un curso al carrito
function addToCart(courseName, price) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    let existingCourse = cart.find(item => item.name === courseName);

    if (existingCourse) {
        existingCourse.quantity++;
    } else {
        cart.push({ name: courseName, price: price, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartSummary(); // Actualiza el resumen del carrito
    console.log(`${courseName} añadido al carrito.`);
}

function updateCartSummary() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let total = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    let summary = cart.length > 0 ? `Total: $${total}` : "Carrito vacío.";
    document.getElementById('cart-summary').innerHTML = `<p>${summary}</p>`;
}

// Simula la obtención del total del carrito (en un sistema real, esto vendría de un servidor)
function getCartTotal() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}


// Configurar el botón de PayPal
paypal.Buttons({
    style: {
        color: 'blue',
        shape: 'pill',
        label: 'pay',
    },
    createOrder: function(data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: getCartTotal() // Obtiene el total del carrito
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            // Aquí se procesa el pago con éxito (en un sistema real, esto iría a un servidor)
            alert('Pago exitoso! Detalles de la transacción:\n' + JSON.stringify(details));
            localStorage.removeItem('cart'); // Limpia el carrito después del pago
            updateCartSummary();
        });
    },
    onError: function(err) {
        alert('Error en el pago: ' + err);
    }
}).render('#paypal-button-container');




//AGREGADO DE PRODUCTO A LISTA DE COMPRAS//

// Inicializar el carrito desde el almacenamiento local
if (!localStorage.getItem('cart')) {
    localStorage.setItem('cart', JSON.stringify([]));
 }
 let cart = JSON.parse(localStorage.getItem('cart'));
 
 // Función para actualizar la vista del carrito y el contador del icono
 function updateCartView() {
    const cartTableBody = document.getElementById("cart-items");
    const totalPriceElement = document.getElementById("total-price");

    if (!cartTableBody || !totalPriceElement) return;

    cartTableBody.innerHTML = ""; // Limpiar la tabla
    let total = 0;

    cart.forEach((item, index) => {
        total += item.price;

        // Crear fila de la tabla
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${item.image}" alt="${item.name}"> ${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td><button class="remove-item" data-index="${index}">🗑️</button></td>
        `;
        cartTableBody.appendChild(row);
    });

    // Actualizar el total
    totalPriceElement.textContent = total.toFixed(2);

    // Añadir el evento de eliminación a los botones
    const removeButtons = document.querySelectorAll(".remove-item");
    removeButtons.forEach(button => {
        button.addEventListener("click", removeFromCart);
    });
}
 
 // Función para eliminar un artículo del carrito
 function removeFromCart(event) {
    const itemIndex = event.currentTarget.dataset.index;
    cart.splice(itemIndex, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartView();
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
 
 
 // Inicializar la vista del carrito al cargar la página
 document.addEventListener('DOMContentLoaded', () => {
    updateCartView();
 });
 
 
 document.addEventListener("DOMContentLoaded", function () {
     const userBtn = document.getElementById("user-btn");
     const profile = document.querySelector(".profile");
  
     userBtn.addEventListener("click", function (event) {
        event.stopPropagation(); // Evita que el evento se propague y cierre el menú al hacer clic
        profile.classList.toggle("active");
     });
  
     document.addEventListener("click", function (event) {
        if (!profile.contains(event.target) && event.target !== userBtn) {
           profile.classList.remove("active");
        }
     });
  });



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

