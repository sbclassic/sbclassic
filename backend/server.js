const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Route to handle order data sent from frontend
app.post('/api/send-order', (req, res) => {
  const order = req.body;
  console.log('Order received:', order);

  // TODO: Add email sending or WhatsApp notifications here

  // Respond to frontend that order was received successfully
  res.json({ success: true, message: 'Order received' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});