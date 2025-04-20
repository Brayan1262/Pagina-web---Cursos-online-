function agregarRuta(event) {
    event.preventDefault(); // Prevent form submission
    const nombre = document.getElementById('nombreRuta').value;
    const area = document.getElementById('nombreAreaRuta').value;
    const imagenRuta = document.getElementById('imagenRuta').files[0];
    const iconoRuta = document.getElementById('iconoRuta').files[0];
    const tipoRuta = document.getElementById('tipoRuta').value; // Get tipoRuta from the modal

    // Check if both images are selected
    if (!imagenRuta || !iconoRuta) {
        alert("Por favor, selecciona ambas imágenes.");
        return;
    }

    // Create a FormData object to send to the server
    const formData = new FormData();
    formData.append("nombre", nombre);
    formData.append("area", area);
    formData.append("tipoRuta", tipoRuta); // Include tipoRuta in FormData
    formData.append("imagenRuta", imagenRuta);
    formData.append("iconoRuta", iconoRuta);

    // Send data to the server
    fetch('/agregar-ruta', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Ruta agregada exitosamente');
            document.getElementById('agregarRutaForm').reset(); // Clear inputs
            const modal = bootstrap.Modal.getInstance(document.getElementById('agregarRutaModal'));
            modal.hide(); // Close modal
        } else {
            alert('Error al agregar ruta');
        }
        cargarRutas(); // Reload routes list
    })
    .catch(error => console.error('Error:', error));
}

function cargarRutas() {
    fetch('/obtener-rutas')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tablaBody = document.getElementById('tablaRutas').querySelector('tbody');
                tablaBody.innerHTML = ''; // Limpiar la tabla antes de insertar nuevos datos

                data.rutas.forEach(ruta => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${ruta.nombre}</td>
                        <td>
                            <button class="btn btn-success btn-sm" onclick="verRuta('${ruta.nombre}')" data-bs-toggle="modal" data-bs-target="#sendverrutaModal">Ver</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarRutas(${ruta.id})">Eliminar</button>
                        </td>
                    `;
                    tablaBody.appendChild(fila);
                });
            } else {
                alert('Error al cargar las rutas');
            }
        })
        .catch(error => console.error('Error:', error));
}

// Llama a esta función cuando se cargue la página
document.addEventListener('DOMContentLoaded', cargarRutas);

document.addEventListener("DOMContentLoaded", function () {
    const areaSelect = document.getElementById("nombreAreaRuta");

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


function habilitarDragAndDrop() {
    const filas = document.querySelectorAll("#rutaTableBody tr");
    let filaArrastrada = null;

    filas.forEach(fila => {
        fila.addEventListener("dragstart", function () {
            filaArrastrada = this; // Guardar la fila arrastrada
            setTimeout(() => this.classList.add("dragging"), 0);
        });

        fila.addEventListener("dragend", function () {
            filaArrastrada = null; // Limpiar referencia
            this.classList.remove("dragging");
        });

        fila.addEventListener("dragover", function (e) {
            e.preventDefault(); // Permitir dragover
            const afterElement = obtenerElementoSiguiente(this, e.clientY);
            const tbody = this.closest("tbody");
            if (afterElement == null) {
                tbody.appendChild(filaArrastrada); // Mover al final
            } else {
                tbody.insertBefore(filaArrastrada, afterElement); // Insertar antes del siguiente
            }
        });
    });
}

function obtenerElementoSiguiente(container, y) {
    const elementosArrastrables = [...container.parentElement.querySelectorAll("tr:not(.dragging)")];

    return elementosArrastrables.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function verRuta(nombreRuta) {
    fetch(`/obtener-cursos-ruta/${encodeURIComponent(nombreRuta)}`)
        .then(response => response.json())
        .then(data => {
            const rutaTableBody = document.getElementById("rutaTableBody");

            if (data.success && data.cursos.length > 0) {
                // Limpiar la tabla antes de insertar nuevos datos
                rutaTableBody.innerHTML = "";

                // Insertar filas dinámicamente en la tabla
                data.cursos.forEach(curso => {
                    const filaHTML = `
                        <tr draggable="true" data-id="${curso.id}">
                            <td>${curso.area}</td>
                            <td>${curso.nombre_curso}</td>
                        </tr>
                    `;
                    rutaTableBody.insertAdjacentHTML("beforeend", filaHTML);
                });

                // Habilitar drag-and-drop en las filas
                habilitarDragAndDrop();
                restaurarOrden();
                guardarNuevoOrden();

                // Mostrar el modal
                const rutaModal = new bootstrap.Modal(document.getElementById("sendverrutaModal"));
                rutaModal.show();
            } else {
                rutaTableBody.innerHTML = `
                    <tr>
                        <td colspan="2" class="text-center">No se encontraron cursos para esta ruta.</td>
                    </tr>
                `;
            }
        })
        .catch(error => {
            console.error("Error al cargar la ruta:", error);
            alert("Hubo un problema al cargar los cursos de la ruta.");
        });
}

// Función para guardar el nuevo orden en el localStorage
function guardarNuevoOrden() {
    const filas = document.querySelectorAll('#sendverrutaModal table tbody tr');
    const orden = Array.from(filas).map(fila => fila.dataset.id); // Usamos dataset.id para mantener el orden
    localStorage.setItem('ordenFilasCursos', JSON.stringify(orden)); // Guardamos el orden en localStorage
}

// Función para restaurar el orden de las filas desde el localStorage
function restaurarOrden() {
    const orden = JSON.parse(localStorage.getItem('ordenFilasCursos'));
    if (orden) {
        const filas = document.querySelectorAll('#sendverrutaModal table tbody tr');
        const filasArray = Array.from(filas);
        const tablaBody = document.querySelector('#sendverrutaModal table tbody');

        // Reordenamos las filas según el orden guardado en localStorage
        orden.forEach(id => {
            const fila = filasArray.find(fila => fila.dataset.id === id);
            if (fila) {
                tablaBody.appendChild(fila); // Reinsertamos las filas en el nuevo orden
            }
        });
    }
}

function eliminarRutas(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta ruta?")) {
        fetch('/eliminar-ruta', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Ruta eliminada exitosamente');
                cargarRutas(); // Llama a la función que recarga la tabla para reflejar los cambios.
            } else {
                alert('Error al eliminar ruta');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}