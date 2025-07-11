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

const transactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Endpointy API
app.get('/api/transaction', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Błąd pobierania transakcji' });
  }
});

app.post('/api/transaction', async (req, res) => {
  try {
    const { description, amount, category } = req.body;
    const newTransaction = new Transaction({ description, amount, category });
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (err) {
    res.status(500).json({ error: 'Błąd zapisywania transakcji' });
  }
});

// Nowy endpoint: podsumowanie kategorii
app.get('/api/summary', async (req, res) => {
  try {
    const transactions = await Transaction.find();

    const summary = {};

    transactions.forEach(t => {
      if (!summary[t.category]) {
        summary[t.category] = 0;
      }
      summary[t.category] += t.amount;
    });

    res.json(summary);
  } catch (err) {
    console.error("❌ Błąd podczas generowania podsumowania:", err.message);
    res.status(500).json({ error: "Błąd serwera" });
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`🌍 Serwer działa na porcie: ${PORT}`);
});
