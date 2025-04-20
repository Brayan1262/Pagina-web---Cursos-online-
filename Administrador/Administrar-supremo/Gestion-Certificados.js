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

function eliminarCertificados(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este certificado?")) {
        fetch('/eliminar-certificado', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Certificado eliminado exitosamente');
                cargarCertificados(); // Llama a la función que recarga la tabla para reflejar los cambios.
            } else {
                alert('Error al eliminar el certificado');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

// Función para filtrar la tabla de administradores
function filtrarCertificados() {
    const inputBusqueda = document.querySelector('input[id="buscarCertificados"]');
    const filtro = inputBusqueda.value.toLowerCase();
    const filas = document.querySelectorAll('#tablaCertificados tbody tr');

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
document.querySelector('input[id="buscarCertificados"]').addEventListener('input', filtrarCertificados);

function cargarCertificados() {
    fetch('/obtener-certificados')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const tablaBody = document.getElementById('tablaCertificados').querySelector('tbody');
                tablaBody.innerHTML = ''; // Limpiar la tabla antes de insertar nuevos datos

                data.certificados.forEach(certificado => {
                    const fila = document.createElement('tr');
                    const fechaSolo = certificado.fecha_emision.split('T')[0];
                    fila.innerHTML = `
                        <td>${certificado.id_usuario}</td>
                        <td>${certificado.tipo_certificado}</td>
                        <td>${fechaSolo}</td>
                        <td>
                            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#sendEstudianteDetallesModal" onclick="mostrarDetallesUsuario(${certificado.id_usuario})">Detalles</button>
                            <button class="btn btn-info btn-sm">Ver</button>
                            <button class="btn btn-danger btn-sm" onclick="eliminarCertificados(${certificado.id_certificado})">Eliminar</button>
                        </td>
                    `;
                    tablaBody.appendChild(fila);
                });
            } else {
                alert('Error al cargar los certificados');
            }
        })
        .catch(error => console.error('Error:', error));
}

// Llama a esta función cuando se cargue la página
document.addEventListener('DOMContentLoaded', cargarCertificados);