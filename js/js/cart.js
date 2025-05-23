// js/cart.js

function getCart() {
  return JSON.parse(localStorage.getItem('sbclassicCart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('sbclassicCart', JSON.stringify(cart));
}

function clearCart() {
  localStorage.removeItem('sbclassicCart');
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

function removeFromCart(id) {
  let cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  location.reload();
}