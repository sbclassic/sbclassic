<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cart 🛒 – SB CLASSIC</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
    }
    nav {
      margin-bottom: 20px;
    }
    .cart-item {
      border: 1px solid #ccc;
      padding: 12px;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 15px;
    }
    .cart-item img {
      width: 100px;
      height: auto;
    }
    .cart-controls {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    #checkout-link {
      display: none;
      margin-top: 20px;
      padding: 12px 20px;
      background-color: #191970;
      color: white;
      text-decoration: none;
      font-weight: bold;
      border-radius: 5px;
    }
    #clear-cart-btn {
      margin-top: 15px;
      padding: 10px 16px;
      background-color: #444;
      color: white;
      font-weight: bold;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <nav>
    <a href="index.html">Home</a> |
    <a href="checkout.html">Checkout 💳</a>
  </nav>

  <h1>Your Cart 🛒</h1>
  <div id="cart-items"></div>

  <button id="clear-cart-btn" onclick="clearCart()">🧹 Clear Cart</button>

  <div id="cart-total" style="margin-top: 10px; font-weight: bold;"></div>

  <!-- ✅ Working checkout link -->
  <a href="checkout.html" id="checkout-link">Proceed to Checkout 💳</a>

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

      localStorage.setItem('cartTotal', total.toFixed(2));

      cartTotalDiv.textContent = `Total: GHS ${total.toFixed(2)}`;
      checkoutLink.style.display = 'inline-block';
    }

    document.addEventListener('DOMContentLoaded', renderCart);
  </script>
</body>
</html>