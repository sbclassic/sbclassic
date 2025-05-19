// cart.js

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function clearCart() {
  localStorage.removeItem('cart');
}

function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  alert(`${product.name} added to cart`);
}

function removeFromCart(productId) {
  let cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  location.reload();
}

function updateCartDisplay() {
  const cart = getCart();
  const cartContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (!cartContainer || !cartTotal) return;

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "Total: GHS 0";
    return;
  }

  let total = 0;
  cartContainer.innerHTML = "";
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    cartContainer.innerHTML += `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}" width="80" />
        <div>
          <h4>${item.name}</h4>
          <p>Price: GHS ${item.price}</p>
          <p>Quantity: ${item.quantity}</p>
          <button onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
      <hr/>
    `;
  });

  cartTotal.textContent = `Total: GHS ${total}`;
}