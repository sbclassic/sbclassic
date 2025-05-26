// cart.js

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.name === product.name);

  if (existing) {
    existing.quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }

  saveCart(cart);
}

function renderCart() {
  const cartItemsDiv = document.getElementById("cart-items");
  if (!cartItemsDiv) return;

  const cart = getCart();
  cartItemsDiv.innerHTML = "";

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cart.forEach(item => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" width="100" />
      <p><strong>${item.name}</strong></p>
      <p>Price: GHS ${item.price.toFixed(2)}</p>
      <p>Quantity: ${item.quantity}</p>
      <p>Subtotal: GHS ${(item.price * item.quantity).toFixed(2)}</p>
      <hr>
    `;
    cartItemsDiv.appendChild(itemDiv);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiv = document.getElementById("cart-total");
  if (totalDiv) {
    totalDiv.textContent = "Total: GHS " + total.toFixed(2);
  }

  const checkoutLink = document.getElementById("checkout-link");
  if (checkoutLink) {
    checkoutLink.style.display = "inline-block";
  }
}