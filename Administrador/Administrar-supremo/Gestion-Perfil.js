document.addEventListener('DOMContentLoaded', () => {
    // Obtener datos del usuario desde localStorage
    const nombreCompleto = localStorage.getItem('nombrecompleto');
    const correo = localStorage.getItem('correo');
    const tipoAdministrador = localStorage.getItem('tipo_administrador');
    const foto = localStorage.getItem('foto');

    // Construir la URL de la foto
    let fotoUrl;
    if (foto && foto !== "null") {
        fotoUrl = `../imagenes/${foto}`; // Foto válida desde localStorage
    } else {
        fotoUrl = "../imagenes/jorge.webp"; // Foto predeterminada
    }

    // Actualizar los elementos del DOM con los datos
    document.getElementById('nombrecompleto').textContent = `Nombre: ${nombreCompleto}`;
    document.getElementById('correo').textContent = `Correo: ${correo}`;
    document.getElementById('tipo_administrador').textContent = `Rol: ${tipoAdministrador}`;
    document.querySelector('.profile-image').src = fotoUrl; // Actualizar la foto del perfil

    console.log("Foto mostrada:", fotoUrl); // Verifica la ruta en la consola
});

// Cargar datos actuales al abrir el modal
document.querySelector("#editProfileModal").addEventListener("show.bs.modal", () => {
    document.getElementById("adminName").value = localStorage.getItem("nombrecompleto") || "Nombre no disponible";
    document.getElementById("adminEmail").value = localStorage.getItem("correo") || "Correo no disponible";
    document.getElementById("adminRole").value = localStorage.getItem("tipo_administrador") || "Rol no disponible";
});

// Guardar cambios del perfil
document.getElementById("saveProfileButton").addEventListener("click", () => {
    const adminName = document.getElementById("adminName").value;
    const adminEmail = document.getElementById("adminEmail").value;
    const adminRole = document.getElementById("adminRole").value;
    const adminImage = document.getElementById("adminImage").files[0]; // Archivo de imagen

    if (!adminName || !adminEmail || !adminRole) {
        alert("Por favor, completa todos los campos.");
        return;
    }

    // Crear un FormData para enviar los datos, incluyendo la imagen
    const formData = new FormData();
    formData.append("nombrecompleto", adminName);
    formData.append("correo", adminEmail);
    formData.append("tipo_administrador", adminRole);
    if (adminImage) {
        formData.append("foto", adminImage);
    }

    // Enviar datos al backend
    fetch("/editar-perfil", {
        method: "POST",
        body: formData,
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                alert("Perfil actualizado exitosamente.");

                // Actualizar los datos en localStorage
                localStorage.setItem("nombrecompleto", adminName);
                localStorage.setItem("correo", adminEmail);
                localStorage.setItem("tipo_administrador", adminRole);
                if (data.foto) {
                    localStorage.setItem("foto", data.foto);
                }

                // Actualizar la interfaz con los nuevos datos
                document.getElementById("nombrecompleto").textContent = `Nombre: ${adminName}`;
                document.getElementById("correo").textContent = `Correo: ${adminEmail}`;
                document.getElementById("tipo_administrador").textContent = `Rol: ${adminRole}`;
                if (data.foto) {
                    document.querySelector(".profile-image").src = `../imagenes/${data.foto}`;
                }

                // Cerrar el modal
                const modal = bootstrap.Modal.getInstance(document.getElementById("editProfileModal"));
                modal.hide();
            } else {
                alert(`Error: ${data.message}`);
            }
        })
        .catch((error) => {
            console.error("Error al actualizar el perfil:", error);
            alert("Hubo un problema al actualizar el perfil.");
        });
});
