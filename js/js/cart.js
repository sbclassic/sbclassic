// JS: js/cart.js

// Utility to get the cart from localStorage
function getCart() {
  return JSON.parse(localStorage.getItem('sbCart') || '[]');
}

// Utility to save the cart to localStorage
function saveCart(cart) {
  localStorage.setItem('sbCart', JSON.stringify(cart));
}

// Add a product to the cart
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  alert(`${product.name} added to cart`);
}

// Render cart items on cart.html
function renderCartItems(containerId) {
  const cart = getCart();
  const container = document.getElementById(containerId);
  const totalSpan = document.getElementById('total-price');

  container.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    totalSpan.innerText = 'GHS 0';
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <h4>${item.name}</h4>
        <p>GHS ${item.price} × 
        <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity(${index}, this.value)" /></p>
        <p>Total: GHS ${itemTotal}</p>
        <button onclick="removeItem(${index})">Remove</button>
      </div>
    `;
    container.appendChild(div);
  });

  totalSpan.innerText = `GHS ${total}`;
}

// Remove item from cart
function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCartItems('cart-items');
}

// Update quantity
function updateQuantity(index, qty) {
  const cart = getCart();
  cart[index].quantity = parseInt(qty);
  saveCart(cart);
  renderCartItems('cart-items');
}

// Clear cart
function clearCart() {
  localStorage.removeItem('sbCart');
}
