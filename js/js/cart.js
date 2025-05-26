// cart.js

function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(product) {
  const cart = getCart();
  const existingItem = cart.find(item => item.id === product.id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }
  saveCart(cart);
}

function renderCart() {
  const cart = getCart();
  const container = document.getElementById('cart-items');
  const totalContainer = document.getElementById('cart-total');
  const checkoutLink = document.getElementById('checkout-link');

  if (!container) return;

  container.innerHTML = '';

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    totalContainer.textContent = '';
    checkoutLink.style.display = 'none';
    return;
  }

  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" />
      <div>
        <p><strong>${item.name}</strong></p>
        <p>Price: GHS ${item.price.toFixed(2)}</p>
        <p>Quantity: ${item.quantity}</p>
      </div>
    `;
    container.appendChild(itemDiv);
  });

  totalContainer.textContent = `Total: GHS ${total.toFixed(2)}`;
  checkoutLink.style.display = 'inline-block';
}

<script src="https://js.paystack.co/v1/inline.js"></script>

<script>
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  function calculateCartTotal() {
    let total = 0;
    cart.forEach(item => {
      total += item.price * item.quantity;
    });
    return total;
  }

  const shippingSelect = document.getElementById('shipping');
  const finalTotalDiv = document.getElementById('final-total');

  function updateFinalTotal() {
    const shippingCost = parseFloat(shippingSelect.value || 0);
    const cartTotal = calculateCartTotal();
    const grandTotal = cartTotal + shippingCost;
    finalTotalDiv.textContent = `Total with Shipping: GHS ${grandTotal.toFixed(2)}`;
  }

  shippingSelect.addEventListener('change', updateFinalTotal);
  updateFinalTotal();

  document.getElementById('checkout-form').addEventListener('submit', function(e) {
    e.preventDefault();

    if (cart.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    const name = this.name.value.trim();
    const email = this.email.value.trim();
    const phone = this.phone.value.trim();
    const shippingCost = parseFloat(this.shipping.value || 0);
    const totalAmount = calculateCartTotal() + shippingCost;
    const amountInKobo = totalAmount * 100;

    var handler = PaystackPop.setup({
      key: 'pk_live_5e37f9b952133486b9b05a6798a5e921afa25bc6', // ← replace with your Paystack PUBLIC key
      email: email,
      amount: amountInKobo,
      currency: 'GHS',
      metadata: {
        custom_fields: [
          { display_name: "Customer Name", value: name },
          { display_name: "Phone Number", value: phone },
          { display_name: "Shipping Option", value: `GHS ${shippingCost.toFixed(2)}` }
        ]
      },
      callback: function(response) {
        alert('Payment complete! Reference: ' + response.reference);
        localStorage.removeItem('cart');
        window.location.href = 'index.html';
      },
      onClose: function() {
        alert('Payment window closed.');
      }
    });

    handler.openIframe();
  });
</script>