function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalContainer = document.getElementById('cart-total');
  const checkoutLink = document.getElementById('checkout-link');
  const cart = getCart();

  cartItemsContainer.innerHTML = '';
  let total = 0;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    checkoutLink.style.display = 'none';
    cartTotalContainer.innerText = '';
    return;
  }

  cart.forEach((item, index) => {
    total += item.price * item.quantity;

    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item');
    itemElement.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p>Price: GHS ${item.price.toFixed(2)}</p>
        <p>Quantity: 
          <button onclick="updateQuantity(${index}, -1)">−</button>
          ${item.quantity}
          <button onclick="updateQuantity(${index}, 1)">+</button>
        </p>
        <button onclick="removeItem(${index})" style="color:red;">Remove ❌</button>
      </div>
    `;

    cartItemsContainer.appendChild(itemElement);
  });

  cartTotalContainer.innerText = `Total: GHS ${total.toFixed(2)}`;
  checkoutLink.style.display = 'inline-block';
}

function updateQuantity(index, change) {
  let cart = getCart();
  cart[index].quantity += change;

  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  saveCart(cart);
  renderCart();
}

function removeItem(index) {
  let cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
}