// Almacena la URL original del video
var videoURL = document.getElementById("youtubeVideo").src;

// Evento cuando se cierra el modal
document.getElementById('sendVideoModal').addEventListener('hidden.bs.modal', function () {
    // Restablece la URL del iframe para detener el video
    document.getElementById("youtubeVideo").src = "";
});

// Evento cuando se vuelve a abrir el modal
document.getElementById('sendVideoModal').addEventListener('shown.bs.modal', function () {
    // Vuelve a cargar el video cuando se abre el modal
    document.getElementById("youtubeVideo").src = videoURL;
});