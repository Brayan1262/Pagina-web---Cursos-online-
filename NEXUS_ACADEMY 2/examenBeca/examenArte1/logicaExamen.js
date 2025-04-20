// Función para calcular la puntuación
function calcularResultado() {
  var totalPreguntas = 10;
  var respuestasCorrectas = 0;

  // Recorremos todas las preguntas
  for (var i = 1; i <= totalPreguntas; i++) {
    var pregunta = document.querySelector(`input[name="q${i}"]:checked`);
    if (pregunta && pregunta.value == "1") {
      respuestasCorrectas++;
    }
  }

  // Mostrar resultado
  alert(`Has respondido correctamente ${respuestasCorrectas} de ${totalPreguntas} preguntas.`);

  // Calcular y mostrar mensaje según el puntaje
  var mensaje = "";
  if (respuestasCorrectas >= 7) {
    mensaje = "¡Felicidades! Has aprobado el examen.";
  } else {
    mensaje = "Lo siento, no has aprobado el examen. Intenta nuevamente.";
  }

  alert(mensaje);

  // Si el puntaje es 7 o más, mostrar el botón para imprimir el certificado
  if (respuestasCorrectas >= 7) {
    mostrarBotonCertificado();
  }
}

function mostrarBotonCertificado() {
  const certificadoBoton = document.getElementById('boton-certificado');
  // Aseguramos que el botón de certificado no esté ya visible
  if (certificadoBoton) {
    certificadoBoton.style.display = 'block';
  }
}

// Función para mostrar resultado en un popup
function mostrarResultado(puntaje) {
  const popup = document.getElementById('popup');
  const resultadoTitulo = document.getElementById('resultado-titulo');
  const resultadoMensaje = document.getElementById('resultado-mensaje');
  const boton = popup.querySelector('button');

  // Mostrar mensaje según el puntaje
  if (puntaje >= 7) {
    resultadoTitulo.textContent = '¡Felicidades, aprobaste!';
    resultadoMensaje.textContent = `Tu puntaje es: ${puntaje} de 10. ¡Excelente trabajo!`;
    boton.textContent = 'Cerrar';
    boton.onclick = function() {
      // Redirige a otra página (puedes cambiar la URL según lo necesites)
      window.location.href = '../../claseARTE1/index.html';
    };
  } else {
    resultadoTitulo.textContent = 'No aprobaste';
    resultadoMensaje.textContent = `Tu puntaje es: ${puntaje} de 10. Lo siento, pero necesitas al menos 7 para aprobar.`;
    boton.textContent = 'Volver a intentarlo';
    boton.onclick = function() {
      // Recarga la página para volver a intentarlo
      location.reload();
    };
  }

  // Muestra el popup
  popup.style.display = 'flex';
}

// Función para cerrar la ventana emergente
function cerrarPopup() {
  document.getElementById("popup").style.display = "none";
}

// Función para mostrar u ocultar el menú de instrucciones
function toggleInstructions() {
  const menu = document.getElementById("instructions-menu");
  menu.style.display = menu.style.display === "flex" ? "none" : "flex";
}

// Agrega un evento para cuando el documento esté listo
document.addEventListener('DOMContentLoaded', function() {
  // Puedes agregar otros eventos de inicialización si es necesario
});
