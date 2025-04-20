document.addEventListener("DOMContentLoaded", function () {
    // Obtener el nombre del curso desde la URL (asumiendo que el curso está en una carpeta con su nombre)
    const pathParts = window.location.pathname.split('/'); // Dividir la URL en partes
    const nombreCurso = pathParts[pathParts.length - 2]; // Tomar la penúltima parte de la ruta (el nombre de la carpeta)

    // Llamar a la función para cargar los temas para ese curso
    cargarTemas(nombreCurso);
});

function cargarTemas(nombreCurso) {
    // Aquí se utiliza la URL completa incluyendo el puerto 3030
    fetch(`http://localhost:3030/obtener-temas/${nombreCurso}`)
        .then(response => response.json())
        .then(temaData => {
            const acordeonSection = document.querySelector('.accordion-section'); // Seleccionar la sección del acordeón

            acordeonSection.innerHTML = '';
            if (temaData.temas && temaData.temas.length > 0) {
                temaData.temas.forEach(tema => {
                    const temaHTML = `
                        <div class="accordion">
                            <div class="flex-center">
                                <button class="accordion-button" onclick="location.href='VideoClase${tema.nombre_tema}.html'">
                                    <img class="img-miniaturas" src="../../../img/${tema.imagen_tema}"">
                                        <div class="text-container">
                                            <span class="title">${tema.nombre_tema}</span>
                                            <span class="duration">
                                                <i class="fa-solid fa-clock"></i> Duración: 00:52 min
                                            </span>
                                        </div>
                                </button>
                            </div>
                        </div>
                    `;
                    acordeonSection.insertAdjacentHTML('beforeend', temaHTML); // Insertar los temas en el acordeón
                });
            } else {
                acordeonSection.insertAdjacentHTML('beforeend', '<p>No hay temas disponibles</p>');
            }
        })
        .catch(error => {
            console.error("Error al obtener los temas:", error);
        });
}
