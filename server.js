require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serwowanie statycznych plików z public/
app.use(express.static(path.join(__dirname, 'public')));

// Połączenie z MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Połączono z MongoDB Atlas"))
.catch(err => console.error("❌ Błąd połączenia:", err));

// Model transakcji z kategorią
const transactionSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,        // <-- nowe pole
  createdAt: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Endpoint do dodawania transakcji z kategorią
app.post('/api/transaction', async (req, res) => {
  const { description, amount, category } = req.body;

  if (!description || isNaN(amount) || !category) {
    return res.status(400).json({ error: 'Nieprawidłowe dane' });
  }

  try {
    const newTransaction = new Transaction({ description, amount, category });
    await newTransaction.save();
    console.log("📥 Otrzymano dane:", newTransaction);
    res.status(201).json({ message: 'Dodano transakcję' });
  } catch (err) {
    console.error("❌ Błąd zapisu do bazy:", err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Endpoint do pobierania wszystkich transakcji
app.get('/api/transaction', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error("❌ Błąd pobierania transakcji:", err);
    res.status(500).json({ error: 'Błąd serwera' });
  }
});

// Start serwera
app.listen(PORT, () => {
  console.log(`🌍 Serwer działa na porcie: ${PORT}`);
});
