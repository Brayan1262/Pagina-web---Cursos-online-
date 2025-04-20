// Función para abrir el formulario de login
function openForm() {
  document.getElementById("loginFormContainer").style.display = "flex";
}

// Función para cerrar el formulario de login
function closeForm() {
  document.getElementById("loginFormContainer").style.display = "none";
}

// Función para mostrar el formulario de registro y ocultar el de login
function showRegisterForm() {
  document.getElementById("loginFormContainer").style.display = "none";
  document.getElementById("registerFormContainer").style.display = "flex";
}

// Función para mostrar el formulario de login y ocultar el de registro
function showLoginForm() {
  document.getElementById("registerFormContainer").style.display = "none";
  document.getElementById("loginFormContainer").style.display = "flex";
}



// Actualizar las rutas en el modal después de eliminar o cambios
function updateRoutesListModal() {
  const routes = JSON.parse(localStorage.getItem('routes')) || [];
  const routesListModal = document.getElementById("routes-list-modal");

  // Limpiar la lista antes de actualizar
  routesListModal.innerHTML = "";

  if (routes.length > 0) {
      routes.forEach(route => {
          const routeItem = document.createElement("div");
          routeItem.classList.add("route-modal-item");
          routeItem.innerHTML = `
              <label>
                  <input type="radio" name="route" value="${route}">
                  ${route}
              </label>
          `;
          routesListModal.appendChild(routeItem);
      });
  } else {
      routesListModal.innerHTML = `<p class="text-muted">No tienes rutas creadas.</p>`;
  }
}

function showAddToRouteModal(course) {
  console.log("Modal abierto para el curso:", course.title);
  const modal = document.getElementById("add-to-route-modal");
  const confirmAddToRoute = document.getElementById("confirm-add-to-route");

  // Actualizar la lista de rutas en el modal
  updateRoutesListModal();

  // Evento para habilitar botón al seleccionar una ruta
  const routesListModal = document.getElementById("routes-list-modal");
  routesListModal.addEventListener("change", (e) => {
      if (e.target && e.target.name === "route") {
          confirmAddToRoute.disabled = false;
      }
  });

  modal.classList.remove("hidden");
  console.log(`Modal abierto para el curso: ${course.title}`);

  // Configurar evento para guardar curso en la ruta seleccionada
  confirmAddToRoute.onclick = () => {
    const selectedRoute = document.querySelector('input[name="route"]:checked').value;

    // Obtener datos actuales de la ruta
    const routeData = JSON.parse(localStorage.getItem(selectedRoute)) || [];
    routeData.push(course.title); // Guardar solo el título del curso
    localStorage.setItem(selectedRoute, JSON.stringify(routeData)); // Guardar ruta actualizada

    alert(`Curso añadido a ${selectedRoute}`);
    modal.classList.add("hidden");
};

}

// Cerrar el modal al hacer clic en "Cancelar"
document.getElementById("cancel-add-to-route").addEventListener("click", () => {
  const modal = document.getElementById("add-to-route-modal");
  modal.classList.add("hidden");
});
