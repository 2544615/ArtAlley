import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getFirestore, collection, query, where, getDocs, orderBy, startAfter, limit } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// 🔐 Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.firebasestorage.app",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

// 🔌 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const ordersContainer = document.getElementById("orders");
const timeFilter = document.getElementById("timeFilter");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let lastVisibleDoc = null;
let currentUser = null;
let selectedMonths = 12;
const PAGE_SIZE = 5;

function formatShippingAddress(shipping) {
  if (!shipping) return "N/A";

  // Case: checkout.js (firstname, lastname, address, city, country)
  if (shipping.firstname || shipping.lastname || shipping.address) {
    return [
      `${shipping.firstname || ""} ${shipping.lastname || ""}`.trim(),
      shipping.address,
      shipping.city,
      shipping.country
    ].filter(Boolean).join(", ");
  }

  // Case: checkoutdelivery.js (name, street, complex, suburb, province, postalcode)
  if (shipping.street || shipping.name || shipping.suburb) {
    return [
      shipping.name,
      shipping.street,
      shipping.complex,
      shipping.suburb,
      shipping.city,
      shipping.province,
      shipping.postalcode,
      shipping.country
    ].filter(Boolean).join(", ");
  }

  // Default fallback
  return "N/A";
}


function getStartDate(monthsAgo) {
  const now = new Date();
  now.setMonth(now.getMonth() - monthsAgo);
  return now;
}

async function fetchOrders(reset = false) {
  if (!currentUser) return;

  const startDate = getStartDate(selectedMonths);
  let q = query(
    collection(db, "orders"),
    where("userId", "==", currentUser.uid),
    where("timestamp", ">=", startDate),
    orderBy("timestamp", "desc"),
    limit(PAGE_SIZE)
  );

  if (!reset && lastVisibleDoc) {
    q = query(q, startAfter(lastVisibleDoc));
  }

  const snapshot = await getDocs(q);

  if (reset) {
    ordersContainer.innerHTML = "";
  }

  if (snapshot.empty && reset) {
    ordersContainer.innerHTML = "<p>No orders found in this range.</p>";
    loadMoreBtn.style.display = "none";
    return;
  }

  snapshot.forEach(doc => {
    const order = doc.data();
    const orderDate = order.timestamp?.toDate().toLocaleString() || "Unknown date";
    const formattedAddress = formatShippingAddress(order.shipping || {});
    const items = order.items.map(item =>
      `<li>${item.name} x${item.quantity}</li>`).join("");

    ordersContainer.innerHTML += `
      <article style="border: 1px solid #ccc; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
        <header>
          <h2 style="margin-bottom: 5px;">Order Status: ${order.status}</h2>
          <p><strong>Ordered On:</strong> ${orderDate}</p>
        </header>
        <section>
          <p><strong>Reference:</strong> ${order.ref}</p>
          <p><strong>Shipping To:</strong> ${formattedAddress}</p>
          <p><strong>Total Paid:</strong> R${order.amount}</p>
          <p><strong>Items:</strong></p>
          <ul>${items}</ul>
        </section>
        <hr>
      </article>
    `;
  });

  lastVisibleDoc = snapshot.docs[snapshot.docs.length - 1];
  loadMoreBtn.style.display = snapshot.size < PAGE_SIZE ? "none" : "block";
}

timeFilter.addEventListener("change", () => {
  selectedMonths = parseInt(timeFilter.value);
  lastVisibleDoc = null;
  fetchOrders(true);
});

loadMoreBtn.addEventListener("click", () => fetchOrders());

onAuthStateChanged(auth, (user) => {
  if (!user) {
    ordersContainer.innerHTML = `<p>Please log in to view your orders.</p>`;
    return;
  }
  currentUser = user;
  fetchOrders(true);
});