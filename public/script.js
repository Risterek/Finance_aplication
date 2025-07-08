document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transaction-form');
  const transactionsList = document.getElementById('transactions-list');

  if (!form || !transactionsList) {
    console.error("Brakuje elementów DOM — sprawdź ID formularza i listy");
    return;
  }

  // Funkcja do wyświetlania jednej transakcji 2
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

  // Funkcja do ładowania i wyświetlania transakcji z backendu
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

  // Obsługa formularza
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

    } catch (err) {
      alert(err.message);
    }
  });

  loadTransactions();
});
