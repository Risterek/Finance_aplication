document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transaction-form');
  const transactionsList = document.getElementById('transactions-list');

  if (!form || !transactionsList) {
    console.error("Brakuje elementów DOM — sprawdź ID formularza i listy");
    return;
  }

  function renderTransaction(transaction) {
    return `
      <div class="transaction">
        <div><strong>Opis:</strong> ${transaction.description}</div>
        <div><strong>Kwota:</strong> ${transaction.amount} zł</div>
        <div><strong>Kategoria:</strong> <em>${transaction.category}</em></div>
        <hr>
      </div>
    `;
  }

  async function loadTransactions() {
    try {
      const res = await fetch('/api/transaction');
      if (!res.ok) throw new Error('Błąd podczas pobierania transakcji');

      const data = await res.json();
      transactionsList.innerHTML = data
        .map(renderTransaction)
        .join('');
    } catch (err) {
      transactionsList.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
  }

  async function loadSummary() {
    const summaryContainer = document.getElementById('summary');
    summaryContainer.innerHTML = 'Ładowanie...';

    try {
      const res = await fetch('/api/summary');
      if (!res.ok) throw new Error('Błąd ładowania podsumowania');

      const data = await res.json();

      const summaryHtml = Object.entries(data)
        .map(([category, total]) => `<p><strong>${category}:</strong> ${total} zł</p>`)
        .join('');

      summaryContainer.innerHTML = summaryHtml;

    } catch (err) {
      summaryContainer.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const description = document.getElementById('description').value.trim();
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;

    if (!description || isNaN(amount) || !category) {
      alert('Wypełnij poprawnie wszystkie pola');
      return;
    }

    try {
      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount, category }),
      });

      if (!res.ok) throw new Error('Błąd podczas dodawania transakcji');

      form.reset();
      loadTransactions();
      loadSummary(); // odśwież po dodaniu

    } catch (err) {
      alert(err.message);
    }
  });

  loadTransactions();
  loadSummary();
});
