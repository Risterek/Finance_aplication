const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Połączenie z MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅ Połączono z MongoDB");
}).catch(err => {
  console.error("❌ Błąd połączenia:", err);
});

// Zaktualizowany schemat z "type"
const transactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,
  type: { type: String, enum: ['income', 'expense'], required: true },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: pobierz wszystkie transakcje
app.get('/api/transaction', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania transakcji' });
  }
});

// API: dodaj nową transakcję
app.post('/api/transaction', async (req, res) => {
  try {
    const { description, amount, category, type } = req.body;
    const newTransaction = new Transaction({ description, amount, category, type });
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(500).json({ error: 'Błąd zapisywania transakcji' });
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`🌍 Serwer działa na porcie: ${PORT}`);
});
