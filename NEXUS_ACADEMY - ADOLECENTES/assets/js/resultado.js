document.addEventListener("DOMContentLoaded", function () {
    const resultadosContainer = document.getElementById("resultados-container");
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query"); // Obtén la palabra buscada desde la URL

    // Función para filtrar datos según la búsqueda
    function filtrarResultados(palabra, coleccion) {
        return coleccion.filter(item =>
            item.titulo.toLowerCase().includes(palabra.toLowerCase()) || 
            item.descripcion.toLowerCase().includes(palabra.toLowerCase())
        );
    }

    // Generar HTML para una sección
    function generarSeccion(titulo, resultados) {
        if (resultados.length === 0) return ""; // No mostrar sección si no hay resultados
        let html = `<h3>${titulo}</h3><div class="results">`;
        resultados.forEach(result => {
            html += `
                <div class="result-item">
                    <img src="${result.imagen}" alt="${result.titulo}">
                    <div>
                        <h4>${result.titulo}</h4>
                        <p>${result.descripcion}</p>
                    </div>
                </div>`;
        });
        html += `</div>`;
        return html;
    }

    // Mostrar resultados
    function mostrarResultados(datos) {
        resultadosContainer.innerHTML = ""; // Limpia los resultados previos

        const cursosFiltrados = filtrarResultados(query, datos.cursos);
        const rutasFiltradas = filtrarResultados(query, datos.rutas);
        const clasesFiltradas = filtrarResultados(query, datos.clases);

        // Generar "Destacados" con todos los resultados combinados
        const destacados = [...cursosFiltrados, ...rutasFiltradas, ...clasesFiltradas];
        resultadosContainer.innerHTML += generarSeccion("Destacado", destacados);

        // Generar secciones específicas
        resultadosContainer.innerHTML += generarSeccion("Cursos", cursosFiltrados);
        resultadosContainer.innerHTML += generarSeccion("Rutas", rutasFiltradas);
        resultadosContainer.innerHTML += generarSeccion("Clases", clasesFiltradas);

        // Mostrar cantidad de resultados encontrados
        const totalResultados = destacados.length;
        const resultadosEncontrados = document.querySelector(".resultados-encontrados");
        if (resultadosEncontrados) {
            resultadosEncontrados.textContent = `${totalResultados} Resultados encontrados`;
        }
    }

    // Cargar datos desde el archivo JSON
    fetch("assets/data/data.json")
        .then(response => response.json())
        .then(data => {
            if (query) {
                mostrarResultados(data);
            } else {
                resultadosContainer.innerHTML = "<p>No se especificó una búsqueda.</p>";
            }
        })
        .catch(error => {
            console.error("Error al cargar los datos:", error);
            resultadosContainer.innerHTML = "<p>Error al cargar los resultados.</p>";
        });
});
