// Función para generar la contraseña aleatoria
function generarPasswordAleatoria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
        password += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return password;
}

// Función para agregar el administrador
function agregarAdministrador(event) {
    event.preventDefault();

    // Obtener los valores de los campos
    const nombre = document.getElementById('nombre-administrador').value;
    const genero = document.getElementById('genero-administrador').value;
    const correo = document.getElementById('correo-administrador').value;
    const telefono = document.getElementById('telefono-administrador').value;
    const fecha = document.getElementById('fecha-nacimiento-administrador').value;
    const ciudad = document.getElementById('ciudad-administrador').value;
    const pais = document.getElementById('pais-administrador').value;
    const username = document.getElementById('id-administrador').value;
    const password = generarPasswordAleatoria();
    const tipoAdministrador = 'administrador';

    // Enviar los datos al servidor
    fetch('/agregar-administrador', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, fecha, genero, correo, telefono, ciudad, pais, username, password, tipoAdministrador })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Administrador agregado exitosamente');

            // Limpiar los campos del formulario
            document.getElementById('agregarAdministradorForm').reset(); // Limpia todos los inputs
            document.getElementById('genero-administrador').selectedIndex = 0; // Reinicia el select al valor predeterminado
            // Cerrar el modal manualmente usando Bootstrap
            const modal = bootstrap.Modal.getInstance(document.getElementById('agregaradministradorModal'));
            modal.hide();
        } else {
            alert('Error al agregar administrador');
        }
        cargarAdministradores();
    })
    .catch(error => console.error('Error:', error));
}

function mostrarDetallesAdministrador(id) {
    fetch(`/obtener-administrador/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('detalle-id').textContent = data.administrador.id;
                document.getElementById('detalle-nombrecompleto').textContent = data.administrador.nombrecompleto;
                // Formatear la fecha de nacimiento al formato deseado
                const fechaNacimiento = new Date(data.administrador.fecha_nacimiento);
                const fechaFormateada = fechaNacimiento.toISOString().split('T')[0];
                document.getElementById('detalle-fecha-nacimiento').textContent = fechaFormateada;
                document.getElementById('detalle-genero').textContent = data.administrador.genero;
                document.getElementById('detalle-correo').textContent = data.administrador.correo;
                document.getElementById('detalle-telefono').textContent = data.administrador.telefono;
                document.getElementById('detalle-ciudad').textContent = data.administrador.ciudad;
                document.getElementById('detalle-pais').textContent = data.administrador.pais;
            } else {
                alert('Error al cargar los detalles del administrador');
            }
            cargarAdministradores();
        })
        .catch(error => console.error('Error:', error));
}

// Función para filtrar la tabla de administradores
function filtrarAdministradores() {
    const inputBusqueda = document.querySelector('input[type="search"]');
    const filtro = inputBusqueda.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaAdministradores tbody tr');

    filas.forEach(fila => {
        const id = fila.children[0].textContent.toLowerCase();
        const nombresCompletos = fila.children[2].textContent.toLowerCase();

        // Verificar si el filtro coincide con el ID, nombre de usuario, nombres completos o correo
        if (
            id.includes(filtro) ||
            nombresCompletos.includes(filtro)
        ) {
            fila.style.display = ''; // Mostrar la fila si coincide
        } else {
            fila.style.display = 'none'; // Ocultar la fila si no coincide
        }
    });
}

// Agregar el evento de escucha al campo de búsqueda
document.querySelector('input[type="search"]').addEventListener('input', filtrarAdministradores);

// Función para cargar datos en el modal de edición
function cargarDatosEditar(id) {
    fetch(`/obtener-administrador/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('nombre-administrador').value = data.administrador.nombrecompleto;
                document.getElementById('fecha-nacimiento-administrador').value = data.administrador.fecha;
                document.getElementById('correo-administrador').value = data.administrador.correo;
                document.getElementById('telefono-administrador').value = data.administrador.telefono;
                document.getElementById('ciudad-administrador').value = data.administrador.ciudad;
                document.getElementById('pais-administrador').value = data.administrador.pais;
                document.getElementById('editarAdministradorForm').dataset.id = id; // Guardamos el ID en el formulario
                document.getElementById('agregarAdministradorForm').reset();
            } else {
                alert('Error al cargar datos del administrador');
            }
            cargarAdministradores();
        })
        .catch(error => console.error('Error:', error));
}

function actualizarAdministrador(event) {
    event.preventDefault();

    const id = document.getElementById('editarAdministradorForm').dataset.id;
    const nombre = document.getElementById('editar-nombre').value;
    const correo = document.getElementById('editar-correo').value;
    const telefono = document.getElementById('editar-telefono').value;
    const ciudad = document.getElementById('editar-ciudad').value;
    const pais = document.getElementById('editar-pais').value;

    fetch(`/editar-administrador/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, telefono, ciudad, pais })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Administrador actualizado exitosamente');
            cargarAdministradores(); // Recargar la lista de administradores
            document.getElementById('editarAdministradorForm').reset();
        } else {
            alert('Error al actualizar el administrador');
        }
    })
    .catch(error => console.error('Error:', error));
}

function eliminarAdministrador(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este administrador?")) {
        fetch('/eliminar-administrador', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Administrador eliminado exitosamente');
                cargarAdministradores(); // Llama a la función que recarga la tabla para reflejar los cambios.
            } else {
                alert('Error al eliminar administrador');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function cargarAdministradores() {
    fetch('/obtener-administradores')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tablaBody = document.getElementById('tablaAdministradores').querySelector('tbody');
                tablaBody.innerHTML = ''; // Limpiar la tabla antes de insertar nuevos datos

                data.administradores.forEach(admin => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${admin.id}</td>
                        <td>${admin.username}</td>
                        <td>${admin.nombrecompleto}</td>
                        <td>${admin.correo}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#editarAdministradorModal" onclick="cargarDatosEditar(${admin.id})">Editar</button>
                            <button class="btn btn-warning btn-sm" onclick="eliminarAdministrador(${admin.id})">Suspender</button>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#sendadministradorDetallesModal" onclick="mostrarDetallesAdministrador(${admin.id})">Detalles</button>
                        </td>
                    `;
                    tablaBody.appendChild(fila);
                });
            } else {
                alert('Error al cargar los administradores');
            }
        })
        .catch(error => console.error('Error:', error));
}

// Llama a la función al cargar la página o cuando sea necesario actualizar la lista
document.addEventListener('DOMContentLoaded', cargarAdministradores);
