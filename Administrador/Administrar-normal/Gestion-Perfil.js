document.addEventListener('DOMContentLoaded', function () {
    const nombrecompleto = localStorage.getItem('nombrecompleto');
    const correo = localStorage.getItem('correo');
    const tipo_administrador = localStorage.getItem('tipo_administrador');

    // Insertar los datos en el perfil
    document.getElementById('nombrecompleto').textContent = `Nombre: ${nombrecompleto}`;
    document.getElementById('correo').textContent = `Correo: ${correo}`;
    document.getElementById('tipo_administrador').textContent = `Rol: ${tipo_administrador}`;
});

// Mostrar los datos actuales cuando se abre el modal
document.getElementById('editProfileModal').addEventListener('show.bs.modal', function () {
    // Obtener datos desde localStorage o desde el servidor
    const nombrecompleto = localStorage.getItem('nombrecompleto');
    const correo = localStorage.getItem('correo');
    const tipo_administrador = localStorage.getItem('tipo_administrador');
    const foto = localStorage.getItem('foto'); // Obtener el nombre de la foto de perfil

    // Llenar los campos del formulario con los valores actuales
    document.getElementById('adminName').value = nombrecompleto || ''; 
    document.getElementById('adminEmail').value = correo || '';
    document.getElementById('adminRole').value = tipo_administrador || '';
    if (foto) {
        document.querySelector('.profile-image').src = `../imagenes/${foto}`; // Actualizar imagen en el perfil
    }
});

document.getElementById('saveProfileButton').addEventListener('click', () => {
    const adminName = document.getElementById('adminName').value;
    const adminEmail = document.getElementById('adminEmail').value;
    const adminRole = document.getElementById('adminRole').value;
    const adminImage = document.getElementById('adminImage').files[0];

    // Obtener el username del almacenamiento local
    const username = localStorage.getItem('username'); 

    const formData = new FormData();
    formData.append('nombrecompleto', adminName);
    formData.append('correo', adminEmail);
    formData.append('tipo_administrador', adminRole);
    if (adminImage) {
        formData.append('foto', adminImage);
    }
    formData.append('username', username); // Incluir el username

    fetch('/actualizar-perfil', {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Perfil actualizado correctamente.');
            location.reload(); // Refrescar la página
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});
