document.addEventListener("DOMContentLoaded", function () {
    const areaSelect = document.getElementById("areaRuta");

    // Llamar al endpoint para obtener las áreas
    fetch("/obtener-areas-oficiales")
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Limpiar las opciones existentes
                areaSelect.innerHTML = `<option value="" disabled selected>Seleccione un área</option>`;

                // Agregar las áreas como opciones
                data.areas.forEach(area => {
                    const option = document.createElement("option");
                    option.value = area;
                    option.textContent = area;
                    areaSelect.appendChild(option);
                });
            } else {
                console.error("Error al cargar las áreas:", data.message);
            }
        })
        .catch(error => {
            console.error("Error al obtener las áreas:", error);
        });
});

document.addEventListener("DOMContentLoaded", () => {
    const areaSelect = document.getElementById("areaRuta");
    const rutaInput = document.getElementById("ruta");
    const sugerenciasRuta = document.getElementById("sugerenciasRuta");

    // Escuchar cambios en el área seleccionada
    areaSelect.addEventListener("change", function () {
        rutaInput.value = ""; // Limpiar el campo de la ruta al cambiar de área
        sugerenciasRuta.innerHTML = ""; // Limpiar sugerencias previas
    });

    // Mostrar sugerencias de rutas basadas en el texto ingresado
    rutaInput.addEventListener("input", function () {
        const textoIngresado = rutaInput.value.trim();
        const areaSeleccionada = areaSelect.value;

        if (!textoIngresado || !areaSeleccionada) {
            sugerenciasRuta.innerHTML = "";
            return;
        }

        // Llamar al endpoint para obtener las rutas filtradas por área
        fetch(`/obtener-rutas-oficiales/${encodeURIComponent(areaSeleccionada)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Filtrar rutas que coincidan con el texto ingresado
                    const coincidencias = data.rutas.filter(ruta =>
                        ruta.toLowerCase().includes(textoIngresado.toLowerCase())
                    );

                    // Mostrar las rutas como sugerencias
                    sugerenciasRuta.innerHTML = coincidencias
                        .map(ruta => `<button type="button" class="list-group-item list-group-item-action">${ruta}</button>`)
                        .join("");

                    // Agregar evento para seleccionar una sugerencia
                    const sugerencias = sugerenciasRuta.querySelectorAll("button");
                    sugerencias.forEach(sugerencia => {
                        sugerencia.addEventListener("click", function () {
                            rutaInput.value = sugerencia.textContent; // Asignar el valor seleccionado
                            sugerenciasRuta.innerHTML = ""; // Limpiar sugerencias
                        });
                    });
                } else {
                    sugerenciasRuta.innerHTML = `<p class="list-group-item">No se encontraron rutas para esta área.</p>`;
                }
            })
            .catch(error => {
                console.error("Error al obtener las rutas oficiales:", error);
            });
    });

    // Limpiar sugerencias al perder el foco
    rutaInput.addEventListener("blur", function () {
        setTimeout(() => {
            sugerenciasRuta.innerHTML = "";
        }, 200); // Pequeño retraso para permitir clic en las sugerencias
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const areaSelect = document.getElementById("areaRuta"); // Select del área
    const docenteInput = document.getElementById("docente"); // Input del docente
    const sugerenciasDocente = document.getElementById("sugerenciasDocente"); // Contenedor de sugerencias

    // Escuchar cambios en el área seleccionada
    areaSelect.addEventListener("change", function () {
        docenteInput.value = ""; // Limpiar el campo de docente al cambiar de área
        sugerenciasDocente.innerHTML = ""; // Limpiar sugerencias previas
    });

    // Mostrar sugerencias de docentes basadas en el texto ingresado
    docenteInput.addEventListener("input", function () {
        const textoIngresado = docenteInput.value.trim();
        const areaSeleccionada = areaSelect.value;

        if (!textoIngresado || !areaSeleccionada) {
            sugerenciasDocente.innerHTML = "";
            return;
        }

        // Llamar al endpoint para obtener los profesores filtrados por área
        fetch(`/obtener-profesores-oficiales/${encodeURIComponent(areaSeleccionada)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Filtrar profesores que coincidan con el texto ingresado
                    const coincidencias = data.profesores.filter(profesor =>
                        profesor.toLowerCase().includes(textoIngresado.toLowerCase())
                    );

                    // Mostrar los profesores como sugerencias
                    sugerenciasDocente.innerHTML = coincidencias
                        .map(profesor => `<button type="button" class="list-group-item list-group-item-action">${profesor}</button>`)
                        .join("");

                    // Agregar evento para seleccionar una sugerencia
                    const sugerencias = sugerenciasDocente.querySelectorAll("button");
                    sugerencias.forEach(sugerencia => {
                        sugerencia.addEventListener("click", function () {
                            docenteInput.value = sugerencia.textContent; // Asignar el valor seleccionado
                            sugerenciasDocente.innerHTML = ""; // Limpiar sugerencias
                        });
                    });
                } else {
                    sugerenciasDocente.innerHTML = `<p class="list-group-item">No se encontraron docentes para esta área.</p>`;
                }
            })
            .catch(error => {
                console.error("Error al obtener los profesores oficiales:", error);
            });
    });

    // Limpiar sugerencias al perder el foco
    docenteInput.addEventListener("blur", function () {
        setTimeout(() => {
            sugerenciasDocente.innerHTML = "";
        }, 200); // Pequeño retraso para permitir clic en las sugerencias
    });
});

// Función para agregar un tema
document.getElementById("AgregarTema").addEventListener("click", async function (event) {
    event.preventDefault(); // Evita el envío del formulario

    // Obtener los valores de los inputs
    const nombreCurso = document.getElementById("nombreCurso").value;
    const nombreTema = document.getElementById("nombreTema").value;

    try {
        // Enviar los datos al servidor
        const response = await fetch("/agregar-tema", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nombreCurso, nombreTema }),
        });

        const data = await response.json();

        if (response.ok) {
            // Agregar el tema a la tabla en el modal
            const tabla = document.getElementById("tablaTemas").querySelector("tbody");
            const nuevaFila = document.createElement("tr");

            // Asignar el id del tema al atributo data-id
            nuevaFila.dataset.id = data.id; // Asegúrate de que el servidor devuelva el id

            nuevaFila.innerHTML = `
                <td>${nombreTema}</td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm eliminarTema">Eliminar</button>
                </td>
            `;
            tabla.appendChild(nuevaFila);

            // Limpiar el campo de entrada
            document.getElementById("nombreTema").value = "";

            // Mostrar un mensaje de éxito
            alert("Tema agregado exitosamente.");
        } else {
            alert(`Error: ${data.mensaje}`);
        }
    } catch (error) {
        console.error("Error al agregar el tema:", error);
        alert("Hubo un error al agregar el tema. Inténtalo nuevamente.");
    }
});

document.getElementById("tablaTemas").addEventListener("click", async function (event) {
    if (event.target.classList.contains("eliminarTema")) {
        event.stopPropagation();
        const fila = event.target.closest("tr");
        const nombreTema = fila.querySelector("td").innerText;

        // Preguntar si el usuario está seguro de eliminar
        if (!confirm(`¿Estás seguro de que quieres eliminar el tema: "${nombreTema}"?`)) {
            return;
        }

        const temaId = fila.dataset.id; // Asegúrate de que cada fila tenga un ID asociado (lo veremos más adelante)

        try {
            // Enviar solicitud DELETE al servidor para eliminar el tema en la base de datos
            const response = await fetch(`/eliminar-tema/${temaId}`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (response.ok) {
                // Eliminar la fila de la tabla en la interfaz
                fila.remove();
                alert("Tema eliminado exitosamente.");
            } else {
                alert(`Error: ${data.mensaje}`);
            }
        } catch (error) {
            console.error("Error al eliminar el tema:", error);
            alert("Hubo un error al eliminar el tema. Inténtalo nuevamente.");
        }
    }
});

// Función para manejar la creación del curso
document.getElementById("from-curso").addEventListener("submit", function (event) {
    event.preventDefault();

    // Obtener los datos del formulario
    const nombreCurso = document.getElementById("nombreCurso").value;
    const docente = document.getElementById("docente").value;
    const lemaCurso = document.getElementById("lemaCurso").value;
    const imagenCurso = document.getElementById("imagenCurso").files[0];
    const iconoCurso = document.getElementById("iconoCurso").files[0]; // NUEVA LÍNEA
    const tipoCurso = document.getElementById("tipoCurso").value;
    const nombreRuta = document.getElementById("ruta").value;
    const descripcionCurso = document.getElementById("descripcionCurso").value;
    const conocimientoPrevio1 = document.getElementById("conocimientoPrevio1").value;
    const conocimientoPrevio2 = document.getElementById("conocimientoPrevio2").value;
    const conocimientoPrevio3 = document.getElementById("conocimientoPrevio3").value;
    const descripcionCurso2 = document.getElementById("descripcionCurso2").value;
    const horasTeoricas = document.getElementById("horasTeoricas").value;
    const horasPracticas = document.getElementById("horasPracticas").value;

    const formData = new FormData();
    formData.append("nombre_curso", nombreCurso);
    formData.append("nombre_profesor", docente);
    formData.append("imagenDocente", document.getElementById("imagenDocente").files[0]);
    formData.append("lema", lemaCurso);
    formData.append("imagen_curso", imagenCurso);
    formData.append("icono_curso", iconoCurso); // Asegúrate de que el nombre aquí coincida con el de la configuración de Multer
    formData.append("descripcion_curso", descripcionCurso);
    formData.append("tipo_curso", tipoCurso);
    formData.append("nombre_ruta", nombreRuta);
    formData.append("conocimiento_previo_1", conocimientoPrevio1);
    formData.append("conocimiento_previo_2", conocimientoPrevio2);
    formData.append("conocimiento_previo_3", conocimientoPrevio3);
    formData.append("descripcion_curso_2", descripcionCurso2);
    formData.append("horas_teoricas", horasTeoricas);
    formData.append("horas_practicas", horasPracticas);

    // Enviar la solicitud POST para agregar el curso
    fetch("/agregar-curso", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Crear el nuevo acordeón para el curso agregado
            const nuevoCursoHTML = `
                <div class="accordion-item" id="curso-${data.id}">
                    <h2 class="accordion-header" id="heading${data.id}">
                        <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${data.id}" aria-expanded="true" aria-controls="collapse${data.id}">
                            Curso de ${data.nombre_curso} - ${data.nombre_profesor}
                        </button>
                    </h2>
                    <div class="d-flex justify-content-end p-2">
                        <button class="btn btn-danger btn-sm eliminarCurso" data-id="${data.id}">Eliminar curso</button>
                        <button class="btn btn-success btn-sm realizarExamen" data-bs-toggle="modal" data-bs-target="#crearExamenModal" data-id="${data.id}" data-nombre="${data.nombre_curso}">Realizar examen</button>
                    </div>
                    <div id="collapse${data.id}" class="accordion-collapse collapse show" aria-labelledby="heading${data.id}" data-bs-parent="#accordionExample">
                        <div class="accordion-body">
                            <ul class="list-group" id="temas-${data.id}">
                                <!-- Aquí se agregarán los temas relacionados -->
                            </ul>
                        </div>
                    </div>
                </div>
            `;

            // Insertar el nuevo curso al acordeón
            document.querySelector("#accordionExample").insertAdjacentHTML('beforeend', nuevoCursoHTML);

            // Obtener los temas para este curso
            fetch(`/obtener-temas/${data.nombre_curso}`)
                .then(response => response.json())
                .then(temaData => {
                    if (temaData.temas && temaData.temas.length > 0) {
                        const temasList = document.getElementById(`temas-${data.id}`);
                        temaData.temas.forEach(tema => {
                            const temaHTML = `
                                <li class="list-group-item d-flex justify-content-between align-items-center">
                                    ${tema.nombre_tema}
                                    <div class="d-flex justify-content-end gap-2">
                                        <button class="btn btn-primary btn-sm btn-custom-small" data-bs-toggle="modal" onclick="abrirModalInsertarImagen('${nombreCurso}', '${tema.id}')">Insertar imagen</button>
                                        <button class="btn btn-success btn-sm btn-custom-small" data-bs-toggle="modal" onclick="abrirModalAgregarVideo('${nombreCurso}', '${cursoId}', '${tema.nombre_tema}')">Insertar video</button>
                                        <button class="btn btn-success btn-sm btn-custom-small" onclick="cargarIframeVideo('${tema.nombre_tema}')">Ver video</button>
                                        <button class="btn btn-danger btn-sm btn-custom-small eliminarVideo" data-nombre-curso="${nombreCurso}" data-nombre-video="${tema.nombre_tema}">Eliminar video</button>
                                        <button class="btn btn-danger btn-sm btn-custom-small eliminarTema" data-id="${tema.id}">Eliminar tema</button>
                                    </div>
                                </li>
                            `;
                            temasList.insertAdjacentHTML('beforeend', temaHTML);
                        });
                    } else {
                        const temasList = document.getElementById(`temas-${data.id}`);
                        temasList.insertAdjacentHTML('beforeend', '<li class="list-group-item">No hay temas disponibles</li>');
                    }
                })
                .catch(error => {
                    console.error("Error al obtener los temas:", error);
                });

            // Crear la nueva tarjeta del curso
            const nuevaTarjetaHTML = `
                
                <div class="course-card">
                    <picture>
                        <img src="../../img/${curso.imagen_curso}" alt="Curso de ${curso.nombre_curso}" />
                    </picture>
                    <div class="title-with-icon">
                        <img src="images/gestion.png" alt="Icono de Administración" class="professor-icon" />
                        <h4>Curso de ${curso.nombre_curso}</h4>
                        </div>
                        <p>${curso.lema}</p>
                        <p id="autor">Docente: ${curso.nombre_profesor}</p>
                        <div class="buttons">
                            <a href="../../Interfaz/Cursos y video/${curso.nombre_curso}/Cursos.html" class="btn-view">Ir a curso <i class="fas fa-arrow-right"></i></a>
                            <a href="#" class="btn-add" onclick="addToCart('Curso ${curso.nombre_curso}', 80.00, 'images/cursoAdministracion.jpg')">
                                Añadir <i class="fas fa-shopping-cart"></i>
                            </a>
                    </div>
                </div>
            `;

            // Determinar el archivo objetivo según el tipo de curso
            let targetFile = "";
            switch (data.tipo_curso.toLowerCase()) {
                case "adulto":
                    targetFile = "../NEXUS-ACADEMY/Interfaces/InterfazUsuario/interfaz.html";
                    break;
                case "adolescente":
                    targetFile = "../NEXUS-ACADEMY/Interfaces/InterfazAdolescente/interfazAdolescente.html";
                    break;
                case "niño":
                    targetFile = "../NEXUS-ACADEMY/Interfaces/InterfazNiño/interfazNiño.html";
                    break;
            }
            // Limpiar el formulario después de agregar el curso
            alert('Curso agregado correctamente.');
            document.getElementById("from-curso").reset();
            const tbodyTemas = document.querySelector("#tablaTemas tbody");
            tbodyTemas.innerHTML = ""; // Esto vacía solo las filas, no afecta al thead
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error("Error al agregar el curso:", error);
        alert("Error al agregar el curso");
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Cargar cursos inicialmente
    cargarCursos();

    // Obtener el input de búsqueda
    const buscarCursosInput = document.getElementById("buscarCursos");

    // Escuchar cambios en el campo de búsqueda
    buscarCursosInput.addEventListener("input", function () {
        // Obtener el texto del campo de búsqueda
        const textoBusqueda = buscarCursosInput.value.trim().toLowerCase();

        // Llamar a la función para cargar los cursos con el filtro de búsqueda
        filtarCursos(textoBusqueda);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    cargarCursos();  // Llamar a la función para cargar los cursos al inicio
});

// Función para cargar los cursos y sus temas desde el backend
function cargarCursos() {
    // Obtener los cursos desde el backend
    fetch("/obtener-cursos")
        .then(response => response.json())
        .then(cursosData => {
            // Limpiar el acordeón de cursos antes de agregar los nuevos
            const acordeon = document.getElementById("accordionExample");
            acordeon.innerHTML = "";

            // Recorrer cada curso recibido del backend
            cursosData.cursos.forEach(curso => {
                const nuevoCursoHTML = `
                    <div class="accordion-item" id="curso-${curso.id}">
                        <h2 class="accordion-header" id="heading${curso.id}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${curso.id}" aria-expanded="false" aria-controls="collapse${curso.id}">
                                Curso de ${curso.nombre_curso} - ${curso.nombre_profesor}<br>
                            </button>
                        </h2>
                        <div class="d-flex justify-content-end p-2">
                            <button class="btn btn-danger btn-sm eliminarCurso" data-id="${curso.id}">Eliminar curso</button>
                            <button class="btn btn-success btn-sm realizarExamen" data-bs-toggle="modal" data-bs-target="#crearExamenModal" data-id="${curso.id}" data-nombre="${curso.nombre_curso}">Realizar examen</button>
                        </div>
                        <div id="collapse${curso.id}" class="accordion-collapse collapse" aria-labelledby="heading${curso.id}" data-bs-parent="#accordionExample">
                            <div class="accordion-body">
                                <ul class="list-group" id="temas-${curso.id}">
                                    <!-- Los temas serán agregados aquí -->
                                </ul>
                            </div>
                        </div>
                    </div>
                `;

                // Insertar el nuevo curso al acordeón
                acordeon.insertAdjacentHTML('beforeend', nuevoCursoHTML);

                // Obtener los temas para este curso
                cargarTemas(curso.nombre_curso, curso.id);
            });
            // Manejar la eliminación de cursos
            const eliminarCursoBtns = acordeon.querySelectorAll(".eliminarCurso");
            eliminarCursoBtns.forEach(button => {
                button.addEventListener("click", async (event) => {
                    const cursoId = button.getAttribute("data-id");

                    const confirmDelete = confirm("¿Estás seguro de que quieres eliminar este curso?");
                    if (!confirmDelete) return;

                    try {
                        // Enviar la solicitud al servidor para cambiar el estado del curso
                        const response = await fetch(`/eliminar-curso/${cursoId}`, { method: "PUT" });

                        const data = await response.json();

                        if (response.ok) {
                            alert("Curso eliminado exitosamente.");
                            // Eliminar el curso del DOM
                            document.getElementById(`curso-${cursoId}`).remove();
                        } else {
                            alert(`Error: ${data.message}`);
                        }
                    } catch (error) {
                        console.error("Error al eliminar el curso:", error);
                        alert("Hubo un error al eliminar el curso.");
                    }
                });
            });
        })
        .catch(error => {
            console.error("Error al obtener los cursos:", error);
        });
}

// Función para cargar los cursos y sus temas desde el backend
function filtarCursos(filtro = '') {
    // Obtener los cursos desde el backend
    fetch("/obtener-cursos")
        .then(response => response.json())
        .then(cursosData => {
            // Limpiar el acordeón de cursos antes de agregar los nuevos
            const acordeon = document.getElementById("accordionExample");
            acordeon.innerHTML = "";

            // Filtrar los cursos por el texto de búsqueda (si hay)
            const cursosFiltrados = cursosData.cursos.filter(curso =>
                curso.nombre_curso.toLowerCase().includes(filtro) || curso.nombre_profesor.toLowerCase().includes(filtro)
            );

            // Recorrer cada curso filtrado
            cursosFiltrados.forEach(curso => {
                const nuevoCursoHTML = `
                    <div class="accordion-item" id="curso-${curso.id}">
                        <h2 class="accordion-header" id="heading${curso.id}">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${curso.id}" aria-expanded="false" aria-controls="collapse${curso.id}">
                                Curso de ${curso.nombre_curso} - ${curso.nombre_profesor}<br>
                            </button>
                        </h2>
                        <div class="d-flex justify-content-end p-2">
                            <button class="btn btn-danger btn-sm eliminarCurso" data-id="${curso.id}">Eliminar curso</button>
                            <button class="btn btn-success btn-sm realizarExamen" data-bs-toggle="modal" data-bs-target="#crearExamenModal" data-id="${curso.id}" data-nombre="${curso.nombre_curso}">Realizar examen</button>
                        </div>
                        <div id="collapse${curso.id}" class="accordion-collapse collapse" aria-labelledby="heading${curso.id}" data-bs-parent="#accordionExample">
                            <div class="accordion-body">
                                <ul class="list-group" id="temas-${curso.id}">
                                    <!-- Los temas serán agregados aquí -->
                                </ul>
                            </div>
                        </div>
                    </div>
                `;

                // Insertar el nuevo curso al acordeón
                acordeon.insertAdjacentHTML('beforeend', nuevoCursoHTML);

                // Obtener los temas para este curso
                cargarTemas(curso.nombre_curso, curso.id);
            });

            // Manejar la eliminación de cursos
            const eliminarCursoBtns = acordeon.querySelectorAll(".eliminarCurso");
            eliminarCursoBtns.forEach(button => {
                button.addEventListener("click", async (event) => {
                    const cursoId = button.getAttribute("data-id");

                    const confirmDelete = confirm("¿Estás seguro de que quieres eliminar este curso?");
                    if (!confirmDelete) return;

                    try {
                        // Enviar la solicitud al servidor para cambiar el estado del curso
                        const response = await fetch(`/eliminar-curso/${cursoId}`, { method: "PUT" });

                        const data = await response.json();

                        if (response.ok) {
                            alert("Curso eliminado exitosamente.");
                            // Eliminar el curso del DOM
                            document.getElementById(`curso-${cursoId}`).remove();
                        } else {
                            alert(`Error: ${data.message}`);
                        }
                    } catch (error) {
                        console.error("Error al eliminar el curso:", error);
                        alert("Hubo un error al eliminar el curso.");
                    }
                });
            });
        })
        .catch(error => {
            console.error("Error al obtener los cursos:", error);
        });
}

// Función para cargar los temas de un curso específico
function cargarTemas(nombreCurso, cursoId) {
    fetch(`/obtener-temas/${nombreCurso}`)
        .then(response => response.json())
        .then(temaData => {
            const temasList = document.getElementById(`temas-${cursoId}`);

            temasList.innerHTML = ""; 

            if (temaData.temas && temaData.temas.length > 0) {
                temaData.temas.forEach(tema => {
                    const temaHTML = `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${tema.nombre_tema}
                            <div class="d-flex justify-content-end gap-2">
                                <button class="btn btn-primary btn-sm btn-custom-small" data-bs-toggle="modal" onclick="abrirModalInsertarImagen('${nombreCurso}', '${tema.id}')">Insertar imagen</button>
                                <button class="btn btn-success btn-sm btn-custom-small" data-bs-toggle="modal" onclick="abrirModalAgregarVideo('${nombreCurso}', '${cursoId}', '${tema.nombre_tema}')">Insertar video</button>
                                <button class="btn btn-success btn-sm btn-custom-small" onclick="cargarIframeVideo('${tema.nombre_tema}')">Ver video</button>
                                <button class="btn btn-danger btn-sm btn-custom-small eliminarVideo" data-nombre-curso="${nombreCurso}" data-nombre-video="${tema.nombre_tema}">Eliminar video</button>
                                <button class="btn btn-danger btn-sm btn-custom-small eliminarTema" data-id="${tema.id}">Eliminar tema</button>
                            </div>
                        </li>
                    `;
                    temasList.insertAdjacentHTML('beforeend', temaHTML);
                });
            } else {
                temasList.insertAdjacentHTML('beforeend', '<li class="list-group-item">No hay temas disponibles</li>');
            }

            // Agregar evento de eliminación de video
            const eliminarVideoBtns = temasList.querySelectorAll(".eliminarVideo");
            eliminarVideoBtns.forEach(button => {
                button.addEventListener("click", async (event) => {
                    event.stopPropagation();

                    const nombreCurso = button.getAttribute("data-nombre-curso");
                    const nombreVideo = button.getAttribute("data-nombre-video");

                    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar el video "${nombreVideo}" del curso "${nombreCurso}"?`);
                    if (!confirmDelete) return;

                    try {
                        // Eliminar el video de la base de datos
                        const response = await fetch(`/eliminar-video/${nombreCurso}/${nombreVideo}`, { method: "DELETE" });

                        const data = await response.json();

                        if (response.ok) {
                            // Eliminar el archivo HTML correspondiente
                            const fileDeleted = await eliminarArchivoVideo(nombreCurso, nombreVideo);
                            if (fileDeleted) {
                                alert("Video eliminado exitosamente.");
                                // Eliminar la fila de la tabla
                                button.closest("li").remove();
                            } else {
                                alert("Error al eliminar el archivo HTML.");
                            }
                        } else {
                            alert(`Error: ${data.message}`);
                        }
                    } catch (error) {
                        console.error("Error al eliminar el HTML video:", error);
                        alert("Hubo un error al eliminar el HTML video.");
                    }
                });
            });

            // Agregar evento de eliminación de tema
            const eliminarTemaBtns = temasList.querySelectorAll(".eliminarTema");
            eliminarTemaBtns.forEach(button => {
                button.addEventListener("click", async (event) => {
                    event.stopPropagation();

                    const temaId = button.getAttribute("data-id");

                    const confirmDelete = confirm(`¿Estás seguro de que quieres eliminar este tema?`);
                    if (!confirmDelete) return;

                    try {
                        // Cambiar el estado del tema a "N" en la base de datos
                        const response = await fetch(`/eliminar-tema-oficial/${temaId}`, { method: "PUT" });

                        const data = await response.json();

                        if (response.ok) {
                            alert("Tema eliminado exitosamente.");
                            // Eliminar la fila de la lista en la interfaz
                            button.closest("li").remove();
                        } else {
                            alert(`Error: ${data.message}`);
                        }
                    } catch (error) {
                        console.error("Error al eliminar el tema:", error);
                        alert("Hubo un error al eliminar el tema.");
                    }
                });
            });
        })
        .catch(error => {
            console.error("Error al obtener los temas:", error);
        });
}

document.getElementById("guardarImagen").addEventListener("click", async function() {
    const temaId = document.getElementById("temaId").value;
    const cursoNombre = document.getElementById("cursoNombre").value;
    const imagenTema = document.getElementById("imagenTema").files[0];

    if (!imagenTema) {
        alert("Por favor, selecciona una imagen.");
        return;
    }

    // Crear el FormData para enviar la imagen
    const formData = new FormData();
    formData.append("imagen_tema", imagenTema);
    formData.append("tema_id", temaId);
    formData.append("nombre_curso", cursoNombre);

    try {
        // Enviar la imagen al servidor
        const response = await fetch(`/insertar-imagen-tema/${cursoNombre}`, {
            method: "POST",
            body: formData
        });

        const data = await response.json();
        console.log(data); // Imprime la respuesta del servidor

        if (data.success) {
            alert("Imagen actualizada exitosamente.");
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById("insertarImagenModal"));
            modal.hide();
        } else {
            alert("Error al actualizar la imagen.");
        }
    } catch (error) {
        console.error("Error al subir la imagen:", error);
        alert("Hubo un error al subir la imagen.");
    }
});

function abrirModalInsertarImagen(nombreCurso, temaId) {
    // Establecer los valores en los campos ocultos
    document.getElementById("cursoNombre").value = nombreCurso; // Asigna el nombre del curso
    document.getElementById("temaId").value = temaId;           // Asigna el ID del tema

    // Abre el modal
    new bootstrap.Modal(document.getElementById("insertarImagenModal")).show();
}

// Función para eliminar el archivo HTML correspondiente al video
async function eliminarArchivoVideo(nombreCurso, nombreVideo) {
    try {
        // Llamar al endpoint para eliminar el video y el archivo HTML
        const response = await fetch(`/eliminar-video/${nombreCurso}/${nombreVideo}`, { method: "DELETE" });
        const data = await response.json();

        if (response.ok) {
            alert("Video eliminado exitosamente.");
            button.closest("li").remove(); // Eliminar la fila de la tabla
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error("Error al eliminar el video:", error);
        alert("Hubo un error al eliminar el video.");
    }
}

function abrirModalAgregarVideo(nombreCurso, cursoId, nombreVideo) {
    // Establecer el nombre del curso en el campo correspondiente
    document.getElementById("nombreCursoVideo").value = nombreCurso;
    document.getElementById("nombreVideo").value = nombreVideo; // Establece el nombre del video actual

    // Limpiar los campos de anterior y siguiente
    document.getElementById("nombreVideoAnterior").value = '';
    document.getElementById("nombreVideoSiguiente").value = '';

    // Realizar la solicitud para obtener los temas del curso
    fetch(`/obtener-temas/${nombreCurso}`)
        .then(response => response.json())
        .then(data => {
            if (data.temas && data.temas.length > 0) {
                const temas = data.temas.map(tema => tema.nombre_tema);
                console.log("Temas obtenidos:", temas);

                // Encontrar la posición del tema actual
                const indiceActual = temas.indexOf(nombreVideo);

                if (indiceActual !== -1) {
                    // Tema anterior (solo si no está en la primera posición)
                    const temaAnterior = indiceActual > 0 ? temas[indiceActual - 1] : '';
                    document.getElementById("nombreVideoAnterior").value = temaAnterior;

                    // Tema siguiente (solo si no está en la última posición)
                    const temaSiguiente = indiceActual < temas.length - 1 ? temas[indiceActual + 1] : '';
                    document.getElementById("nombreVideoSiguiente").value = temaSiguiente;
                } else {
                    console.warn(`El nombre del video "${nombreVideo}" no se encontró en la lista de temas.`);
                }
            } else {
                console.warn("No se encontraron temas para este curso.");
            }
        })
        .catch(error => {
            console.error("Error al obtener la lista de temas:", error);
        });

    // Abre el modal de Bootstrap
    const modal = new bootstrap.Modal(document.getElementById("addVideoModal"));
    modal.show();
}

function cargarIframeVideo(nombreTema) {
    // Llamar al endpoint para obtener el link del video
    fetch(`/obtener-video-link?nombreTema=${encodeURIComponent(nombreTema)}`)
        .then(response => response.json())
        .then(videoData => {
            const modalBody = document.querySelector("#sendVideoModal .modal-body");

            if (videoData.success && videoData.link_video) {
                // Limpiar cualquier contenido previo en el modal
                modalBody.innerHTML = "";

                // Crear el iframe dinámicamente
                const iframeHTML = `
                    <iframe id="youtubeVideo" width="100%" height="400px"
                            src="${videoData.link_video}"
                            title="YouTube video player" frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; 
                            encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                    </iframe>
                `;

                // Insertar el iframe en el modal
                modalBody.insertAdjacentHTML('beforeend', iframeHTML);

                // Mostrar el modal
                const videoModal = new bootstrap.Modal(document.getElementById("sendVideoModal"));
                videoModal.show();
            } else {
                modalBody.innerHTML = `<p>No se encontró un video válido para este tema.</p>`;
                console.error("No se encontró un video válido:", videoData.message || "Sin detalles adicionales.");
            }
        })
        .catch(error => {
            console.error("Error al obtener el video:", error);
            alert("Hubo un error al cargar el video.");
        });
}

document.addEventListener("DOMContentLoaded", () => {
    const preguntasContainer = document.getElementById("preguntas-container");
    const agregarPreguntaBtn = document.getElementById("agregarPreguntaBtn");
    let preguntaIndex = 0;

    // Capturar el nombre del curso desde el botón
    let nombreCurso = ''; // Almacenaremos el nombre del curso globalmente

    // Cuando se hace clic en "Realizar Examen", capturamos el nombre del curso
    document.querySelectorAll('.realizarExamen').forEach(button => {
        button.addEventListener('click', (e) => {
            nombreCurso = e.target.getAttribute('data-nombre');
            console.log("Nombre del curso:", nombreCurso); // Verificar si el nombre se captura correctamente
        });
    });

    // Agregar una nueva pregunta
    agregarPreguntaBtn.addEventListener("click", () => {
        const nuevaPregunta = document.createElement("div");
        nuevaPregunta.classList.add("mb-4");
        nuevaPregunta.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h5>Pregunta ${preguntaIndex + 1}</h5>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <label for="pregunta-${preguntaIndex}" class="form-label">Texto de la pregunta:</label>
                        <input type="text" class="form-control" id="pregunta-${preguntaIndex}" name="preguntas[${preguntaIndex}][texto]" required>
                    </div>
                    <div class="alternativas-container mb-3" id="alternativas-${preguntaIndex}">
                        <!-- Alternativas se agregarán aquí -->
                    </div>
                    <button type="button" class="btn btn-outline-primary btn-sm agregarAlternativaBtn" data-index="${preguntaIndex}">
                        Agregar Alternativa
                    </button>
                </div>
            </div>
        `;
        preguntasContainer.appendChild(nuevaPregunta);
        preguntaIndex++;
    });

    // Función para agregar alternativas a una pregunta
    preguntasContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("agregarAlternativaBtn")) {
            const preguntaIndex = event.target.dataset.index;
            const alternativasContainer = document.getElementById(`alternativas-${preguntaIndex}`);
            const alternativaIndex = alternativasContainer.children.length;

            const nuevaAlternativa = document.createElement("div");
            nuevaAlternativa.classList.add("mb-2", "input-group");
            nuevaAlternativa.innerHTML = `
                <input type="text" class="form-control" name="preguntas[${preguntaIndex}][alternativas][${alternativaIndex}][texto]" placeholder="Texto de la alternativa" required>
                <input type="radio" name="preguntas[${preguntaIndex}][respuesta]" value="${alternativaIndex}" class="btn-check" id="respuesta-${preguntaIndex}-${alternativaIndex}" autocomplete="off">
                <label class="btn btn-outline-success" for="respuesta-${preguntaIndex}-${alternativaIndex}">Correcta</label>
            `;
            alternativasContainer.appendChild(nuevaAlternativa);
        }
    });

    // Función para guardar el examen (envío de datos al backend)
    const guardarExamenBtn = document.getElementById("guardarExamenBtn");
    guardarExamenBtn.addEventListener("click", () => {
        const examenData = new FormData(document.getElementById("crearExamenForm"));
        const preguntas = [];

        // Recopilar las preguntas y alternativas en un formato adecuado
        for (let i = 0; i < preguntaIndex; i++) {
            const preguntaTexto = document.getElementById(`pregunta-${i}`).value;
            const alternativas = [];
            const respuestaCorrecta = document.querySelector(`input[name="preguntas[${i}][respuesta]"]:checked`)?.value;

            const alternativasContainer = document.getElementById(`alternativas-${i}`);
            for (let j = 0; j < alternativasContainer.children.length; j++) {
                const alternativaTexto = alternativasContainer.children[j].querySelector('input[type="text"]').value;
                alternativas.push({ texto: alternativaTexto });
            }

            preguntas.push({
                texto: preguntaTexto,
                alternativas: alternativas,
                respuestaCorrecta: respuestaCorrecta
            });
        }

        // Enviar los datos al servidor para guardarlos en la base de datos
        const datosExamen = {
            nombreCurso: nombreCurso,  // Nombre del curso capturado
            preguntas: preguntas
        };

        // Realizar la solicitud al servidor para guardar el examen
        fetch("/guardar-examen", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosExamen)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert("Examen creado y guardado exitosamente.");
                } else {
                    alert(`Error: ${data.message}`);
                }
            })
            .catch(error => {
                console.error("Error al guardar el examen:", error);
                alert("Hubo un problema al guardar el examen.");
            });
    });
});
