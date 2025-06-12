<!-- Your cart page script -->
<script>
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
  const currencySelect = document.getElementById('currency'); // Optional dropdown
  const selectedCurrency = currencySelect ? currencySelect.value : 'GHS';

  const cart = getCart();
  cartItemsDiv.innerHTML = '';

  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p>Your cart is empty.</p>';
    checkoutLink.style.display = 'none';
    cartTotalDiv.textContent = '';
    localStorage.setItem('cartTotal', '0');
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

  // Store total in localStorage for checkout page
  localStorage.setItem('cartTotal', total.toFixed(2));

  // Currency conversion
  const conversionRates = {
    GHS: 1,
    USD: 1 / 11.5,
    NGN: 1 / 0.048,
    EUR: 1 / 12.5,
    GBP: 1 / 14.2,
    XOF: 1 / 0.0091
  };

  const currencySymbols = {
    GHS: '₵',
    USD: '$',
    NGN: '₦',
    EUR: '€',
    GBP: '£',
    XOF: 'CFA '
  };

  const rate = conversionRates[selectedCurrency] || 1;
  const symbol = currencySymbols[selectedCurrency] || '₵';
  const convertedTotal = total * rate;

  cartTotalDiv.textContent = `Total: ${symbol}${convertedTotal.toFixed(2)}`;
  checkoutLink.style.display = 'inline-block';
}

// Optional: React to currency changes
const currencyDropdown = document.getElementById('currency');
if (currencyDropdown) {
  currencyDropdown.addEventListener('change', renderCart);
}

// Initial load
renderCart();
</script>