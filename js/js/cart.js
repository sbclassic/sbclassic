// cart.js

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
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
  const totalContainer = document.getElementById('cart-total');
  const checkoutLink = document.getElementById('checkout-link');

  if (!container) return;

  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    totalContainer.textContent = '';
    checkoutLink.style.display = 'none';
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <p><strong>${item.name}</strong></p>
        <p>Price: GHS ${item.price.toFixed(2)}</p>
        <p>Quantity: ${item.quantity}</p>
      </div>
    `;
    container.appendChild(itemDiv);
  });

  totalContainer.textContent = `Total: GHS ${total.toFixed(2)}`;
  checkoutLink.style.display = 'inline-block';
}