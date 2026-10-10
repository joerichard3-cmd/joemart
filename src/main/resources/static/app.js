
const API_URL = "/api/products";

let allProducts = [];
let cart = JSON.parse(
    localStorage.getItem("joemart_cart") || "[]"
);

function money(price) {
    return "₹" + Number(price || 0).toFixed(2);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[ch]);
}

function notify(message) {
    const toast = document.getElementById("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

// Load products from Spring Boot
async function loadProducts() {
    const status = document.getElementById("status");
    const grid = document.getElementById("productsGrid");

    try {
        status.textContent = "Loading products...";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        allProducts = await response.json();

        renderProducts(allProducts);

        status.textContent = allProducts.length
            ? ""
            : "No products available.";

    } catch (error) {
        console.error("Products error:", error);

        status.textContent =
            "Products load aagala. Check Spring Boot server.";

        grid.innerHTML = "";
    }
}

// Display product cards
function renderProducts(products) {
    const grid = document.getElementById("productsGrid");

    if (!products.length) {
        grid.innerHTML = "<p>No matching products found.</p>";
        return;
    }

    grid.innerHTML = products.map(product => {
        const image = String(product.image || "🛍️");
        const isURL = /^(https?:\/\/|\/)/i.test(image);

        const imageHTML = isURL
            ? `<img src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name)}">`
            : escapeHTML(image);

        return `
            <article class="product-card">
                <div class="product-image">${imageHTML}</div>

                <h3>${escapeHTML(product.name)}</h3>

                <p class="category">
                    ${escapeHTML(product.category || "General")}
                </p>

                <p>${escapeHTML(product.description || "")}</p>

                <p class="price">
                    ${money(product.price)}
                </p>

                <p class="stock">
                    Stock: ${Number(product.stock || 0)}
                </p>

                <button
                    class="add-btn"
                    data-product-id="${Number(product.id)}"
                    ${Number(product.stock) < 1 ? "disabled" : ""}
                >
                    Add to Cart
                </button>
            </article>
        `;
    }).join("");

    grid.querySelectorAll("[data-product-id]").forEach(button => {
        button.addEventListener("click", () => {
            addToCart(Number(button.dataset.productId));
        });
    });
}

// Search products
function searchProducts() {
    const keyword = document
        .getElementById("searchInput")
        .value.trim()
        .toLowerCase();

    const filtered = allProducts.filter(product =>
        [product.name, product.category, product.description]
            .some(value =>
                String(value || "").toLowerCase().includes(keyword)
            )
    );

    renderProducts(filtered);
}

// Save cart in this browser
function saveCart() {
    localStorage.setItem("joemart_cart", JSON.stringify(cart));

    document.getElementById("cartCount").textContent =
        cart.reduce((total, item) => total + item.quantity, 0);
}

// Add product to cart
function addToCart(id) {
    const product = allProducts.find(item => Number(item.id) === id);

    if (!product) return;

    const item = cart.find(item => Number(item.id) === id);

    if (item) {
        if (item.quantity >= Number(product.stock)) {
            notify("Stock limit reached");
            return;
        }

        item.quantity++;
    } else {
        cart.push({
            id: Number(product.id),
            name: product.name,
            price: Number(product.price),
            image: product.image || "🛍️",
            stock: Number(product.stock || 0),
            quantity: 1
        });
    }

    saveCart();
    notify("Added to cart!");
}

// Modal controls
function openModal(html) {
    document.getElementById("modalContent").innerHTML = html;

    document.getElementById("modalOverlay")
        .classList.remove("hidden");
}

function closeModal() {
    document.getElementById("modalOverlay")
        .classList.add("hidden");
}

// Show cart
function showCart() {
    if (!cart.length) {
        openModal("<h2>Your Cart</h2><p>Your cart is empty.</p>");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity, 0
    );

    openModal(`
        <h2>Your Cart</h2>

        ${cart.map(item => `
            <div class="cart-item">
                <strong>
                    ${escapeHTML(item.image)}
                    ${escapeHTML(item.name)}
                </strong>

                <p>${money(item.price)} each</p>

                <button data-minus="${item.id}">−</button>
                <span>${item.quantity}</span>
                <button data-plus="${item.id}">+</button>
                <button data-remove="${item.id}">Remove</button>

                <p>
                    Subtotal: ${money(item.price * item.quantity)}
                </p>
            </div>
        `).join("")}

        <h3>Total: ${money(total)}</h3>

        <button id="checkoutBtn">Checkout - Cash on Delivery</button>
    `);

    document.querySelectorAll("[data-minus]").forEach(button => {
        button.onclick = () =>
            changeQuantity(Number(button.dataset.minus), -1);
    });

    document.querySelectorAll("[data-plus]").forEach(button => {
        button.onclick = () =>
            changeQuantity(Number(button.dataset.plus), 1);
    });

    document.querySelectorAll("[data-remove]").forEach(button => {
        button.onclick = () => {
            cart = cart.filter(item =>
                Number(item.id) !== Number(button.dataset.remove)
            );

            saveCart();
            showCart();
        };
    });

    document.getElementById("checkoutBtn").onclick = checkout;
}

function changeQuantity(id, change) {
    const item = cart.find(item => Number(item.id) === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        cart = cart.filter(item => Number(item.id) !== id);
    } else if (item.quantity > item.stock) {
        item.quantity = item.stock;
        notify("Stock limit reached");
    }

    saveCart();
    showCart();
}

// Demo checkout - browser storage only
function checkout() {
    if (!cart.length) return;

    openModal(`
        <h2>Checkout</h2>

        <form id="checkoutForm">
            <input name="name" placeholder="Full name" required>
            <input name="phone" placeholder="Phone number" required>
            <input name="address" placeholder="Delivery address" required>

            <p>Payment: Cash on Delivery</p>

            <button type="submit">Place Order</button>
        </form>

        <p>
            Demo checkout only. Real orders require backend API integration.
        </p>
    `);

    document.getElementById("checkoutForm").onsubmit = event => {
        event.preventDefault();

        const form = new FormData(event.target);

        const orders = JSON.parse(
            localStorage.getItem("joemart_orders") || "[]"
        );

        orders.unshift({
            id: Date.now(),
            name: form.get("name"),
            phone: form.get("phone"),
            address: form.get("address"),
            items: cart,
            total: cart.reduce(
                (sum, item) => sum + item.price * item.quantity, 0
            ),
            date: new Date().toLocaleString()
        });

        localStorage.setItem(
            "joemart_orders",
            JSON.stringify(orders)
        );

        cart = [];
        saveCart();

        openModal(
            "<h2>Order placed! 🎉</h2>" +
            "<p>Demo order saved in this browser.</p>"
        );
    };
}

// Demo login/register screens
function showAuth(mode) {
    const register = mode === "register";

    openModal(`
        <h2>${register ? "Create Account" : "Login"}</h2>

        <form id="authForm">
            ${register
                ? '<input name="name" placeholder="Full name" required>'
                : ""}

            <input
                name="email"
                type="email"
                placeholder="Email"
                required
            >

            <input
                name="password"
                type="password"
                placeholder="Password"
                minlength="6"
                required
            >

            <button type="submit">
                ${register ? "Register" : "Login"}
            </button>
        </form>

        <p>
            Real login/register requires connecting your Java backend API.
        </p>
    `);

    document.getElementById("authForm").onsubmit = event => {
        event.preventDefault();

        notify("Authentication backend connect pannunga");
    };
}

// Start application
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    saveCart();

    document.getElementById("searchBtn").onclick = searchProducts;

    document.getElementById("searchInput").oninput =
        searchProducts;

    document.getElementById("cartBtn").onclick = showCart;

    document.getElementById("loginBtn").onclick =
        () => showAuth("login");

    document.getElementById("registerBtn").onclick =
        () => showAuth("register");

    document.getElementById("closeModal").onclick = closeModal;

    document.getElementById("modalOverlay").onclick = event => {
        if (event.target.id === "modalOverlay") {
            closeModal();
        }
    };
});