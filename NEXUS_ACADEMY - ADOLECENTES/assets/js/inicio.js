document.addEventListener("DOMContentLoaded", function() {
    // Función de toggle para el icono de favorito
    function toggleFavorite(element) {
        element.classList.toggle('active');
    }
    
    // Asigna la función de favorito a cada elemento con clase 'favorite-icon'
    const favoriteIcons = document.querySelectorAll('.favorite-icon');
    favoriteIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            toggleFavorite(this);
        });
    });
    
    // Función para añadir un curso al carrito
    function addToCart(course) {
        const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        
        // Agregar el nuevo curso al carrito
        cartItems.push(course);
        
        // Guardar el carrito actualizado en localStorage
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        
        alert("Curso añadido al carrito!");
    }

    // Selecciona todos los botones de "Añadir al carrito" y agrega el evento
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            // Obtener la información del curso desde los atributos data
            const course = {
                id: button.getAttribute("data-id"),
                title: button.getAttribute("data-title"),
                price: parseFloat(button.getAttribute("data-price")),
                image: button.getAttribute("data-image")
            };
            addToCart(course); // Llamar a la función de agregar al carrito
        });
    });
});


document.querySelectorAll(".add-button").forEach(button => {
    button.addEventListener("click", () => {
        const course = {
            title: button.getAttribute("data-title") // Solo el título
        };

        showAddToRouteModal(course); // Mostrar el modal para agregar el curso
    });
});

// Seleccionamos los elementos
const perfil = document.getElementById('perfil');
const profileMenu = document.getElementById('profile-menu');
const box = document.getElementById("box");
const notificaciones = document.querySelector('.notificaciones');

// Cuando se haga clic en el perfil, mostramos/ocultamos el menú
perfil.addEventListener('click', (event) => {
    event.stopPropagation(); // Evita que el clic se propague y cierre las notificaciones
    // Si el menú está oculto, lo mostramos y cerramos las notificaciones
    if (profileMenu.style.display === 'none' || profileMenu.style.display === '') {
        profileMenu.style.display = 'block';
        box.style.display = 'none'; // Cerramos las notificaciones cuando se abre el menú
    } else {
        // Si está visible, lo ocultamos
        profileMenu.style.display = 'none';
    }
});

// Si se hace clic fuera del menú del perfil o de las notificaciones, lo cerramos
document.addEventListener('click', (e) => {
    if (!perfil.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.style.display = 'none';
    }
    if (!notificaciones.contains(e.target) && !box.contains(e.target)) {
        box.style.opacity = '0';
        setTimeout(() => {
            box.style.display = 'none';
        }, 300); // Espera un poco antes de ocultarlas completamente
    }
});

// Función para abrir y cerrar las notificaciones
function toggleNotifications(event) {
    event.stopPropagation(); // Evita que el clic se propague y cierre el menú del perfil
    if (box.style.display === 'none' || box.style.display === '') {
        // Si las notificaciones están ocultas, las mostramos y cerramos el menú del perfil
        box.style.display = 'block';
        setTimeout(() => {
            box.style.opacity = '1'; // Se hace visible con opacidad
        }, 10);
        profileMenu.style.display = 'none'; // Cerramos el menú del perfil cuando se abren las notificaciones
    } else {
        // Si las notificaciones están visibles, las ocultamos
        box.style.opacity = '0';
        setTimeout(() => {
            box.style.display = 'none';
        }, 300); // Espera un poco antes de ocultarlas completamente
    }
}

// Evento para abrir o cerrar las notificaciones al hacer clic en el icono
notificaciones.addEventListener("click", toggleNotifications);

function toggleVentana() {
    const ventanaFlotante = document.getElementById('ventana-flotante');
    ventanaFlotante.classList.toggle('active'); // Muestra u oculta la ventana
}

function showPlans(planType) {
    const mensual = document.getElementById("plan-mensual");
    const anual = document.getElementById("plan-anual");
    const tabButtons = document.querySelectorAll(".tab-button");

    if (planType === 'mensual') {
        mensual.classList.add("active");
        anual.classList.remove("active");
        tabButtons[0].classList.add("active");
        tabButtons[1].classList.remove("active");
    } else if (planType === 'anual') {
        anual.classList.add("active");
        mensual.classList.remove("active");
        tabButtons[0].classList.remove("active");
        tabButtons[1].classList.add("active");
    }
}

function irInicio() {
    window.location.href = 'interfaz.html'; // Cambia 'inicio.html' por la ruta de tu interfaz de inicio
}

