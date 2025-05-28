function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalContainer = document.getElementById('cart-total');
  const checkoutLink = document.getElementById('checkout-link');

  const cart = getCart();
  cartItemsContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    checkoutLink.style.display = 'none';
    cartTotalContainer.textContent = '';
    return;
  }

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong><br>
        <span>Size: ${item.size || 'N/A'}</span><br>
        GHS ${item.price} x ${item.quantity} = GHS ${itemTotal.toFixed(2)}<br>
        <div class="cart-controls">
          <button onclick="changeQuantity(${index}, -1)">−</button>
          <button onclick="changeQuantity(${index}, 1)">+</button>
          <button onclick="removeItem(${index})">Remove</button>
        </div>
      </div>
    `;
    cartItemsContainer.appendChild(itemDiv);
  });

  cartTotalContainer.textContent = 'Total: GHS ' + total.toFixed(2);
  checkoutLink.style.display = 'inline-block';
}

function changeQuantity(index, delta) {
  const cart = getCart();
  cart[index].quantity += delta;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }
  saveCart(cart);
  renderCart();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}

function clearCart() {
  localStorage.removeItem('cart');
  renderCart();
}