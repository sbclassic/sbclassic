<script>
  document.addEventListener('DOMContentLoaded', () => {
    // Auto-fill missing data attributes (in case you forget)
    document.querySelectorAll('.product').forEach((productDiv, index) => {
      if (!productDiv.dataset.id || !productDiv.dataset.name || !productDiv.dataset.price || !productDiv.dataset.image) {
        const name = productDiv.querySelector('h3')?.textContent.trim() || `Product ${index + 1}`;
        const priceText = productDiv.querySelector('.price')?.textContent || '';
        const price = parseFloat(priceText.replace(/[^\d.]/g, '').replace(/,/g, '')) || 0;
        const image = productDiv.querySelector('img')?.getAttribute('src') || '';

        productDiv.dataset.id = name.toLowerCase().replace(/\s+/g, '-') + '-' + index;
        productDiv.dataset.name = name;
        productDiv.dataset.price = price.toFixed(2);
        productDiv.dataset.image = image;
      }
    });

    // Add to cart logic
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const productDiv = btn.closest('.product');
        const quantityInput = productDiv.querySelector('.quantity-input');
        const sizeSelect = productDiv.querySelector('.size-select');

        let quantity = parseInt(quantityInput?.value);
        if (isNaN(quantity) || quantity < 1) quantity = 1;

        const selectedSize = sizeSelect ? sizeSelect.value : null;

        const product = {
          id: productDiv.dataset.id,
          name: productDiv.dataset.name,
          price: parseFloat(productDiv.dataset.price),
          image: productDiv.dataset.image,
          size: selectedSize,
          quantity: quantity
        };

        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        const existingProduct = cart.find(item => item.id === product.id && item.size === product.size);
        if (existingProduct) {
          existingProduct.quantity += quantity;
        } else {
          cart.push(product);
        }

        localStorage.setItem('cart', JSON.stringify(cart));

        // ✅ Immediately update the total in localStorage
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        localStorage.setItem('cartTotal', total.toFixed(2));

        alert(`✅ ${quantity} x "${product.name}" (Size: ${product.size || 'N/A'}) added to cart!`);
      });
    });
  });
</script>