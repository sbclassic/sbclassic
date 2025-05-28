const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API endpoint to receive order and send email/WhatsApp
app.post('/api/send-order', (req, res) => {
  const order = req.body;

  console.log('Received order:', order);

  // TODO: Add email and WhatsApp notification logic here

  // Simulate success response
  res.status(200).json({ message: 'Order received and notifications sent.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
