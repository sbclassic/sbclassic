let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(product) {
  console.log('Adding product:', product);
  
  // Check if product exists in cart, then increment quantity
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += product.quantity;
  } else {
    cart.push(product);
  }

  // Save cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Render the cart UI
  renderCart();

  console.log('Cart now:', cart);
}

function renderCart() {
  const cartItemsDiv = document.getElementById('cart-items');
  if (!cartItemsDiv) {
    console.warn('Cart container not found!');
    return;
  }

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  let html = '<ul>';
  cart.forEach(item => {
    html += `<li>${item.name} — Quantity: ${item.quantity} — Price: GHC ${item.price}</li>`;
  });
  html += '</ul>';

  cartItemsDiv.innerHTML = html;
}

// Call renderCart once on page load to initialize
renderCart();