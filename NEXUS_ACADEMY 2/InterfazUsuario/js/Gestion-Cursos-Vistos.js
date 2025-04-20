document.addEventListener("DOMContentLoaded", function () {
    const tipoCurso = getTipoCurso(); // Esta función obtiene el tipo de curso (adulto, adolescente, niño)

    fetch(`http://localhost:3030/obtener-cursos-activados?tipo_curso=${tipoCurso}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const cursosActualesContainer = document.querySelector(".cursos-actuales");

                const categoriaHTML = ` 
                    <div class="categoria">
                        <div class="cursos">
                            ${data.cursos.map(curso => `
                                <div class="curso">
                                    <h4>Curso de ${curso.nombre_curso}</h4>
                                    <p>Docente: ${curso.nombre_profesor}</p>
                                    <img src="../img/${curso.imagen_curso}" alt="${curso.nombre_curso}">
                                    <button class="continuar-curso" onclick="location.href='../Interfaz/Cursos y video/${curso.nombre_curso}/Cursos.html'">Continuar curso</button>
                                    <div class="detalleprogre">
                                        <div class="progreso">
                                            <div class="barra" style="width: 0%;"></div>
                                        </div>
                                        <span>0%</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;

                cursosActualesContainer.insertAdjacentHTML("beforeend", categoriaHTML);
            } else {
                console.error("Error al cargar los cursos:", data.message);
            }
        })
        .catch(error => console.error("Error al obtener los cursos activados:", error));
});

// Función para obtener el tipo de curso (puedes modificarla según cómo determines el tipo de usuario)
function getTipoCurso() {
    // Aquí puedes obtener el tipo de curso desde la sesión o desde la URL
    // Ejemplo: tomando el tipo de usuario desde un parámetro de la URL (o usar otro método)
    const urlParams = new URLSearchParams(window.location.search);
    const tipoCurso = urlParams.get('tipo_curso'); // Asume que la URL tiene un parámetro tipo_curso

    // Si no hay un parámetro, por defecto asignamos un tipo de curso
    return tipoCurso || 'adulto'; // Puede ser 'adulto', 'adolescente', 'niño'
}
