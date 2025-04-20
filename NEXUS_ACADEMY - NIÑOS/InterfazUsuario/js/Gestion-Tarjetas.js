document.addEventListener("DOMContentLoaded", function () {
    cargarTarjetas("niño"); // Cambia "adulto" según el tipo de curso correspondiente
});

function cargarTarjetas(tipoCurso) {
    fetch(`http://localhost:3030/obtener-tarjetas?tipoCurso=${tipoCurso}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const track = document.querySelector("#track"); // Contenedor del carrusel

                data.cursos.forEach(curso => {
                    const tarjetaHTML = `
                        <div class="course-card">
                            <picture>
                                <img src="../img/${curso.imagen_curso}" alt="Curso de ${curso.nombre_curso}" />
                            </picture>
                            <div class="title-with-icon">
                                <img src="../img/${curso.icono_curso}" alt="Icono de Administración" class="professor-icon" />
                                <h4>Curso de ${curso.nombre_curso}</h4>
                            </div>
                            <p>${curso.lema}</p>
                            <p id="autor">Docente: ${curso.nombre_profesor}</p>
                            <div class="buttons">
                                <a href="../Interfaz/Cursos y video/${curso.nombre_curso}/Cursos.html" class="btn-view" onclick="activarCurso('${curso.nombre_curso}')">Ir a curso <i class="fas fa-arrow-right"></i></a>
                                <a href="#" class="btn-add" onclick="addToCart('Curso ${curso.nombre_curso}', 80.00, 'images/cursoAdministracion.jpg')">
                                    Añadir <i class="fas fa-shopping-cart"></i>
                                </a>
                            </div>
                        </div>
                    `;
                    track.insertAdjacentHTML("beforeend", tarjetaHTML);
                });
            } else {
                console.error("Error al cargar los cursos:", data.message);
            }
        })
        .catch(error => console.error("Error al obtener los cursos:", error));
}

function activarCurso(nombreCurso) {
    fetch(`http://localhost:3030/activar-curso/${nombreCurso}`, {
        method: "PUT"
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log(`Curso activado: ${nombreCurso}`);
        } else {
            console.error(`Error al activar el curso: ${data.message}`);
        }
    })
    .catch(error => console.error("Error al activar el curso:", error));
}