// wishlist.js

const wishlistKey = "sbclassic_wishlist";

function getWishlist() {
  return JSON.parse(localStorage.getItem(wishlistKey)) || [];
}

function saveWishlist(wishlist) {
  localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
}

function renderWishlist() {
  const container = document.getElementById('wishlist-items');
  if (!container) return; // Don't run if not on wishlist page

function saveWishlist(wishlist) {
  console.log("Saving wishlist:", wishlist); // Debug line
  localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
}

  const wishlist = getWishlist();
  container.innerHTML = '';

  if (wishlist.length === 0) {
    container.innerHTML = '<p>Your wishlist is empty.</p>';
    return;
  }

  wishlist.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'wishlist-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <h4>${item.name}</h4>
      <p>GHS ${parseFloat(item.price).toFixed(2)}</p>
      <button onclick='addToCart(${JSON.stringify(item)})'>Add to Cart</button>
      <br/><br/>
      <button onclick='removeFromWishlist(${index})'>Remove</button>
    `;
    container.appendChild(itemDiv);
  });
}

function removeFromWishlist(index) {
  let wishlist = getWishlist();
  wishlist.splice(index, 1);
  saveWishlist(wishlist);
  renderWishlist();
}

function addToCart(product) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const existing = cart.find(item => item.name === product.name);
  if (existing) {
    existing.quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  alert(`${product.name} added to cart.`);
}

// Wishlist interaction on product pages
function updateWishlistButtons() {
  const wishlist = getWishlist();
  document.querySelectorAll(".product").forEach(product => {
    const name = product.dataset.name;
    const btn = product.querySelector(".add-to-wishlist-btn");
    const isInWishlist = wishlist.some(item => item.name === name);

    if (isInWishlist) {
      btn.textContent = "Remove from Wishlist";
      btn.classList.add("in-wishlist");
    } else {
      btn.textContent = "Add to Wishlist";
      btn.classList.remove("in-wishlist");
    }
  });
}

function handleWishlistButtons() {
  document.querySelectorAll(".add-to-wishlist-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const productDiv = e.target.closest(".product");
      const name = productDiv.dataset.name;
      const price = productDiv.dataset.price;
      const image = productDiv.dataset.image;

      let wishlist = getWishlist();
      const exists = wishlist.some(item => item.name === name);

      if (exists) {
        wishlist = wishlist.filter(item => item.name !== name);
      } else {
        wishlist.push({ name, price, image });
      }

      saveWishlist(wishlist);
      updateWishlistButtons();
    });
  });
}

// Initialize depending on page
document.addEventListener('DOMContentLoaded', () => {
  renderWishlist();
  updateWishlistButtons();
  handleWishlistButtons();
});