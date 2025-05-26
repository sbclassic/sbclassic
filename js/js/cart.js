// cart.js

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.name === product.name);

  if (existing) {
    existing.quantity += product.quantity || 1;
  } else {
    product.quantity = product.quantity || 1;
    cart.push(product);
  }

  saveCart(cart);
}

function renderCart() {
  const cartItemsDiv = document.getElementById('cart-items');
  if (!cartItemsDiv) return;

  const cart = getCart();
  cartItemsDiv.innerHTML = '';

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" width="80" />
      <strong>${item.name}</strong><br>
      Price: GHS ${item.price.toFixed(2)}<br>
      Quantity: ${item.quantity}<br>
      Subtotal: GHS ${(item.price * item.quantity).toFixed(2)}
      <hr>
    `;
    cartItemsDiv.appendChild(itemDiv);
  });

  // Show total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiv = document.createElement('div');
  totalDiv.innerHTML = `<strong>Total: GHS ${total.toFixed(2)}</strong>`;
  cartItemsDiv.appendChild(totalDiv);
}