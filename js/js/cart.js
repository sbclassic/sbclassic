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

function addToCart(product, quantity = 1) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity });
  }
  saveCart(cart);
  alert(`${product.name} (x${quantity}) added to cart`);
}

function removeFromCart(id) {
  let cart = getCart().filter(item => item.id !== id);
  saveCart(cart);
  location.reload();
}

// Attach event listeners to product cards if on product page
document.addEventListener('DOMContentLoaded', function () {
  const productCards = document.querySelectorAll('.product');

  productCards.forEach(card => {
    const addBtn = card.querySelector('.add-to-cart-btn');
    const qtyInput = card.querySelector('.quantity-input') || { value: 1 };

    if (addBtn) {
      addBtn.addEventListener('click', () => {
        const product = {
          id: card.dataset.name.toLowerCase().replace(/\s+/g, '-'),
          name: card.dataset.name,
          price: parseFloat(card.dataset.price),
          image: card.dataset.image
        };

        const quantity = parseInt(qtyInput.value) || 1;
        addToCart(product, quantity);
      });
    }
  });
});