// Función para agregar el administrador
function agregarArea(event) {
    event.preventDefault();

    // Obtener los valores de los campos
    const nombreArea = document.getElementById('nombre-area').value;

    // Enviar los datos al servidor
    fetch('/agregar-area', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombreArea })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profesor agregado exitosamente');

            // Limpiar los campos del formulario
            document.getElementById('agregarProfesorForm').reset(); // Limpia todos los inputs
            document.getElementById('genero-usuarios').selectedIndex = 0; // Reinicia el select al valor predeterminado
            document.getElementById('plan-usuarios').selectedIndex = 0;
            // Cerrar el modal manualmente usando Bootstrap
            const modal = bootstrap.Modal.getInstance(document.getElementById('agregarProfesorForm'));
            modal.hide();
        } else {
            alert('Error al agregar area');
        }
        cargarAreas();
    })
    .catch(error => console.error('Error:', error));
}

// Función para cargar datos en el modal de edición
function cargarDatosAreasEditar(id) {
    fetch(`/obtener-area/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('editar-nombre-area').value = data.area.nombre_area;
                document.getElementById('editarCategoriasAreasForm').dataset.id = id; // Guardamos el ID en el formulario
            } else {
                alert('Error al cargar datos del area');
            }
            cargarAreas();
        })
        .catch(error => console.error('Error:', error));
}

function actualizarArea(event) {
    event.preventDefault();

    const id = document.getElementById('editarCategoriasAreasForm').dataset.id;
    const nombreArea = document.getElementById('editar-nombre-area').value;

    fetch(`/editar-area/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreArea })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Area actualizado exitosamente');
            cargarAreas(); // Recargar la lista de administradores
            document.getElementById('editarCategoriasAreasForm').reset();
        } else {
            alert('Error al editar el area');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Función para filtrar la tabla de administradores
function filtrarAreas() {
    const inputBusqueda = document.querySelector('input[id="buscarArea"]');
    const filtro = inputBusqueda.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaCategorias tbody tr');

    filas.forEach(fila => {
        const id = fila.children[0].textContent.toLowerCase();
        const nombre = fila.children[1].textContent.toLowerCase();

        // Verificar si el filtro coincide con el ID, nombre de usuario, nombres completos o correo
        if (
            id.includes(filtro) ||
            nombre.includes(filtro)
        ) {
            fila.style.display = ''; // Mostrar la fila si coincide
        } else {
            fila.style.display = 'none'; // Ocultar la fila si no coincide
        }
    });
}

// Agregar el evento de escucha al campo de búsqueda
document.querySelector('input[id="buscarArea"]').addEventListener('input', filtrarAreas);

function eliminarArea(id) {
    if (confirm("¿Estás seguro de que deseas eliminar esta area?")) {
        fetch('/eliminar-area', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Area eliminado exitosamente');
                cargarAreas(); // Llama a la función que recarga la tabla para reflejar los cambios.
            } else {
                alert('Error al eliminar area');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function cargarAreas() {
    fetch('/obtener-areas')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tablaBody = document.getElementById('tablaCategorias').querySelector('tbody');
                tablaBody.innerHTML = ''; // Limpiar la tabla antes de insertar nuevos datos

                data.areas.forEach(area => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${area.id}</td>
                        <td>${area.nombre_area}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editarCategoriasAreasModal" onclick="cargarDatosAreasEditar(${area.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarArea(${area.id})">Eliminar</button>
                        </td>
                    `;
                    tablaBody.appendChild(fila);
                });
            } else {
                alert('Error al cargar los usuarios');
            }
        })
        .catch(error => console.error('Error:', error));
}

// Llama a esta función cuando se cargue la página
document.addEventListener('DOMContentLoaded', cargarAreas);