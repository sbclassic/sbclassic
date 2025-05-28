const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sgMail = require('@sendgrid/mail');
const { v4: uuidv4 } = require('uuid');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
app.use(cors());
app.use(bodyParser.json());

const orders = {}; // In-memory store (replace with DB in production)

function generateReference() {
  return uuidv4().slice(0, 8).toUpperCase();
}

// POST /api/orders
app.post('/api/orders', async (req, res) => {
  try {
    const { name, email, phone, cart, subtotal, discount, shippingCost, total, promoCode } = req.body;

    if (!name || !email || !phone || !cart || !total) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const reference = generateReference();
    const order = {
      reference,
      name,
      email,
      phone,
      cart,
      subtotal,
      discount,
      shippingCost,
      total,
      promoCode,
      status: 'Processing',
      createdAt: new Date().toISOString(),
    };

    // Save order
    orders[reference] = order;

    // Compose email
    const itemsList = order.cart.map(item => `${item.quantity} x ${item.name} (GHS ${item.price})`).join('\n');
    const emailText = `Dear ${order.name},

Thank you for your order with SB CLASSIC!

Order Reference: ${order.reference}

Items:
${itemsList}

Subtotal: GHS ${order.subtotal.toFixed(2)}
Discount: GHS ${order.discount.toFixed(2)}
Shipping: GHS ${order.shippingCost.toFixed(2)}
Total: GHS ${order.total.toFixed(2)}

We will notify you when your order ships.

Best regards,
SB CLASSIC Team`;

    const msg = {
      to: order.email,
      from: 'orders@sbclassic.com', // Replace with your verified sender
      subject: `SB CLASSIC Order Confirmation - ${order.reference}`,
      text: emailText,
    };

    await sgMail.send(msg);

    res.json({ message: 'Order placed successfully', reference });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/:reference for tracking
app.get('/api/orders/:reference', (req, res) => {
  const order = orders[req.params.reference.toUpperCase()];
  if (!order) return res.status(404).json({ error: 'Order not found' });

  res.json({ reference: order.reference, status: order.status, name: order.name, total: order.total });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
