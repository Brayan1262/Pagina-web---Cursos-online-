document.addEventListener("DOMContentLoaded", () => {
    // Obtener el nombre de la ruta desde la URL
    const params = new URLSearchParams(window.location.search);
    const routeName = params.get("route");

    if (!routeName) {
        alert("No se encontró la ruta seleccionada.");
        window.location.href = "rutas.html"; // Redirigir a "Mis Rutas"
        return;
    }

    // Mostrar el título de la ruta
    const routeTitle = document.getElementById("route-title");
    routeTitle.textContent = `Ruta: ${routeName}`;

    // Obtener los cursos asociados a la ruta desde localStorage
    const courses = JSON.parse(localStorage.getItem(routeName)) || [];

    if (courses.length === 0) {
        const coursesList = document.getElementById("courses-list");
        coursesList.textContent = "No hay cursos en esta ruta.";
        return;
    }

    // Cargar el archivo JSON y vincular los cursos
    fetch("assets/data/cursos.json")
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            const coursesList = document.getElementById("courses-list");
            coursesList.innerHTML = ""; // Limpiar la lista antes de agregar contenido

            courses.forEach((courseTitle) => {
                // Buscar el curso en el JSON usando su título
                const courseId = Object.keys(data.cursos).find(
                    (key) => data.cursos[key].titulo === courseTitle
                );

                if (!courseId) {
                    console.error(`Curso no encontrado en el JSON: ${courseTitle}`);
                    return;
                }

                // Crear un contenedor de curso con imagen, título y botón eliminar
                const courseItem = document.createElement("div");
                courseItem.classList.add("course-item");

                // Agregar imagen
                const courseImage = document.createElement("img");
                courseImage.src = data.cursos[courseId].icono;
                courseImage.alt = courseTitle;
                courseItem.appendChild(courseImage);

                // Agregar título
                const courseName = document.createElement("span");
                courseName.textContent = courseTitle;
                courseName.classList.add("course-title");
                courseItem.appendChild(courseName);

                // Agregar botón eliminar
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "X";
                deleteButton.classList.add("delete-btn");
                deleteButton.addEventListener("click", (e) => {
                    e.stopPropagation(); // Prevenir navegación al curso al hacer clic en "X"
                    deleteCourseFromRoute(routeName, courseTitle, courseItem);
                });
                courseItem.appendChild(deleteButton);

                // Evento para redirigir al curso al hacer clic en cualquier parte del elemento
                courseItem.addEventListener("click", () => {
                    window.location.href = `curso.html?curso=${encodeURIComponent(courseId)}`;
                });

                coursesList.appendChild(courseItem);
            });
        })
        .catch((error) => {
            console.error("Error al cargar el JSON de cursos:", error);
        });
});

// Función para eliminar un curso de la ruta
function deleteCourseFromRoute(routeName, courseTitle, courseElement) {
    let courses = JSON.parse(localStorage.getItem(routeName)) || [];
    courses = courses.filter((course) => course !== courseTitle);
    localStorage.setItem(routeName, JSON.stringify(courses));
    courseElement.remove();
}

// Función para regresar a "Mis Rutas"
function goBack() {
    window.location.href = "rutas.html";
}
