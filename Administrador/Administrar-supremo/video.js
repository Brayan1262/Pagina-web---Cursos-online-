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

// Función para convertir el link de YouTube a embed
function convertirLinkAEmbed(link) {
    // Comprobamos si el link es de YouTube
    const regex = /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)(?:&t=(\d+))?/;
    const match = link.match(regex);
    
    if (match) {
        const videoId = match[1]; // ID del video
        const startTime = match[2] || 0; // Tiempo de inicio en segundos, por defecto 0
        
        // Retornamos el link embebido con el tiempo de inicio si está disponible
        return `https://www.youtube.com/embed/${videoId}?start=${startTime}`;
    }
    
    return link; // Si no es un link de YouTube, retornamos el link original
}

function guardarVideoDesdeModal(event) {
    // Prevenir el comportamiento predeterminado del formulario
    event.preventDefault();

    // Capturar los datos del modal
    const nombreCurso = document.getElementById("nombreCursoVideo").value; // Nombre del curso
    const nombreVideo = document.getElementById("nombreVideo").value; // Nombre del video
    const resumenVideo = document.getElementById("resumen").value; // Resumen del video
    const nombreVideoSiguiente = document.getElementById("nombreVideoSiguiente").value; // Siguiente video
    const nombreVideoAnterior = document.getElementById("nombreVideoAnterior").value; // Anterior video
    let link = document.getElementById("videoLink").value; // Link del video

    // Convertimos el link a formato embed si es un link de YouTube
    const videoLink = convertirLinkAEmbed(link);

    // Verificamos que los campos obligatorios no estén vacíos
    if (!nombreCurso || !nombreVideo || !resumenVideo || !videoLink) {
        alert("Por favor, completa los campos obligatorios.");
        return;
    }

    // Crear el cuerpo de los datos a enviar
    const videoData = {
        nombreCurso,
        nombreVideo,
        videoLink,
        resumenVideo,
        siguienteVideo: nombreVideoSiguiente || null, // Permitir nulo si no se completa
        anteriorVideo: nombreVideoAnterior || null, // Permitir nulo si no se completa
        estado: "S" // Estado siempre 'S'
    };

    console.log("Datos enviados al servidor:", videoData);

    // Realizar la solicitud al backend
    fetch("/guardar-video", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(videoData)
    })
        .then(response => response.json())
        .then(data => {
            const modalBody = document.querySelector("#addVideoModal .modal-body");

            if (data.success) {
                // Mostrar un mensaje de éxito
                alert("Video guardado exitosamente");

                // Limpiar los campos del formulario después de guardar
                document.getElementById("agregarVideoForm").reset();
            } else {
                // Mostrar un mensaje de error
                modalBody.innerHTML = `<p>Error al guardar el video: ${data.message}</p>`;
                console.error("Error al guardar el video:", data.message || "Sin detalles adicionales.");
            }
        })
        .catch(error => {
            console.error("Error en la solicitud de guardar video:", error);
            alert("Hubo un problema al guardar el video.");
        });
}
