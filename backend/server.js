const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Test Route
app.get('/', (req, res) => {
  res.send('SB CLASSIC backend is running!');
});

// POST /order Route
app.post('/order', async (req, res) => {
  const { name, email, phone, orderItems, totalAmount, orderRef } = req.body;

  try {
    // Send confirmation email (using Gmail for example)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your_email@gmail.com',      // Replace with your Gmail
        pass: 'your_app_password',         // Use app password, not regular password
      },
    });

    const mailOptions = {
      from: 'SB CLASSIC <your_email@gmail.com>',
      to: email,
      subject: `Order Confirmation - Ref: ${orderRef}`,
      text: `Hi ${name},\n\nThank you for shopping with SB CLASSIC!\n\nOrder Reference: ${orderRef}\nTotal: GHS ${totalAmount}\n\nItems:\n${orderItems.map(item => `- ${item.name} x${item.qty}`).join('\n')}\n\nWe'll contact you shortly.`,
    };

    await transporter.sendMail(mailOptions);

    // (Optional) Send WhatsApp message using Twilio here later

    res.status(200).json({ message: 'Order confirmed and email sent!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Order processing failed.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});