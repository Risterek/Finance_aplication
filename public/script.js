document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transaction-form');
  const transactionsList = document.getElementById('transactions-list');

  if (!form || !transactionsList) {
    console.error("Brakuje elementów DOM — sprawdź ID formularza i listy");
    return;
  }

  let categoryChart; // zmienna do wykresu

  // Funkcja do wyświetlania jednej transakcji
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

  // Funkcja do rysowania wykresu wydatków wg kategorii
  function renderChart(transactions) {
    // Grupujemy sumy wydatków wg kategorii
    const sums = {};
    transactions.forEach(({ category, amount }) => {
      if (!sums[category]) sums[category] = 0;
      if (amount < 0) sums[category] += Math.abs(amount); // tylko wydatki
    });

    const labels = Object.keys(sums);
    const data = Object.values(sums);

    const ctx = document.getElementById('categoryChart').getContext('2d');

    if (categoryChart) {
      categoryChart.destroy(); // usuń poprzedni wykres
    }

    categoryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Wydatki (PLN)',
          data,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Funkcja do pobierania i wyświetlania transakcji
  async function loadTransactions() {
    try {
      const res = await fetch('/api/transaction');
      if (!res.ok) throw new Error('Błąd podczas pobierania transakcji');

      const data = await res.json();
      transactionsList.innerHTML = data.map(renderTransaction).join('');
      renderChart(data); // rysuj wykres
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
