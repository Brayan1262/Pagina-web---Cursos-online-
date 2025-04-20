function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
}

function cerrarSesion() {
    if (confirm("¿Estás seguro de que quieres cerrar sesión?")) {
        // Limpiar localStorage
        localStorage.clear();

        // Redirigir al login
        window.location.href = "/"; // Cambia esta ruta por la ruta real de tu login
    }
}