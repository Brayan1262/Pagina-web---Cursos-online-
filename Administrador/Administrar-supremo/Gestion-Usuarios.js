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
function agregarUsuario(event) {
    event.preventDefault();

    // Obtener los valores de los campos
    const nombre = document.getElementById('nombres-usuarios').value;
    const apellidos = document.getElementById('apellidos-usuarios').value;
    const genero = document.getElementById('genero-usuarios').value;
    const correo = document.getElementById('correo-usuarios').value;
    const telefono = document.getElementById('telefono-usuarios').value;
    const plan = document.getElementById('plan-usuarios').value;
    const beca = document.getElementById('beca-usuarios').value;
    const fecha = document.getElementById('fecha-nacimiento-usuarios').value;
    const ciudad = document.getElementById('ciudad-usuarios').value;
    const pais = document.getElementById('pais-usuarios').value;
    const username = document.getElementById('usser-usuarios').value;
    const password = generarPasswordUsuarioAleatoria();

    // Enviar los datos al servidor
    fetch('/agregar-usuario', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombre, apellidos, genero, correo, telefono, plan, beca, fecha, ciudad, pais, username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Usuario agregado exitosamente');

            // Limpiar los campos del formulario
            document.getElementById('agregarUsuarioForm').reset(); // Limpia todos los inputs
            document.getElementById('genero-usuarios').selectedIndex = 0; // Reinicia el select al valor predeterminado
            document.getElementById('plan-usuarios').selectedIndex = 0;
            document.getElementById('beca-usuarios').selectedIndex = 0;
            // Cerrar el modal manualmente usando Bootstrap
            const modal = bootstrap.Modal.getInstance(document.getElementById('agregarUsuarioModal'));
            modal.hide();
        } else {
            alert('Error al agregar usuario');
        }
        cargarUsuarios();
    })
    .catch(error => console.error('Error:', error));
}

// Función para cargar datos en el modal de edición
function cargarDatosUsuariosEditar(id) {
    fetch(`/obtener-usuario/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('nombres-usuarios').value = data.usuario.nombres;
                document.getElementById('apellidos-usuarios').value = data.usuario.apellidos;
                document.getElementById('correo-usuarios').value = data.usuario.correo;
                document.getElementById('telefono-usuarios').value = data.usuario.telefono;
                document.getElementById('plan-usuarios').value = data.usuario.plan;
                document.getElementById('beca-usuarios').value = data.usuario.beca;
                document.getElementById('ciudad-usuarios').value = data.usuario.ciudad;
                document.getElementById('pais-usuarios').value = data.usuario.pais;
                document.getElementById('editarUsuarioForm').dataset.id = id; // Guardamos el ID en el formulario
                document.getElementById('agregarUsuarioForm').reset();
            } else {
                alert('Error al cargar datos del administrador');
            }
            cargarUsuarios();
        })
        .catch(error => console.error('Error:', error));
}

function actualizarUsuarios(event) {
    event.preventDefault();

    const id = document.getElementById('editarUsuarioForm').dataset.id;
    const nombre = document.getElementById('editar-usuario-nombres').value;
    const apellidos = document.getElementById('editar-usuario-apellidos').value;
    const correo = document.getElementById('editar-usuario-email').value;
    const telefono = document.getElementById('editar-usuario-telefono').value;
    const plan = document.getElementById('editar-usuario-plan').value;
    const beca = document.getElementById('editar-usuario-beca').value;
    const ciudad = document.getElementById('editar-usuario-ciudad').value;
    const pais = document.getElementById('editar-usuario-pais').value;

    fetch(`/editar-usuario/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, apellidos, correo, telefono, plan, beca, ciudad, pais })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Usuario actualizado exitosamente');
            cargarUsuarios(); // Recargar la lista de administradores
            document.getElementById('editarUsuarioForm').reset();
        } else {
            alert('Error al editar el usuario');
        }
    })
    .catch(error => console.error('Error:', error));
}

function mostrarDetallesUsuarios(id) {
    fetch(`/obtener-usuario/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('detalle-usuario-nombres').textContent = data.usuario.nombres;
                document.getElementById('detalle-usuario-apellidos').textContent = data.usuario.apellidos;
                document.getElementById('detalle-usuario-genero').textContent = data.usuario.genero;
                document.getElementById('detalle-usuario-correo').textContent = data.usuario.correo;
                document.getElementById('detalle-usuario-telefono').textContent = data.usuario.telefono;
                const fechaNacimiento = new Date(data.usuario.fecha_nacimiento);
                const fechaFormateada = fechaNacimiento.toISOString().split('T')[0];
                document.getElementById('detalle-usuario-fecha-nacimiento').textContent = fechaFormateada;
                document.getElementById('detalle-usuario-plan').textContent = data.usuario.plan;
                document.getElementById('detalle-usuario-beca').textContent = data.usuario.beca;
                document.getElementById('detalle-usuario-ciudad').textContent = data.usuario.ciudad;
                document.getElementById('detalle-usuario-pais').textContent = data.usuario.pais;
            } else {
                alert('Error al cargar los detalles del usuario');
            }
            cargarUsuarios();
        })
        .catch(error => console.error('Error:', error));
}

// Función para filtrar la tabla de administradores
function filtrarUsuarios() {
    const inputBusqueda = document.querySelector('input[id="buscarUsuarios"]');
    const filtro = inputBusqueda.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaUsuarios tbody tr');

    filas.forEach(fila => {
        const id = fila.children[0].textContent.toLowerCase();
        const nombre = fila.children[1].textContent.toLowerCase();
        const apellidos = fila.children[2].textContent.toLowerCase();

        // Verificar si el filtro coincide con el ID, nombre de usuario, nombres completos o correo
        if (
            id.includes(filtro) ||
            nombre.includes(filtro) ||
            apellidos.includes(filtro)
        ) {
            fila.style.display = ''; // Mostrar la fila si coincide
        } else {
            fila.style.display = 'none'; // Ocultar la fila si no coincide
        }
    });
}

// Agregar el evento de escucha al campo de búsqueda
document.querySelector('input[id="buscarUsuarios"]').addEventListener('input', filtrarUsuarios);

function eliminarUsuarios(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este usuario?")) {
        fetch('/eliminar-usuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Usuario eliminado exitosamente');
                cargarUsuarios(); // Llama a la función que recarga la tabla para reflejar los cambios.
            } else {
                alert('Error al eliminar usuario');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function cargarUsuarios() {
    fetch('/obtener-usuarios')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tablaBody = document.getElementById('tablaUsuarios').querySelector('tbody');
                tablaBody.innerHTML = ''; // Limpiar la tabla antes de insertar nuevos datos

                data.usuarios.forEach(usuario => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${usuario.id}</td>
                        <td>${usuario.nombres}</td>
                        <td>${usuario.apellidos}</td>
                        <td>${usuario.correo}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#sendEditarEstudianteModal" onclick="cargarDatosUsuariosEditar(${usuario.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarUsuarios(${usuario.id})">Eliminar</button>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#sendEstudianteDetallesModal" onclick="mostrarDetallesUsuarios(${usuario.id})">Detalles</button>
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
document.addEventListener('DOMContentLoaded', cargarUsuarios);
