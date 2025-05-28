const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Nodemailer email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'sbclassic11@gmail.com',
    pass: process.env.EMAIL_PASS || 'Godisgood1.' // ideally use env var for this password
  }
});

// Twilio client setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

// Confirmation email + WhatsApp sender endpoint
app.post('/confirm-order', async (req, res) => {
  const { fullName, email, phone, address, orderSummary } = req.body;

  // Email setup
  const mailOptions = {
    from: process.env.EMAIL_USER || 'sbclassic11@gmail.com',
    to: email,
    subject: 'SB CLASSIC – Order Confirmation',
    text: `Hi ${fullName},\n\nThanks for your order!\n\nOrder Summary:\n${orderSummary}\n\nWe'll contact you shortly. — SB CLASSIC`
  };

  try {
    // Send confirmation email
    await transporter.sendMail(mailOptions);

    // Send WhatsApp confirmation message
    await client.messages.create({
      from: 'whatsapp:+14155238886', // Twilio WhatsApp Sandbox number (replace with your own if available)
      to: `whatsapp:${phone}`,       // customer phone, must be WhatsApp-enabled and in full format e.g. +233xxxxxxxxx
      body: `Hi ${fullName}, thanks for your SB CLASSIC order! We have received it and will process it shortly.`
    });

    res.status(200).json({ message: 'Email and WhatsApp message sent successfully.' });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ message: 'Failed to send notifications.' });
  }
});

app.get('/', (req, res) => {
  res.send('SB CLASSIC Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});