const text = document.getElementById("text");
const amount = document.getElementById("amount");
const date = document.getElementById("date");

const list = document.getElementById("list");
const balance = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");

const incomeBtn = document.getElementById("incomeBtn");
const expenseBtn = document.getElementById("expenseBtn");

const exportBtn = document.getElementById("exportBtn");
const clearBtn = document.getElementById("clearBtn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let expenseChart;
let editIndex = -1;

/* ADD / UPDATE */
function addTransaction(type) {
  if (text.value.trim() === "" || amount.value <= 0) {
    alert("Enter valid data");
    return;
  }

  const transaction = {
    text: text.value,
    amount: type === "expense" ? -Number(amount.value) : Number(amount.value),
    date: date.value || new Date().toISOString().split("T")[0]
  };

  if (editIndex === -1) {
    transactions.push(transaction);
  } else {
    transactions[editIndex] = transaction;
    editIndex = -1;
  }

  text.value = "";
  amount.value = "";
  date.value = "";

  incomeBtn.innerText = "Add Income";
  expenseBtn.innerText = "Add Expense";

  updateUI();
}

incomeBtn.addEventListener("click", () => addTransaction("income"));
expenseBtn.addEventListener("click", () => addTransaction("expense"));

/* UPDATE UI */
function updateUI() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  list.innerHTML = "";

  if (transactions.length === 0) {
    list.innerHTML = "<p style='text-align:center; color:gray;'>No transactions yet</p>";
    balance.innerText = 0;
    incomeEl.innerText = 0;
    expenseEl.innerText = 0;
    if (expenseChart) expenseChart.destroy();
    return;
  }

  let total = 0, income = 0, expense = 0;

  transactions.forEach((t, index) => {

    const li = document.createElement("li");

    const left = document.createElement("div");
    left.innerHTML = `<strong>${t.text}</strong><br><small>${t.date}</small>`;

    const right = document.createElement("div");

    /* 🔥 UPDATED: amount styling */
    const amountText = document.createElement("span");
    amountText.classList.add("amount");
    amountText.innerText = `${t.amount < 0 ? "-" : "+"} ₹${Math.abs(t.amount)}`;

    /* EDIT BUTTON */
    const editBtn = document.createElement("button");
    editBtn.innerText = "EDIT";
    editBtn.classList.add("edit-btn");
    editBtn.addEventListener("click", () => editTransaction(index));

    /* DELETE BUTTON */
    const deleteBtn = document.createElement("button");
    deleteBtn.innerText = "DELETE";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => deleteTransaction(index));

    right.appendChild(amountText);
    right.appendChild(editBtn);
    right.appendChild(deleteBtn);

    li.appendChild(left);
    li.appendChild(right);

    if (t.amount < 0) {
      li.classList.add("expense");
      expense += t.amount;
    } else {
      li.classList.add("income");
      income += t.amount;
    }

    list.appendChild(li);
    total += t.amount;
  });

  balance.innerText = total;
  incomeEl.innerText = income;
  expenseEl.innerText = Math.abs(expense);

  /* CHART */
  const ctx = document.getElementById("expenseChart");

  if (expenseChart) expenseChart.destroy();

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, Math.abs(expense)],
        backgroundColor: ["#16a34a", "#dc2626"] // nicer colors
      }]
    }
  });
}

/* DELETE */
function deleteTransaction(index) {
  transactions.splice(index, 1);
  updateUI();
}

/* EDIT */
function editTransaction(index) {
  const t = transactions[index];

  text.value = t.text;
  amount.value = Math.abs(t.amount);
  date.value = t.date;

  editIndex = index;
  text.focus();

  incomeBtn.innerText = "Update Income";
  expenseBtn.innerText = "Update Expense";
}

/* CLEAR */
clearBtn.addEventListener("click", () => {
  transactions = [];
  localStorage.removeItem("transactions");
  updateUI();
});

/* EXPORT */
exportBtn.addEventListener("click", () => {
  let csv = "Description,Amount,Date\n";

  transactions.forEach(t => {
    csv += `"${t.text}",${t.amount},${t.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");

  link.href = URL.createObjectURL(blob);
  link.download = "transactions.csv";

  link.click();
});

updateUI();