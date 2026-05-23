 const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: '*'
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log('MongoDB Error:', err));

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  business: String,
  email: String,
  whatsapp: String,
  projectType: String,
  budget: String,
  message: String,
  date: { type: Date, default: Date.now }
});

const Contact = mongoose.model('Contact', contactSchema);

// Contact Route
app.post('/contact', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Contact - AK Solution',
      html: `
        <h2>New Contact Form Submission</h2>
        <p><b>Name:</b> ${req.body.name}</p>
        <p><b>Business:</b> ${req.body.business}</p>
        <p><b>Email:</b> ${req.body.email}</p>
        <p><b>WhatsApp:</b> ${req.body.whatsapp}</p>
        <p><b>Project:</b> ${req.body.projectType}</p>
        <p><b>Budget:</b> ${req.body.budget}</p>
        <p><b>Message:</b> ${req.body.message}</p>
      `
    });

    res.json({ success: true, message: 'Message sent!' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
