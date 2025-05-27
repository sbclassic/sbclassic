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
    if (totalContainer) totalContainer.textContent = '';
    if (checkoutLink) checkoutLink.style.display = 'none';
    return;
  }

  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <p><strong>${item.name}</strong></p>
        <p>Price: GHS ${item.price.toFixed(2)}</p>
        <p>
          Quantity:
          <button class="qty-btn decrease" data-index="${index}">−</button>
          <span>${item.quantity}</span>
          <button class="qty-btn increase" data-index="${index}">+</button>
        </p>
        <button class="remove-btn" data-index="${index}">🗑️ Remove</button>
      </div>
    `;
    container.appendChild(itemDiv);
  });

  if (totalContainer) totalContainer.textContent = `Total: GHS ${total.toFixed(2)}`;
  if (checkoutLink) checkoutLink.style.display = 'inline-block';

  // Quantity Increase
  document.querySelectorAll('.qty-btn.increase').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      cart[index].quantity += 1;
      saveCart(cart);
      renderCart();
    });
  });

  // Quantity Decrease
  document.querySelectorAll('.qty-btn.decrease').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      if (cart[index].quantity > 1) {
        cart[index].quantity -= 1;
      } else {
        cart.splice(index, 1);
      }
      saveCart(cart);
      renderCart();
    });
  });

  // Remove Individual Item
  document.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const index = parseInt(btn.dataset.index);
      cart.splice(index, 1);
      saveCart(cart);
      renderCart();
    });
  });
}

// 🧹 Clear Entire Cart Function
function clearCart() {
  localStorage.removeItem('cart');
  renderCart();
}