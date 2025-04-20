function mostrarDetallesUsuario(id) {
    fetch(`/obtener-usuario/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Llenamos los detalles del usuario en el modal
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
        })
        .catch(error => console.error('Error:', error));
}

function mostrarDetallesPago(id) {
    fetch(`/obtener-usuario/${id}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Llenamos los detalles del usuario en el modal
                document.getElementById('detalle-pago-nombres').textContent = data.usuario.nombres;
                document.getElementById('detalle-pago-apellidos').textContent = data.usuario.apellidos;
                document.getElementById('detalle-pago-genero').textContent = data.usuario.genero;
                document.getElementById('detalle-pago-correo').textContent = data.usuario.correo;
                document.getElementById('detalle-pago-telefono').textContent = data.usuario.telefono;
                const fechaNacimiento = new Date(data.usuario.fecha_nacimiento);
                const fechaFormateada = fechaNacimiento.toISOString().split('T')[0];
                document.getElementById('detalle-pago-fecha-nacimiento').textContent = fechaFormateada;
                document.getElementById('detalle-pago-plan').textContent = data.usuario.plan;
                document.getElementById('detalle-pago-beca').textContent = data.usuario.beca;
                document.getElementById('detalle-pago-ciudad').textContent = data.usuario.ciudad;
                document.getElementById('detalle-pago-pais').textContent = data.usuario.pais;
            } else {
                alert('Error al cargar los detalles del usuario');
            }
        })
        .catch(error => console.error('Error:', error));
}

function eliminarPagos(id, tipo) {
    if (confirm("¿Estás seguro de que deseas eliminar este registro de pago?")) {
        fetch('/eliminar-pago', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id , tipo }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Registro de pago eliminado exitosamente');
                cargarPagos(); // Llama a la función que recarga la tabla para reflejar los cambios.
            } else {
                alert('Error al eliminar el registro de pago');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

// Función para filtrar la tabla de administradores
function filtrarPagos() {
    const inputBusqueda = document.querySelector('input[id="buscarPagos"]');
    const filtro = inputBusqueda.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaPagos tbody tr');

    filas.forEach(fila => {
        const id_usuario = fila.children[0].textContent.toLowerCase();
        const id_transaccion = fila.children[1].textContent.toLowerCase();

        // Verificar si el filtro coincide con el ID, nombre de usuario, nombres completos o correo
        if (
            id_usuario.includes(filtro) ||
            id_transaccion.includes(filtro)
        ) {
            fila.style.display = ''; // Mostrar la fila si coincide
        } else {
            fila.style.display = 'none'; // Ocultar la fila si no coincide
        }
    });
}

// Agregar el evento de escucha al campo de búsqueda
document.querySelector('input[id="buscarPagos"]').addEventListener('input', filtrarPagos);

// Función para filtrar la tabla de administradores
function filtrarControlPagos() {
    const inputBusqueda = document.querySelector('input[id="buscarControlPago"]');
    const filtro = inputBusqueda.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaControlPagos tbody tr');

    filas.forEach(fila => {
        const id_usuario = fila.children[0].textContent.toLowerCase();

        // Verificar si el filtro coincide con el ID, nombre de usuario, nombres completos o correo
        if (
            id_usuario.includes(filtro)
        ) {
            fila.style.display = ''; // Mostrar la fila si coincide
        } else {
            fila.style.display = 'none'; // Ocultar la fila si no coincide
        }
    });
}

// Agregar el evento de escucha al campo de búsqueda
document.querySelector('input[id="buscarControlPago"]').addEventListener('input', filtrarControlPagos);

// Función para cargar los pagos
function cargarPagos() {
    fetch('/obtener-pagos')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tablaPagosBody = document.getElementById('tablaPagos').querySelector('tbody');
                const tablaControlPagosBody = document.getElementById('tablaControlPagos').querySelector('tbody');

                // Limpiar ambas tablas antes de insertar nuevos datos
                tablaPagosBody.innerHTML = '';
                tablaControlPagosBody.innerHTML = '';

                data.pagos.forEach(pago => {
                    const fila = document.createElement('tr');

                    if (pago.fecha_pago) {
                        // Pago con fecha de pago: Mostrar en 'tablaPagos'
                        const fechaSolo = pago.fecha_pago.split('T')[0];
                        fila.innerHTML = `
                            <td>${pago.id_usuario}</td>
                            <td>${pago.id_transaccion}</td>
                            <td>S/. ${pago.monto.toFixed(2)}</td>
                            <td>${pago.tipo_pago}</td>
                            <td>${pago.plan}</td>
                            <td>${fechaSolo}</td>
                            <td>
                                <button class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#sendEstudianteDetallesModal" onclick="mostrarDetallesUsuario(${pago.id_usuario})">Detalles</button>
                                <button class="btn btn-danger btn-sm" onclick="eliminarPagos('${pago.id_transaccion}', 'transaccion')">Eliminar</button>
                            </td>
                        `;
                        tablaPagosBody.appendChild(fila);
                    } else {
                        // Pago sin fecha de pago (fecha_pago es null): Mostrar en 'tablaControlPagos'
                        const fechaSolo = pago.fecha_vencimiento.split('T')[0];
                        fila.innerHTML = `
                            <td>${pago.id_usuario}</td>
                            <td>${pago.plan}</td>
                            <td>S/. ${pago.monto.toFixed(2)}</td>
                            <td>${fechaSolo}</td>
                            <td>
                                <button class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#sendDetallesPagoModal" onclick="mostrarDetallesPago(${pago.id_usuario})">Detalles</button>
                                <button class="btn btn-warning btn-sm" data-bs-toggle="modal" data-bs-target="#responseModal">Advertir</button>
                                <button class="btn btn-success btn-sm" onclick="eliminarPagos('${pago.id_usuario}', 'usuario')">Suspender</button>
                            </td>
                        `;
                        tablaControlPagosBody.appendChild(fila);
                    }
                });
            } else {
                alert('Error al cargar los pagos');
            }
        })
        .catch(error => console.error('Error:', error));
}

// Llamamos a la función al cargar la página
document.addEventListener('DOMContentLoaded', cargarPagos);