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
document.addEventListener('DOMContentLoaded', function() {
    // ID del usuario, esto normalmente lo tomarías del token o de la sesión
    const id = 22; // Ejemplo: el ID del usuario autenticado
    
    // Función para verificar el plan del usuario
    function verificarPlan() {
        fetch(`http://localhost:3030/verificar-plan/${id}`) // Corregido el uso de comillas en la URL
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const plan = data.plan;

                    // Mostrar/ocultar botones según el plan del usuario
                    if (plan === 'basico') {
                        document.getElementById('start-btn').style.display = 'inline-block'; // Muestra el botón para empezar
                        document.getElementById('cert-btn').style.display = 'inline-block'; // Oculta el botón de certificado
                        document.getElementById('video1').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video2').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video3').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video4').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video5').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video6').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video7').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video8').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video9').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video10').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video11').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                        document.getElementById('video12').onclick = function () {
                            location.href = 'video.html'; // Permitir acceso al video
                        };
                    } else {
                        // Si el plan no es básico, habilitar los botones pero deshabilitar el acceso
                        document.getElementById('start-btn').style.display = 'block';
                        document.getElementById('cert-btn').style.display = 'block';
                        document.getElementById('video1').style.display = 'block';
                        document.getElementById('video2').style.display = 'block';
                        document.getElementById('video3').style.display = 'block';
                        document.getElementById('video4').style.display = 'block';
                        document.getElementById('video5').style.display = 'block';
                        document.getElementById('video6').style.display = 'block';
                        document.getElementById('video7').style.display = 'block';
                        document.getElementById('video8').style.display = 'block';
                        document.getElementById('video9').style.display = 'block';
                        document.getElementById('video10').style.display = 'block';
                        document.getElementById('video11').style.display = 'block';
                        document.getElementById('video12').style.display = 'block';
                        // Mostrar mensaje de advertencia
                        document.getElementById('start-btn').onclick = function() {
                            alert('Para acceder al curso, debe tener un plan básico.');
                        };
                        document.getElementById('cert-btn').onclick = function() {
                            alert('Para obtener el certificado, debe tener un plan básico.');
                        };
                        document.getElementById('video1').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video2').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video3').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video4').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video5').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video6').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video7').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video8').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video9').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video10').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video11').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                        document.getElementById('video12').onclick = function (event) {
                            event.preventDefault(); // Evita que el clic redirija a otra página
                            alert('Para ver el video, debe tener un plan básico.');
                        };
                    }
                } else {
                    console.error('Error al obtener el plan del usuario:', data.message);
                }
            })
            .catch(err => {
                console.error('Error al hacer la solicitud:', err);
            });
    }

    // Llamar a la función de verificación cuando la página se cargue
    verificarPlan();
});

