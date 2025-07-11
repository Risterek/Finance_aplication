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

  let categoryChart, pieChart;
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

  function renderCategoryChart(transactions) {
    const sums = {};
    transactions.forEach(({ category, amount, type }) => {
      if (type === 'expense') {
        sums[category] = (sums[category] || 0) + Math.abs(amount);
      }
    });

    const labels = Object.keys(sums);
    const data = Object.values(sums);

    const ctx = document.getElementById('categoryChart').getContext('2d');
    if (categoryChart) categoryChart.destroy();

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
        scales: { y: { beginAtZero: true } }
      }
    });
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
          data,
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
          borderColor: '#fff',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
      }
    });
  }

  function updateSummary(transactions) {
    let totalExpenses = 0;
    let totalIncomes = 0;

    transactions.forEach(({ amount, type }) => {
      if (type === 'expense') totalExpenses += Math.abs(amount);
      else totalIncomes += am
