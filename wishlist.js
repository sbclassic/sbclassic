// wishlist.js
function getWishlist() {
  return JSON.parse(localStorage.getItem('wishlist')) || [];
}

function saveWishlist(wishlist) {
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

function renderWishlist() {
  const container = document.getElementById('wishlist-items');
  const wishlist = getWishlist();

  container.innerHTML = '';

  if (wishlist.length === 0) {
    container.innerHTML = '<p>Your wishlist is empty.</p>';
    return;
  }

  wishlist.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'wishlist-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <h4>${item.name}</h4>
      <p>GHS ${item.price.toFixed(2)}</p>
      <button onclick="addToCart(${JSON.stringify(item)})">Add to Cart</button>
      <br/><br/>
      <button onclick="removeFromWishlist('${item.id}')">Remove</button>
    `;
    container.appendChild(itemDiv);
  });
}

function removeFromWishlist(id) {
  let wishlist = getWishlist();
  wishlist = wishlist.filter(item => item.id !== id);
  saveWishlist(wishlist);
  renderWishlist();
}

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${product.name} added to cart.`);
}

document.addEventListener('DOMContentLoaded', renderWishlist);