const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Confirmation email sender
app.post('/confirm-order', async (req, res) => {
  const { fullName, email, phone, address, orderSummary } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'sbclassic11@gmail.com',
      pass: 'Godisgood1.' // replace this safely with your actual Gmail App Password
    }
  });

  const mailOptions = {
    from: 'sbclassic11@gmail.com',
    to: email,
    subject: 'SB CLASSIC – Order Confirmation',
    text: `Hi ${fullName},\n\nThanks for your order!\n\nOrder Summary:\n${orderSummary}\n\nWe'll contact you shortly. — SB CLASSIC`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully.' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Failed to send email.' });
  }
});

app.get('/', (req, res) => {
  res.send('SB CLASSIC Backend is running!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});