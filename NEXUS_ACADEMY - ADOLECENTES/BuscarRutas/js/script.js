// Función para añadir una nueva ruta
function addToRoute(courseName, courseImageUrl) {
    let routes = JSON.parse(localStorage.getItem('routes')) || [];

    // Verificar si la ruta ya existe
    const routeExists = routes.some(route => route.name === courseName);

    if (!routeExists) {
        routes.push({ name: courseName, image: courseImageUrl, progress: 0 });
        localStorage.setItem('routes', JSON.stringify(routes)); // Guardar en localStorage

        // Mostrar SweetAlert2 - Ruta añadida
        Swal.fire({
            icon: 'success',
            title: '¡Ruta añadida!',
            text: `${courseName} ha sido añadida a tu lista de rutas.`,
            confirmButtonText: '¡Perfecto!',
            timer: 3000, // 3 segundos
            timerProgressBar: true,
        });
    } else {
        // Mostrar SweetAlert2 - Ruta ya añadida
        Swal.fire({
            icon: 'info',
            title: 'Ruta ya añadida',
            text: `${courseName} ya está en tu lista de rutas.`,
            confirmButtonText: 'Entendido',
            timer: 3000, // 3 segundos
            timerProgressBar: true,
        });
    }
}


// Función para cargar las rutas y construir el HTML dinámicamente (solo para "Mis rutas")
function loadRoutes() {
    let routes = JSON.parse(localStorage.getItem('routes')) || [];
    const container = document.getElementById('routes-container');
    container.innerHTML = ''; // Limpiar el contenedor

    if (routes.length === 0) {
        container.innerHTML = '<p class="empty-message">No has añadido ningún curso a la ruta.</p>';
    } else {
        routes.forEach((route, index) => {
            container.innerHTML += `
                <div class="ruta">
                    <div class="imagen">
                        <img src="${route.image}" alt="${route.name}">
                    </div>
                    <div class="descripcionruta">
                        <h1>${route.name}</h1>
                        <p>Ruta de aprendizaje</p>
                    </div>
                    <div class="btn">
                        <button onclick="removeRoute(${index})">Eliminar</button>
                        <button onclick="viewRoute(${index})">Ver</button>
                    </div>
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

// Función para visualizar una ruta
function viewRoute(index) {
    let routes = JSON.parse(localStorage.getItem('routes')) || [];
    const route = routes[index];
    Swal.fire({
        title: route.name,
        text: `Esta es tu ruta de aprendizaje para ${route.name}.`,
        imageUrl: route.image,
        imageWidth: 400,
        imageHeight: 200,
        imageAlt: route.name,
    });
}

// Cargar las rutas automáticamente al abrir "Mis rutas"
if (document.getElementById('routes-container')) {
    loadRoutes();
}
