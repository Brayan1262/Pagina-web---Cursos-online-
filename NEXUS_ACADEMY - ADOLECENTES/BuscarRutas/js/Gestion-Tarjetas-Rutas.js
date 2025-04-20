// 🟢 Función para obtener el nombre de la ruta desde la URL
function obtenerNombreRutaDesdeURL() {
    const urlActual = window.location.href; // Obtener la URL completa
    const nombreArchivo = urlActual.split('/').pop(); // Extraer la última parte de la URL (por ejemplo, rutaPython.html)
    const nombreRuta = nombreArchivo.replace('ruta', '').replace('.html', ''); // Eliminar "ruta" y ".html"
    console.log(`🛠️ Nombre de la ruta detectado: ${nombreRuta}`);
    return nombreRuta; // Devuelve el nombre de la ruta
}

// 🟢 Función para cargar las tarjetas de los cursos que pertenecen a la ruta
function cargarTarjetasRutas() {
    const nombreRuta = obtenerNombreRutaDesdeURL(); // Obtén el nombre de la ruta dinámicamente

    fetch(`http://localhost:3030/obtener-cursos-por-ruta/${nombreRuta}`) // Se llama al endpoint con el nombre de la ruta
        .then(response => response.json())
        .then(data => {
            const cardsContainer = document.querySelector(".cards-container");
            cardsContainer.innerHTML = ''; // Limpiar contenedor de tarjetas

            if (!data.success || data.data.length === 0) {
                cardsContainer.innerHTML = '<p>No se encontraron cursos para esta ruta.</p>';
                return;
            }

            // Recorremos cada curso y generamos la tarjeta
            data.data.forEach(curso => {
                const nombreCurso = curso.nombre_curso;
                const totalTemas = curso.total_temas || 0; // Total de temas
                const nombresTemas = curso.nombres_temas ? curso.nombres_temas.split('|') : []; // Lista de temas
                const primerosTresTemas = nombresTemas.slice(0, 3); // Tomamos los 3 primeros temas

                const tarjetaHTML = `
                    <a href="../../Interfaz/Cursos y video/${nombreCurso}/Cursos.html" class="card-link">
                        <div class="card">
                            <h2>${nombreCurso}</h2>
                            <p>${totalTemas} temas</p>
                            <div class="courses-container">
                                ${primerosTresTemas.map(tema => `
                                    <div class="course-box">
                                        <img src="images/piton.png" alt="Icono" class="icon-image" />
                                        Curso de ${tema}
                                    </div>
                                `).join('')}
                            </div>
                            <span class="view-more">Ver ${totalTemas} temas más</span>
                        </div>
                    </a>
                `;

                // Agregamos la tarjeta al contenedor
                cardsContainer.insertAdjacentHTML('beforeend', tarjetaHTML);
            });
        })
        .catch(error => console.error("❌ Error al obtener los cursos por ruta:", error));
}

// 🟢 Ejecutar la carga de tarjetas cuando la página esté lista
document.addEventListener('DOMContentLoaded', () => {
    cargarTarjetasRutas();
});
