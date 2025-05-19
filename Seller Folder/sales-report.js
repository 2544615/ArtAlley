import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.firebasestorage.app",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const salesBody = document.getElementById("sales-body");
const trendFilter = document.getElementById("trendFilter");
const reportTypeSelect = document.getElementById("reportType");
const valueTypeFilter = document.getElementById("valueTypeFilter");
const ctx = document.getElementById("salesChart").getContext("2d");

let chartInstance;

function renderChart(labels, values, chartType = "line", valueType = "sales") {
  if (chartInstance) chartInstance.destroy();

  const datasets = [
    {
      label: valueType === "quantity" ? "Total Quantity Sold" : "Total Sales (R)",
      data: values,
      backgroundColor: "rgba(54, 162, 235, 0.2)",
      borderColor: "rgba(54, 162, 235, 1)",
      borderWidth: 2,
      tension: 0.3
    }
  ];

  if (chartType === "pie") {
    datasets[0].backgroundColor = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40"
    ];
    datasets[0].borderColor = "#fff";
    datasets[0].tension = 0;
  } else if (chartType === "bar") {
    datasets[0].tension = 0; // bar doesn't need tension
  }

  chartInstance = new Chart(ctx, {
    type: chartType,
    data: {
      labels: labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      scales: chartType !== "pie" ? {
        y: {
          beginAtZero: true
        }
      } : undefined,
      plugins: {
        legend: {
          display: true
        }
      }
    }
  });
}

function formatDate(dateObj) {
  return dateObj.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function aggregateSalesByDate(sales, daysRange, valueType = "sales") {
  const dateMap = {};

  sales.forEach((sale) => {
    const dateStr = sale.date.toISOString().split("T")[0]; // YYYY-MM-DD
    if (!dateMap[dateStr]) {
      dateMap[dateStr] = 0;
    }
    dateMap[dateStr] += (valueType === "quantity") ? sale.quantity : sale.totalPrice;
  });

  const sortedDates = Object.keys(dateMap).sort();
  const values = sortedDates.map(date => dateMap[date]);

  return { labels: sortedDates, values };
}



function aggregateSalesByProduct(sales, valueType = "sales") {
  const productMap = {};

  sales.forEach((sale) => {
    const productId = sale.productId;
    const value = (valueType === "quantity") ? sale.quantity : sale.totalPrice;

    if (!productMap[productId]) {
      productMap[productId] = 0;
    }
    productMap[productId] += value;
  });

  const labels = Object.keys(productMap);
  const values = Object.values(productMap);

  return { labels, values };
}


function showTable(show) {
  const salesTable = document.getElementById("sales-table");
  const salesChart = document.getElementById("salesChart");
  if (show) {
    salesTable.style.display = "table";
    salesChart.style.display = "none";
  } else {
    salesTable.style.display = "none";
    salesChart.style.display = "block";
  }
}


async function loadSalesReport(daysRange) {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login-seller.html";
      return;
    }

    const sellerUID = user.uid;
    const q = query(collection(db, "sellers", sellerUID, "sales"));
    const querySnapshot = await getDocs(q);

    const allSales = [];
    salesBody.innerHTML = "";

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysRange);

    querySnapshot.forEach((doc) => {
      const sale = doc.data();
      const saleDate = sale.timestamp?.toDate ? sale.timestamp.toDate() : new Date();

      if (saleDate >= startDate) {
        allSales.push({
          ...sale,
          date: saleDate,
          totalPrice: sale.price // modify if you want price * quantity
        });
      }
    });

    const totalSalesSummary = document.getElementById("total-sales-summary");
    const totalAmount = allSales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    totalSalesSummary.textContent = `Total Sales: R ${totalAmount.toFixed(2)}`;

    const totalQuantity = allSales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalQuantitySummary = document.getElementById("total-quantity-summary");
    totalQuantitySummary.textContent = `Total Items Sold: ${totalQuantity}`;


    const reportType = reportTypeSelect.value;
    const valueType = valueTypeFilter.value;


    if (reportType === "table") {
      showTable(true);
      allSales.forEach((sale) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${sale.productId}</td>
          <td>${sale.quantity}</td>
          <td>${sale.price.toFixed(2)}</td>
          <td>${sale.date.toLocaleDateString()}</td>
        `;
        salesBody.appendChild(row);
      });
    } else {
      showTable(false);
      let aggregated;

      if (reportType === "pie") {
        aggregated = aggregateSalesByProduct(allSales, valueType);
      } else {
        aggregated = aggregateSalesByDate(allSales, daysRange, valueType);
      }

      renderChart(aggregated.labels, aggregated.values, reportType, valueType);

    }
  });
}

// Event listeners for filters
trendFilter.addEventListener("change", () => {
  const days = parseInt(trendFilter.value);
  loadSalesReport(days);
});

reportTypeSelect.addEventListener("change", () => {
  const days = parseInt(trendFilter.value);
  loadSalesReport(days);
});

valueTypeFilter.addEventListener("change", () => {
  const days = parseInt(trendFilter.value);
  loadSalesReport(days);
});

// Load initial data for 30 days & default table view
loadSalesReport(parseInt(trendFilter.value) || 30);