// JavaScript to handle the message view modal
var messageModal = document.getElementById('messageModal');
messageModal.addEventListener('show.bs.modal', function (event) {
  var button = event.relatedTarget;
  var sender = button.getAttribute('data-sender');
  var asunto = button.getAttribute('data-asunto');
  var message = button.getAttribute('data-message');

  var modalSender = messageModal.querySelector('#modalSender');
  var modalAsunto = messageModal.querySelector('#modalAsunto');
  var modalMessage = messageModal.querySelector('#modalMessage');

  modalSender.textContent = sender;
  modalAsunto.textContent = asunto;
  modalMessage.textContent = message;
});

// JavaScript to handle the response modal
var responseModal = document.getElementById('responseModal');
responseModal.addEventListener('show.bs.modal', function (event) {
  var button = event.relatedTarget;
  var recipient = button.getAttribute('data-recipient');

  var recipientNameInput = responseModal.querySelector('#recipientName');
  recipientNameInput.value = recipient;
});

// Simulate message sending for the "Enviar" button in the response modal
document.getElementById('sendMessageBtn').addEventListener('click', function() {
  var recipient = document.getElementById('recipientName').value;
  var message = document.getElementById('responseMessage').value;

  if (message.trim() === '') {
    alert('Por favor, escribe un mensaje.');
  } else {
    alert('Mensaje enviado a ' + recipient + ' con éxito.');
    document.getElementById('responseForm').reset(); // Clear the form after sending
    var modalElement = document.querySelector('#responseModal');
    var modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide(); // Close the modal after sending
  }
});

function eliminarMensaje(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este mensaje?")) {
      fetch('/eliminar-mensaje', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id }),
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Mensaje eliminado exitosamente');
              cargarMensajes(); // Llama a la función que recarga la tabla para reflejar los cambios.
              cargarMensajesLeidos();
          } else {
              alert('Error al eliminar el certificado');
          }
      })
      .catch(error => console.error('Error:', error));
  }
}

function MensajeVisto(id) {
  fetch('/cambiar-vista', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      cargarMensajesLeidos();
    } else {
      alert('Error al promover el mensaje');
    }
  })
  .catch(error => console.error('Error:', error));
}

// Función para filtrar la tabla de administradores
function filtrarMensajes() {
  const inputBusqueda = document.querySelector('input[id="buscarMensajes"]');
  const filtro = inputBusqueda.value.toLowerCase();
  const filas = document.querySelectorAll('#tablaMensajes tbody tr');

  filas.forEach(fila => {
      const nombre_usuario = fila.children[0].textContent.toLowerCase();

      // Verificar si el filtro coincide con el ID, nombre de usuario, nombres completos o correo
      if (
          nombre_usuario.includes(filtro)
      ) {
          fila.style.display = ''; // Mostrar la fila si coincide
      } else {
          fila.style.display = 'none'; // Ocultar la fila si no coincide
      }
  });
}

// Agregar el evento de escucha al campo de búsqueda
document.querySelector('input[id="buscarMensajes"]').addEventListener('input', filtrarMensajes);

// Función para filtrar la tabla de administradores
function filtrarMensajesLeidos() {
  const inputBusqueda = document.querySelector('input[id="buscarMensajesLeidos"]');
  const filtro = inputBusqueda.value.toLowerCase();
  const filas = document.querySelectorAll('#tablaMensajesLeidos tbody tr');

  filas.forEach(fila => {
      const nombre_usuario = fila.children[0].textContent.toLowerCase();

      // Verificar si el filtro coincide con el ID, nombre de usuario, nombres completos o correo
      if (
          nombre_usuario.includes(filtro)
      ) {
          fila.style.display = ''; // Mostrar la fila si coincide
      } else {
          fila.style.display = 'none'; // Ocultar la fila si no coincide
      }
  });
}

// Agregar el evento de escucha al campo de búsqueda
document.querySelector('input[id="buscarMensajesLeidos"]').addEventListener('input', filtrarMensajesLeidos);

function cargarMensajes() {
  fetch('/obtener-mensajes')
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              const tablaBody = document.getElementById('tablaMensajes').querySelector('tbody');
              tablaBody.innerHTML = ''; // Limpiar la tabla antes de insertar nuevos datos

              data.mensajes.forEach(mensaje => {
                  const fila = document.createElement('tr');
                  const fechaSolo = mensaje.fecha.split('T')[0];
                  fila.innerHTML = `
                      <td>${mensaje.de}</td>
                      <td>${mensaje.correo}</td>
                      <td>${fechaSolo}</td>
                      <td>
                        <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#messageModal" data-sender="${mensaje.de}" data-asunto="${mensaje.asunto}" data-message="${mensaje.mensaje}" onclick="MensajeVisto(${mensaje.id_mensaje})">Ver</button>
                        <button class="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#responseModal" data-recipient="${mensaje.correo}">Responder</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarMensaje(${mensaje.id_mensaje})">Eliminar</button>
                      </td>
                  `;
                  tablaBody.appendChild(fila);
              });
          } else {
              alert('Error al cargar los mensajes');
          }
      })
      .catch(error => console.error('Error:', error));
}

// Llama a esta función cuando se cargue la página
document.addEventListener('DOMContentLoaded', cargarMensajes);

function cargarMensajesLeidos() {
  fetch('/obtener-mensajes-leidos')
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              const tablaBody = document.getElementById('tablaMensajesLeidos').querySelector('tbody');
              tablaBody.innerHTML = ''; // Limpiar la tabla antes de insertar nuevos datos

              data.mensajes.forEach(mensaje => {
                  const fila = document.createElement('tr');
                  const fechaSolo = mensaje.fecha.split('T')[0];
                  fila.innerHTML = `
                      <td>${mensaje.de}</td>
                      <td>${mensaje.correo}</td>
                      <td>${fechaSolo}</td>
                      <td>
                        <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#messageModal" data-sender="${mensaje.de}" data-asunto="${mensaje.asunto}" data-message="${mensaje.mensaje}">Ver</button>
                        <button class="btn btn-danger btn-sm" onclick="eliminarMensaje(${mensaje.id_mensaje})">Eliminar</button>
                      </td>
                  `;
                  tablaBody.appendChild(fila);
              });
          } else {
              alert('Error al cargar los usuarios');
          }
      })
      .catch(error => console.error('Error:', error));
}

// Llama a esta función cuando se cargue la página
document.addEventListener('DOMContentLoaded', cargarMensajesLeidos);