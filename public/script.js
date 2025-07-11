document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('transaction-form');
  const transactionsList = document.getElementById('transactions-list');
  const budgetInput = document.getElementById('budget-input');
  const setBudgetBtn = document.getElementById('set-budget-btn');
  const currentBudgetDisplay = document.getElementById('current-budget');
  const totalExpensesDisplay = document.getElementById('total-expenses');
  const totalIncomesDisplay = document.getElementById('total-incomes');
  const balanceDisplay = document.getElementById('balance');
  const budgetRemainingDisplay = document.getElementById('budget-remaining');

  let pieChart;
  let currentBudget = 0;

  if (localStorage.getItem('budget')) {
    currentBudget = parseFloat(localStorage.getItem('budget'));
    currentBudgetDisplay.textContent = currentBudget.toFixed(2);
  }

  function renderTransaction(transaction) {
    const sign = transaction.type === 'expense' ? '-' : '+';
    return `
      <div class="transaction">
        <div><strong>Opis:</strong> ${transaction.description}</div>
        <div><strong>Kwota:</strong> ${sign}${Math.abs(transaction.amount).toFixed(2)} zł</div>
        <div><strong>Kategoria:</strong> <em>${transaction.category}</em></div>
        <div><strong>Typ:</strong> ${transaction.type === 'expense' ? 'Wydatek' : 'Przychód'}</div>
        <hr>
      </div>
    `;
  }

  function renderPieChart(transactions) {
    const sums = {};
    transactions.forEach(({ category, amount, type }) => {
      if (type === 'expense') {
        sums[category] = (sums[category] || 0) + Math.abs(amount);
      }
    });

    const labels = Object.keys(sums);
    const data = Object.values(sums);

    const ctx = document.getElementById('pieChart').getContext('2d');
    if (pieChart) pieChart.destroy();

    pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels,
        datasets: [{
          label: 'Wydatki',
          data,
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
          ],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true
      }
    });
  }

  function updateSummary(transactions) {
    let totalExpenses = 0;
    let totalIncomes = 0;

    transactions.forEach(({ amount, type }) => {
      if (type === 'expense') totalExpenses += Math.abs(amount);
      else totalIncomes += amount;
    });

    const balance = totalIncomes - totalExpenses;
    const budgetRemaining = currentBudget - totalExpenses;

    totalExpensesDisplay.textContent = totalExpenses.toFixed(2);
    totalIncomesDisplay.textContent = totalIncomes.toFixed(2);
    balanceDisplay.textContent = balance.toFixed(2);
    budgetRemainingDisplay.textContent = budgetRemaining.toFixed(2);
  }

  async function loadTransactions() {
    try {
      const res = await fetch('/api/transaction');
      if (!res.ok) throw new Error('Błąd podczas pobierania transakcji');

      const data = await res.json();
      transactionsList.innerHTML = data.map(renderTransaction).join('');
      renderPieChart(data);
      updateSummary(data);
    } catch (err) {
      transactionsList.innerHTML = `<p style="color:red;">${err.message}</p>`;
    }
  }

  setBudgetBtn.addEventListener('click', () => {
    const val = parseFloat(budgetInput.value);
    if (isNaN(val) || val < 0) {
      alert('Wprowadź poprawną wartość budżetu');
      return;
    }
    currentBudget = val;
    localStorage.setItem('budget', currentBudget);
    currentBudgetDisplay.textContent = currentBudget.toFixed(2);
    loadTransactions();
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    const description = document.getElementById('description').value.trim();
    let amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const type = document.getElementById('type').value;

    if (!description || isNaN(amount) || !category || !type) {
      alert('Wypełnij poprawnie wszystkie pola');
      return;
    }

    if (type === 'expense' && amount > 0) amount = -amount;
    if (type === 'income' && amount < 0) amount = Math.abs(amount);

    try {
      const res = await fetch('/api/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, amount, category, type }),
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
