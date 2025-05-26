// cart.js

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find(item => item.name === product.name);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  saveCart(cart);
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-items');
  if (!container) return;
  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('cart-item');
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" width="100" />
      <p><strong>${item.name}</strong></p>
      <p>Price: GHS ${item.price.toFixed(2)}</p>
      <p>Quantity: ${item.quantity}</p>
    `;
    container.appendChild(itemDiv);
  });
}