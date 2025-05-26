let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.push(product);
  }
  saveCart();
  renderCart();
}

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function renderCart() {
  const cartItemsDiv = document.getElementById('cart-items');
  if (!cartItemsDiv) return; // no cart container, skip rendering

  cart = getCart();

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  let html = '<ul>';
  cart.forEach((item, i) => {
    html += `<li>
      <img src="${item.image}" alt="${item.name}" width="50" />
      ${item.name} — Quantity: ${item.quantity} — Price: GHS ${item.price.toFixed(2)} each
      <button onclick="removeFromCart(${i})">Remove</button>
      <input type="number" min="1" max="99" value="${item.quantity}" onchange="updateQuantity(${i}, this.value)" />
    </li>`;
  });
  html += '</ul>';

  cartItemsDiv.innerHTML = html;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

function updateQuantity(index, qty) {
  qty = parseInt(qty);
  if (isNaN(qty) || qty < 1) qty = 1;
  if (qty > 99) qty = 99;
  cart[index].quantity = qty;
  saveCart();
  renderCart();
}

// Initialize render if cart container present
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});