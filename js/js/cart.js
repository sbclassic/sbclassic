function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function removeItem(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
  renderCart();
}

function updateQuantity(productId, change) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeItem(productId);
      return;
    }
  }
  saveCart(cart);
  renderCart();
}

function clearCart() {
  localStorage.removeItem('cart');
  renderCart();
}

function renderCart() {
  const cartItemsDiv = document.getElementById('cart-items');
  const checkoutLink = document.getElementById('checkout-link');
  const cartTotalDiv = document.getElementById('cart-total');
  const cart = getCart();
  cartItemsDiv.innerHTML = '';

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    checkoutLink.style.display = 'none';
    cartTotalDiv.textContent = '';
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';

    total += item.price * item.quantity;

    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <h3>${item.name}</h3>
        <p>GHS ${item.price.toFixed(2)} × ${item.quantity} = GHS ${(item.price * item.quantity).toFixed(2)}</p>
        <button onclick="updateQuantity('${item.id}', -1)">➖</button>
        <button onclick="updateQuantity('${item.id}', 1)">➕</button>
        <button onclick="removeItem('${item.id}')">❌ Remove</button>
      </div>
    `;
    cartItemsDiv.appendChild(itemDiv);
  });

  cartTotalDiv.textContent = `Total: GHS ${total.toFixed(2)}`;
  checkoutLink.style.display = 'inline-block';
}