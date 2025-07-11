document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transaction-form');
  const transactionsList = document.getElementById('transactions-list');

  if (!form || !transactionsList) {
    console.error("Brakuje elementów DOM — sprawdź ID formularza i listy");
    return;
  }

  // Budżetowanie
  let budget = localStorage.getItem('budget') ? parseFloat(localStorage.getItem('budget')) : 0;

  document.getElementById('set-budget').addEventListener('click', () => {
    const input = document.getElementById('budget-input');
    const value = parseFloat(input.value);
    if (!isNaN(value) && value >= 0) {
      budget = value;
      localStorage.setItem('budget', budget);
      showBudgetInfo();
      input.value = '';
    } else {
      alert('Podaj poprawną wartość budżetu');
    }
  });

  function showBudgetInfo() {
    const info = document.getElementById('budget-info');
    // Oblicz sumę transakcji (kwoty)
    let total = 0;
    transactionsList.querySelectorAll('.transaction').forEach(t => {
      const amountText = t.querySelector('div:nth-child(2)').textContent;
      const amount = parseFloat(amountText.replace(/[^\d.-]/g, ''));
      total += amount;
    });

    if (budget > 0) {
      if (total > budget) {
        info.textContent = `⚠️ Przekroczono budżet! Limit: ${budget} zł, Wydano: ${total.toFixed(2)} zł`;
        info.style.color = 'red';
      } else {
        info.textContent = `✅ Pozostało: ${(budget - total).toFixed(2)} zł z budżetu ${budget} zł`;
        info.style.color = 'green';
      }
    } else {
      info.textContent = 'Brak ustawionego budżetu';
      info.style.color = 'gray';
    }
  }

  // Funkcja do wyświetlania jednej transakcji
  function renderTransaction(transaction) {
    return `
      <div class="transaction">
        <div><strong>Opis:</strong> ${transaction.description}</div>
        <div><strong>Kwota:</strong> ${transaction.amount.toFixed(2)} zł</div>
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
      transactionsList.innerHTML = data.map(renderTransaction).join('');
      showBudgetInfo();
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
