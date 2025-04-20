const createRouteBtn = document.getElementById("create-route-btn");
const secondaryCreateRouteBtn = document.getElementById("secondary-create-route-btn");
const createRouteModal = document.getElementById("create-route-modal");
const cancelCreateBtn = document.getElementById("cancel-create");
const confirmCreateBtn = document.getElementById("confirm-create");
const routeNameInput = document.getElementById("route-name");
const routesList = document.getElementById("routes-list");
const emptyState = document.getElementById("empty-state");

const deleteRouteModal = document.getElementById("delete-route-modal");
const cancelDeleteBtn = document.getElementById("cancel-delete");
const confirmDeleteBtn = document.getElementById("confirm-delete");
let routeToDelete = null;

// Cargar rutas desde localStorage al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    loadRoutesFromStorage();
});

// Función para abrir el modal de crear ruta
function openCreateRouteModal() {
    createRouteModal.classList.remove("hidden");
}

// Función para cerrar el modal de crear ruta
function closeCreateRouteModal() {
    createRouteModal.classList.add("hidden");
    routeNameInput.value = "";
    confirmCreateBtn.classList.add("disabled");
    confirmCreateBtn.disabled = true;
}

// Abrir formulario de crear ruta desde botón principal
createRouteBtn.addEventListener("click", openCreateRouteModal);
secondaryCreateRouteBtn.addEventListener("click", openCreateRouteModal);

// Cerrar formulario de crear ruta
cancelCreateBtn.addEventListener("click", closeCreateRouteModal);

// Habilitar/deshabilitar botón de crear
routeNameInput.addEventListener("input", () => {
    if (routeNameInput.value.trim() !== "") {
        confirmCreateBtn.classList.remove("disabled");
        confirmCreateBtn.disabled = false;
    } else {
        confirmCreateBtn.classList.add("disabled");
        confirmCreateBtn.disabled = true;
    }
});

// Crear ruta
confirmCreateBtn.addEventListener("click", () => {
    const routeName = routeNameInput.value.trim();
    if (routeName !== "") {
        addRoute(routeName);
        saveRouteToStorage(routeName);
        closeCreateRouteModal();
        emptyState.style.display = "none";
    }
});

// Agregar ruta a la lista
function addRoute(name) {
    const routeItem = document.createElement("div");
    routeItem.classList.add("route-item");
    routeItem.setAttribute("data-route", name);

    // Obtener cursos de la ruta desde localStorage
    const courses = JSON.parse(localStorage.getItem(name)) || [];
    const courseCount = courses.length;

    routeItem.innerHTML = `
        <div class="route-content" onclick="viewRoute('${name}')">
            <h3>${name}</h3>
            <p>Ruta Personalizada | ${courseCount} ${courseCount === 1 ? "Curso" : "Cursos"}</p>
        </div>
        <button class="btn btn-danger delete-route-btn">🗑</button>
    `;

    // Evento para abrir el modal al hacer clic en el botón de eliminar
    const deleteBtn = routeItem.querySelector(".delete-route-btn");
    deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openDeleteRouteModal(routeItem, name);
    });

    routesList.appendChild(routeItem);
}

// Guardar rutas en localStorage
function saveRouteToStorage(name) {
    let routes = JSON.parse(localStorage.getItem("routes")) || [];
    if (!routes.includes(name)) {
        routes.push(name);
        localStorage.setItem("routes", JSON.stringify(routes));
    }
}

// Cargar rutas desde localStorage
function loadRoutesFromStorage() {
    const routes = JSON.parse(localStorage.getItem("routes")) || [];
    if (routes.length > 0) {
        emptyState.style.display = "none";
        routes.forEach((route) => {
            addRoute(route);
        });
    }
}

// Eliminar ruta de localStorage
function removeRouteFromStorage(name) {
    let routes = JSON.parse(localStorage.getItem("routes")) || [];
    routes = routes.filter((route) => route !== name);
    localStorage.removeItem(name); // Eliminar cursos asociados a la ruta
    localStorage.setItem("routes", JSON.stringify(routes));
}

// Abrir el modal de eliminar ruta
function openDeleteRouteModal(routeItem, routeName) {
    routeToDelete = routeItem;
    deleteRouteModal.classList.remove("hidden");
    deleteRouteModal.setAttribute("data-route", routeName);
}

// Cerrar el modal de eliminar ruta
cancelDeleteBtn.addEventListener("click", () => {
    deleteRouteModal.classList.add("hidden");
    routeToDelete = null;
});

// Confirmar la eliminación de la ruta
confirmDeleteBtn.addEventListener("click", () => {
    if (routeToDelete) {
        const routeName = deleteRouteModal.getAttribute("data-route");
        routesList.removeChild(routeToDelete);
        removeRouteFromStorage(routeName);
        deleteRouteModal.classList.add("hidden");
    }
});

// Redirigir al hacer clic en una ruta
function viewRoute(routeName) {
    window.location.href = `route.html?route=${encodeURIComponent(routeName)}`;
}
