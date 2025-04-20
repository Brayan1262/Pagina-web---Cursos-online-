document.addEventListener('DOMContentLoaded', () => {
    const areaSelect = document.getElementById('areaRuta');

    // Función para cargar áreas
    async function cargarAreas() {
        try {
            const response = await fetch('/obtener-areas-rutas');
            const areas = await response.json();

            // Limpiar las opciones existentes
            areaSelect.innerHTML = `<option value="" disabled selected>Seleccionar Area de ruta</option>`;

            // Agregar opciones dinámicamente
            areas.forEach(area => {
                const option = document.createElement('option');
                option.value = area;
                option.textContent = area;
                areaSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error al cargar las áreas:', error);
        }
    }

    cargarAreas();
});

document.addEventListener('DOMContentLoaded', () => {
    const areaSelect = document.getElementById('areaRuta');
    const rutaInput = document.getElementById('ruta');
    const sugerenciasContenedor = document.getElementById('sugerenciasRuta');
    let rutas = []; // Variable para almacenar rutas filtradas

    // Función para cargar rutas por área
    async function cargarRutas(area) {
        try {
            const response = await fetch(`/obtener-areas-ruta/${area}`);
            rutas = await response.json();
        } catch (error) {
            console.error('Error al cargar las rutas:', error);
        }
    }

    // Evento: Cambiar área
    areaSelect.addEventListener('change', async () => {
        const areaSeleccionada = areaSelect.value;

        // Limpiar input y sugerencias
        rutaInput.value = '';
        sugerenciasContenedor.innerHTML = '';

        // Cargar rutas filtradas por área
        if (areaSeleccionada) {
            await cargarRutas(areaSeleccionada);
        }
    });

    // Evento: Mostrar sugerencias al escribir
    rutaInput.addEventListener('input', () => {
        const texto = rutaInput.value.toLowerCase();

        // Filtrar rutas que coincidan con el texto ingresado
        const coincidencias = rutas.filter(ruta => ruta.toLowerCase().includes(texto));

        // Mostrar las coincidencias como sugerencias
        sugerenciasContenedor.innerHTML = '';
        coincidencias.forEach(ruta => {
            const opcion = document.createElement('div');
            opcion.classList.add('list-group-item', 'list-group-item-action');
            opcion.textContent = ruta;

            // Evento: Seleccionar una sugerencia
            opcion.addEventListener('click', () => {
                rutaInput.value = ruta; // Asignar la ruta seleccionada al input
                sugerenciasContenedor.innerHTML = ''; // Limpiar sugerencias
            });

            sugerenciasContenedor.appendChild(opcion);
        });

        // Si no hay coincidencias, mostrar "No se encontraron resultados"
        if (texto && coincidencias.length === 0) {
            sugerenciasContenedor.innerHTML = `<div class="list-group-item disabled">No se encontraron resultados</div>`;
        }
    });

    // Ocultar sugerencias al perder el foco
    rutaInput.addEventListener('blur', () => {
        setTimeout(() => sugerenciasContenedor.innerHTML = '', 200);
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
    const formData = new FormData();
    formData.append("nombre_curso", nombreCurso);
    formData.append("nombre_profesor", docente);
    formData.append("imagenDocente", document.getElementById("imagenDocente").files[0]);

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
                                        <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addVideoModal">Insertar video</button>
                                        <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#sendVideoModal">Ver video</button>
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
            // Limpiar el formulario después de agregar el curso
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
                                Curso de ${curso.nombre_curso} - ${curso.nombre_profesor}
                            </button>
                        </h2>
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

            if (temaData.temas && temaData.temas.length > 0) {
                temaData.temas.forEach(tema => {
                    const temaHTML = `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            ${tema.nombre_tema}
                            <div class="d-flex justify-content-end gap-2">
                                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#addVideoModal">Insertar video</button>
                                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#sendVideoModal">Ver video</button>
                            </div>
                        </li>
                    `;
                    temasList.insertAdjacentHTML('beforeend', temaHTML);
                });
            } else {
                temasList.insertAdjacentHTML('beforeend', '<li class="list-group-item">No hay temas disponibles</li>');
            }
        })
        .catch(error => {
            console.error("Error al obtener los temas:", error);
        });
}
