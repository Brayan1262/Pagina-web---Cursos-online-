document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get("video");

    if (!videoId) {
        alert("No se encontró el video.");
        return;
    }

    // Cargar el archivo JSON de los videos
    fetch("assets/data/video.json")
        .then(response => response.json())
        .then(data => {
            const video = data.videos[videoId];
            if (!video) {
                alert("El video no existe.");
                return;
            }

            // Mostrar la información del video
            document.getElementById("video-title").textContent = video.titulo;
            document.getElementById("video-frame").src = video.url;
            document.getElementById("video-summary").textContent = video.resumen;

            // Agregar recursos relacionados
            const recursosContainer = document.getElementById("video-resources");
            recursosContainer.innerHTML = "";
            video.recursos.forEach(recurso => {
                const recursoItem = document.createElement("li");
                recursoItem.textContent = recurso;
                recursosContainer.appendChild(recursoItem);
            });

            // Agregar videos relacionados
            const relacionadosContainer = document.getElementById("related-videos");
            relacionadosContainer.innerHTML = "";
            video.relacionados.forEach(relacionado => {
                const relacionadoLink = document.createElement("a");
                relacionadoLink.href = `video.html?video=${relacionado.id}`;
                relacionadoLink.textContent = relacionado.titulo;
                relacionadosContainer.appendChild(relacionadoLink);
            });
        })
        .catch(error => {
            console.error("Error al cargar el JSON de videos:", error);
        });
});
