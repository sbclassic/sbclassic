// cart.js

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += product.quantity || 1;
  } else {
    cart.push(product);
  }

  localStorage.setItem('cart', JSON.stringify(cart));
}

// Render cart on cart.html
function renderCart() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const container = document.getElementById('cart-items');
  container.innerHTML = '';

  if (cart.length === 0) {
    container.textContent = 'Cart is empty.';
    document.getElementById('cart-total').textContent = '';
    const checkoutLink = document.getElementById('checkout-link');
    if (checkoutLink) checkoutLink.style.display = 'none';
    return;
  }

  cart.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" width="60" />
      <strong>${item.name}</strong> - 
      Quantity: ${item.quantity} – 
      Price: GHS ${(item.price * item.quantity).toFixed(2)}
    `;
    container.appendChild(itemDiv);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiv = document.getElementById('cart-total');
  if (totalDiv) totalDiv.textContent = 'Total: GHS ' + total.toFixed(2);

  const checkoutLink = document.getElementById('checkout-link');
  if (checkoutLink) checkoutLink.style.display = 'inline-block';
}