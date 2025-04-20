function removeCourse(button, courseName) {
    // Obtener la fila que contiene el botón de eliminar
    const row = button.parentElement.parentElement;

    // Eliminar la fila de la tabla
    row.remove();

    // Crear un nuevo elemento para mostrar el curso eliminado
    const removedCourseDiv = document.createElement('div');
    removedCourseDiv.className = 'removed-course';
    removedCourseDiv.innerHTML = `${courseName} <span class="btn btn-success btn-sm" onclick="restoreCourse(this, '${courseName}')">+</span>`;

    // Agregar el curso eliminado al contenedor
    document.getElementById('removedCourses').appendChild(removedCourseDiv);
}

function restoreCourse(button, courseName) {
    // Eliminar el curso del contenedor de cursos eliminados
    button.parentElement.remove();

    // Crear una nueva fila en la tabla
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>Arte</td>
        <td>${courseName}</td>
        <td>
            <button type="button" class="btn btn-danger btn-sm" onclick="removeCourse(this, '${courseName}')">Eliminar</button>
        </td>
    `;

    // Agregar la nueva fila a la tabla
    document.querySelector('#coursesTable tbody').appendChild(newRow);
}

// Función para agregar el administrador
function agregarRuta(event) {
    event.preventDefault();

    // Obtener los valores de los campos
    const nombre = document.getElementById('nombreRuta').value;
    const area = document.getElementById('nombreAreaRuta').value;

    // Enviar los datos al servidor
    fetch('/agregar-ruta', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, area })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Ruta agregada exitosamente');

            // Limpiar los campos del formulario
            document.getElementById('agregarRutaForm').reset(); // Limpia todos los inputs
            // Cerrar el modal manualmente usando Bootstrap
            const modal = bootstrap.Modal.getInstance(document.getElementById('agregarRutaModal'));
            modal.hide();
        } else {
            alert('Error al agregar ruta');
        }
        cargarRutas();
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
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#sendEditarRutaModal">Editar</button>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#sendverrutaModal">Ver</button>
                            <button class="btn btn-danger btn-sm">Eliminar</button>
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