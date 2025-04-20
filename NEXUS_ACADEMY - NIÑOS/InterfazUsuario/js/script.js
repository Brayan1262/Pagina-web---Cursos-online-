// Vaciar el carrito cada vez que se recargue la página
localStorage.removeItem('cart');

// Inicializar el carrito vacío en localStorage
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
        total += item.price * item.quantity; // Multiplicar por la cantidad
        const purchaseItem = document.createElement('div');
        purchaseItem.classList.add('purchase-item');
        purchaseItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="product-image">
            <p>${item.name} (${item.quantity}): <strong>$${(item.price * item.quantity).toFixed(2)}</strong></p>
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
function addToCart(courseName, coursePrice, courseImage, quantity = 1) {
    const product = {
        name: courseName,
        price: coursePrice,
        image: courseImage,
        quantity: quantity // Asegurarse de que la cantidad esté definida
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


document.getElementById('cart-btn').addEventListener('click', () => {
    // Redirigir a la página de método de pago
    window.location.href = 'metodopagocursos.html';
});

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

//añadir ruta//
function addToRoute(courseName, courseImageUrl) {
    let routes = JSON.parse(localStorage.getItem('routes')) || [];
    
    // Verificar si la ruta ya existe en base al nombre
    const routeExists = routes.some(route => route.name === courseName);
 
    if (!routeExists) {
        routes.push({ name: courseName, image: courseImageUrl, progress: 0 });
        localStorage.setItem('routes', JSON.stringify(routes));
 
        Swal.fire({
            icon: 'success',
            title: 'Añadido a la ruta',
            text: `${courseName} ha sido añadido a tu ruta de aprendizaje.`,
            confirmButtonText: '¡Genial!'
        });
    } else {
        Swal.fire({
            icon: 'info',
            title: 'Ya en la ruta',
            text: `${courseName} ya está en tu ruta de aprendizaje.`,
            confirmButtonText: 'Entendido'
        });
    }
 }
 
 function loadRoutes() {
    let routes = JSON.parse(localStorage.getItem('routes')) || [];
    const container = document.getElementById('routes-container');
    container.innerHTML = ''; // Limpiamos el contenedor
 
    if (routes.length === 0) {
        container.innerHTML = '<p class="empty-message">No has añadido ningún curso a la ruta.</p>';
    } else {
        routes.forEach((route, index) => {
            container.innerHTML += `
                <div class="route-box">
                    <div class="route-content">
                        <img src="images/Icono-GuimarBot2.ico" alt="" class="route-icon">
                        <div class="route-info">
                            <h5 class="route-title">${route.name}</h5>
                            <p class="route-description">Ruta de aprendizaje </p>
                        </div>
                    </div>
                    <div class="route-progress">
                        <div class="progress">
                            <div class="progress-bar" role="progressbar" style="width: ${route.progress}%" aria-valuenow="${route.progress}" aria-valuemin="0" aria-valuemax="100">${route.progress}%</div>
                        </div>
                    </div>
                    <button class="btn-delete" onclick="removeRoute(${index})">
                        <i class="fas fa-trash-alt"></i> Eliminar
                    </button>
                </div>
            `;
        });
    }
 }
 
 
 // Función para eliminar una ruta
 function removeRoute(index) {
    let routes = JSON.parse(localStorage.getItem('routes')) || [];
    routes.splice(index, 1); // Elimina el curso en la posición 'index'
    localStorage.setItem('routes', JSON.stringify(routes)); // Actualiza localStorage
    loadRoutes(); // Recarga las rutas en la página
 }
 
 // Llamada para cargar las rutas cuando se carga la página
 loadRoutes();
  
