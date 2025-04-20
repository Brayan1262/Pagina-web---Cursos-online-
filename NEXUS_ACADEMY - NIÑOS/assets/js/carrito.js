document.addEventListener("DOMContentLoaded", () => {
    const containerList = document.querySelector("#cart-items-container");
    const totalElement = document.getElementById("total-price");

    function loadCartItems() {
        const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        containerList.innerHTML = ""; // Limpiar contenedor de items previos
        let total = 0;

        if (cartItems.length === 0) {
            containerList.innerHTML = "<p class='empty-cart-message'>Tu carrito está vacío.</p>";
            totalElement.textContent = `Total: S/. 0.00`;
            return;
        }

        cartItems.forEach((item, index) => {
            total += item.price;

            const itemElement = document.createElement("div");
            itemElement.classList.add("cart-item");
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="course-image">
                <span class="course-title">${item.title}</span>
                <span class="course-price">S/. ${item.price.toFixed(2)}</span>
                <button class="remove-item" data-index="${index}">X</button>
            `;

            containerList.appendChild(itemElement);
        });

        totalElement.textContent = `Total: S/. ${total.toFixed(2)}`;
    }

    function removeCartItem(index) {
        let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
        cartItems.splice(index, 1);
        localStorage.setItem("cartItems", JSON.stringify(cartItems));
        loadCartItems();
    }

    containerList.addEventListener("click", (e) => {
        if (e.target.classList.contains("remove-item")) {
            const index = e.target.getAttribute("data-index");
            removeCartItem(index);
        }
    });

    loadCartItems();
});
