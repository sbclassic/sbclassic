function addToCart(product, quantity = 1) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ ...product, quantity: quantity });
  }
  saveCart(cart);
  alert(`${product.name} (x${quantity}) added to cart`);
}