// This code should run after your DOM is loaded
document.querySelectorAll('.product').forEach(productDiv => {
  const btn = productDiv.querySelector('.add-to-cart-btn');
  btn.addEventListener('click', () => {
    const id = productDiv.dataset.id || productDiv.getAttribute('data-id');
    const name = productDiv.dataset.name || productDiv.getAttribute('data-name');
    const price = parseFloat(productDiv.dataset.price);
    const image = productDiv.dataset.image || productDiv.getAttribute('data-image');
    const quantityInput = productDiv.querySelector('.quantity-input');
    const quantity = quantityInput ? parseInt(quantityInput.value, 10) : 1;

    if (quantity <= 0 || isNaN(quantity)) {
      alert('Please enter a valid quantity.');
      return;
    }

    addToCart({ id, name, price, image }, quantity);
  });
});