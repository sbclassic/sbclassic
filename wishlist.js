const wishlistKey = "sbclassic_wishlist";

// Get wishlist from localStorage or empty array if none
function getWishlist() {
  return JSON.parse(localStorage.getItem(wishlistKey)) || [];
}

// Save wishlist to localStorage
function saveWishlist(wishlist) {
  console.log("Saving wishlist:", wishlist);
  localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
}

// Render wishlist items (ONLY for wishlist.html page)
function renderWishlist() {
  const container = document.getElementById('wishlist-items');
  if (!container) return; // Not on wishlist page

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

// Remove item from wishlist by index
function removeFromWishlist(index) {
  let wishlist = getWishlist();
  wishlist.splice(index, 1);
  saveWishlist(wishlist);
  renderWishlist();
  updateWishlistButtons();
}

// Add wishlist item to cart
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

// Update the text & style of all wishlist buttons on the product page
function updateWishlistButtons() {
  const wishlist = getWishlist();
  document.querySelectorAll(".product").forEach(product => {
    const name = product.dataset.name;
    const btn = product.querySelector(".add-to-wishlist-btn");
    if (!btn) return;

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

// Attach click event listeners to wishlist buttons (product page)
function handleWishlistButtons() {
  console.log("Hooking wishlist buttons");
  document.querySelectorAll(".add-to-wishlist-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const productDiv = e.target.closest(".product");
      if (!productDiv) return;

      const name = productDiv.dataset.name;
      const price = productDiv.dataset.price;
      const image = productDiv.dataset.image;

      console.log("Clicked wishlist for:", name);

      let wishlist = getWishlist();
      const exists = wishlist.some(item => item.name === name);

      if (exists) {
        // Remove from wishlist
        wishlist = wishlist.filter(item => item.name !== name);
      } else {
        // Add to wishlist
        wishlist.push({ name, price, image });
      }

      saveWishlist(wishlist);
      updateWishlistButtons();
    });
  });
}

// Initialization on DOM load
document.addEventListener('DOMContentLoaded', () => {
  renderWishlist();         // Render wishlist only if wishlist page container exists
  updateWishlistButtons();  // Update buttons on product page
  handleWishlistButtons();  // Attach event listeners to wishlist buttons
});