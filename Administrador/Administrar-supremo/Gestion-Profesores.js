// Función para generar la contraseña aleatoria
function generarPasswordUsuarioAleatoria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return password;
}

// Función para agregar el administrador
function agregarProfesor(event) {
    event.preventDefault();

    // Obtener los valores de los campos
    const nombre = document.getElementById('nombres-profesor').value;
    const apellidos = document.getElementById('apellidos-profesor').value;
    const genero = document.getElementById('genero-profesor').value;
    const correo = document.getElementById('correo-profesor').value;
    const telefono = document.getElementById('telefono-profesor').value;
    const plan = document.getElementById('plan-profesor').value;
    const fecha = document.getElementById('fecha-nacimiento-profesor').value;
    const ciudad = document.getElementById('ciudad-profesor').value;
    const pais = document.getElementById('pais-profesor').value;
    const area = document.getElementById('area-profesor').value;
    const carrera = document.getElementById('carrera-profesor').value;
    const username = document.getElementById('usser-profesor').value;
    const password = generarPasswordUsuarioAleatoria();

    // Enviar los datos al servidor
    fetch('/agregar-profesor', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, apellidos, genero, correo, telefono, plan, fecha, ciudad, pais, area, carrera, username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profesor agregado exitosamente');

            // Limpiar los campos del formulario
            document.getElementById('agregarProfesorForm').reset(); // Limpia todos los inputs
            document.getElementById('genero-profesor').selectedIndex = 0; // Reinicia el select al valor predeterminado
            document.getElementById('plan-profesor').selectedIndex = 0;
            document.getElementById('plan-usuarios').selectedIndex = 0;
            // Cerrar el modal manualmente usando Bootstrap
            const modal = bootstrap.Modal.getInstance(document.getElementById('agregarProfesorForm'));
            modal.hide();
            cargarProfesor();
        } else {
            alert('Error al agregar usuario');
        }
    })
    .catch(error => console.error('Error:', error));
}

// Función para cargar datos en el modal de edición
function cargarDatosProfesoresEditar(id) {
    fetch(`/obtener-profesor/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('editar-profesor-nombres').value = data.profesor.nombres;
                document.getElementById('editar-profesor-apellidos').value = data.profesor.apellidos;
                document.getElementById('editar-profesor-email').value = data.profesor.correo;
                document.getElementById('editar-profesor-telefono').value = data.profesor.telefono;
                document.getElementById('editar-profesor-plan').value = data.profesor.plan;
                document.getElementById('editar-profesor-ciudad').value = data.profesor.ciudad;
                document.getElementById('editar-profesor-pais').value = data.profesor.pais;
                document.getElementById('editarProfesorForm').dataset.id = id; // Guardamos el ID en el formulario
            } else {
                alert('Error al cargar datos del administrador');
            }
            cargarProfesor();
        })
        .catch(error => console.error('Error:', error));
}

function actualizarProfesores(event) {
    event.preventDefault();

    const id = document.getElementById('editarProfesorForm').dataset.id;
    const nombre = document.getElementById('editar-profesor-nombres').value;
    const apellidos = document.getElementById('editar-profesor-apellidos').value;
    const correo = document.getElementById('editar-profesor-email').value;
    const telefono = document.getElementById('editar-profesor-telefono').value;
    const plan = document.getElementById('editar-profesor-plan').value;
    const ciudad = document.getElementById('editar-profesor-ciudad').value;
    const pais = document.getElementById('editar-profesor-pais').value;

    fetch(`/editar-profesor/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellidos, correo, telefono, plan, ciudad, pais })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profesor actualizado exitosamente');
            cargarProfesor(); // Recargar la lista de administradores
            document.getElementById('editarProfesorForm').reset();
        } else {
            alert('Error al editar el profesor');
        }
    })
    .catch(error => console.error('Error:', error));
}

function mostrarDetallesProfesor(id) {
    fetch(`/obtener-profesor/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('detalle-profesor-nombres').textContent = data.profesor.nombres;
                document.getElementById('detalle-profesor-apellidos').textContent = data.profesor.apellidos;
                document.getElementById('detalle-profesor-genero').textContent = data.profesor.genero;
                document.getElementById('detalle-profesor-correo').textContent = data.profesor.correo;
                document.getElementById('detalle-profesor-telefono').textContent = data.profesor.telefono;
                const fechaNacimiento = new Date(data.profesor.fecha_nacimiento);
                const fechaFormateada = fechaNacimiento.toISOString().split('T')[0];
                document.getElementById('detalle-profesor-fecha-nacimiento').textContent = fechaFormateada;
                document.getElementById('detalle-profesor-plan').textContent = data.profesor.plan;
                document.getElementById('detalle-profesor-ciudad').textContent = data.profesor.ciudad;
                document.getElementById('detalle-profesor-pais').textContent = data.profesor.pais;
                document.getElementById('detalle-profesor-area').textContent = data.profesor.area;
                document.getElementById('detalle-profesor-carrera').textContent = data.profesor.carrera;
            } else {
                alert('Error al cargar los detalles del profesor');
            }
            cargarProfesor();
        })
        .catch(error => console.error('Error:', error));
}

// Función para filtrar la tabla de administradores
function filtrarProfesores() {
    const inputBusqueda = document.querySelector('input[id="buscarProfesores"]');
    const filtro = inputBusqueda.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaProfesor tbody tr');

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
document.querySelector('input[id="buscarProfesores"]').addEventListener('input', filtrarProfesores);

function eliminarProfesores(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        fetch('/eliminar-profesor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Profesor eliminado exitosamente');
                cargarProfesor(); // Llama a la función que recarga la tabla para reflejar los cambios.
            } else {
                alert('Error al eliminar profesor');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function cargarProfesor() {
    fetch('/obtener-profesores')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tablaBody = document.getElementById('tablaProfesor').querySelector('tbody');
                tablaBody.innerHTML = ''; // Limpiar la tabla antes de insertar nuevos datos

                data.profesores.forEach(profesor => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${profesor.id}</td>
                        <td>${profesor.nombres}</td>
                        <td>${profesor.apellidos}</td>
                        <td>${profesor.correo}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#sendEditarDocenteModal" onclick="cargarDatosProfesoresEditar(${profesor.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarProfesores(${profesor.id})">Eliminar</button>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#sendDocenteDetallesModal" onclick="mostrarDetallesProfesor(${profesor.id})">Detalles</button>
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
document.addEventListener('DOMContentLoaded', cargarProfesor);

document.addEventListener("DOMContentLoaded", function () {
    const areaSelect = document.getElementById("area-profesor");

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
