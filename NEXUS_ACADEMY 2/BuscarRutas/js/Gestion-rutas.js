document.addEventListener("DOMContentLoaded", function () {
    const tipoRuta = 'adulto-ruta'; // Cambia esto a 'adolescente-ruta' o 'niño-ruta' según sea necesario

    // Llamar al endpoint para obtener las rutas activas del tipo especificado
    fetch(`http://localhost:3030/obtener-rutas-tarjetas?tipo=${tipoRuta}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const track = document.getElementById("track");

                data.rutas.forEach(ruta => {
                    // Verificar si la ruta ya está presente en el contenedor
                    const rutaExistente = track.querySelector(`.course-card[data-nombre-ruta="${ruta.nombre}"]`);
                    if (!rutaExistente) {
                        const rutaHTML = `
                            <div class="course-card" data-nombre-ruta="${ruta.nombre}">
                                <picture>
                                    <img src="rutaPython/images/${ruta.imagen}" alt="Ruta de ${ruta.nombre}" />
                                </picture>
                                <div class="title-with-icon">
                                    <img src="rutaPython/images/${ruta.icono}" alt="${ruta.nombre}" class="professor-icon" />
                                    <h4>Ruta de ${ruta.nombre}</h4>
                                </div>
                                <div class="buttons">
                                    <a href="rutaPython/ruta${ruta.nombre}.html" class="btn-view">
                                        Ver ruta <i class="fas fa-arrow-right"></i>
                                    </a>
                                    <a href="#" class="btn-add" onclick="addToRoute('Ruta de ${ruta.nombre}', 'images/${ruta.imagen}')">
                                        Añadir ruta <i class="fas fa-plus"></i>
                                    </a>
                                </div>
                            </div>
                        `;
                        track.insertAdjacentHTML('beforeend', rutaHTML);
                    }
                });
            } else {
                console.error('Error al cargar las rutas:', data.message);
            }
        })
        .catch(error => console.error('Error al obtener las rutas:', error));
});
