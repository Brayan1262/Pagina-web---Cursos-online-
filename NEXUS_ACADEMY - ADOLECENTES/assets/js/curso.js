document.addEventListener("DOMContentLoaded", () => {
    // Obtener el parámetro "curso" de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const cursoId = urlParams.get("curso");

    if (!cursoId) {
        console.error("No se especificó un curso en la URL");
        return;
    }

    // Cargar el archivo JSON de los cursos
    fetch("assets/data/cursos.json")
        .then(response => response.json())
        .then(data => {
            // Buscar el curso con el ID correspondiente en el JSON
            const curso = data.cursos[cursoId];

            if (!curso) {
                console.error("Curso no encontrado en el JSON");
                return;
            }

            // Actualizar el contenido del curso en curso.html
            document.getElementById("course-title").textContent = curso.titulo;
            document.getElementById("course-icon").src = curso.icono;
            document.getElementById("course-description").textContent = curso.descripcion;
            document.getElementById("course-rating").textContent = "⭐⭐⭐⭐⭐";
            document.getElementById("course-opinions").textContent = `${curso.opiniones} Opiniones`;
            document.getElementById("course-level").textContent = curso.nivel;
            document.getElementById("course-date").textContent = curso.fecha;
            document.getElementById("instructor-image").src = curso.instructorImagen;
            document.getElementById("instructor-name").textContent = curso.instructor;

            // Generar el temario con enlaces dinámicos para cada video
            const temarioContainer = document.getElementById("course-topics");
            temarioContainer.innerHTML = ""; // Limpiar contenido anterior

            curso.temario.forEach((tema, index) => {
                const temaDiv = document.createElement("div");
                temaDiv.classList.add("video-tema");

                temaDiv.innerHTML = `
                    <button onclick="window.location.href='video.html?video=${cursoId}-${index + 1}'">
                        Video ${index + 1}: ${tema}
                    </button>
                `;
                temarioContainer.appendChild(temaDiv);
            });
        })
        .catch(error => {
            console.error("Error al cargar el JSON de cursos:", error);
        });
});
