import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.appspot.com",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Please log in to view the order.");
      window.location.href = "../SignIn Folder/login-seller.html";
      return;
    }

    const orderDetail = document.getElementById("orderDetail");

    // Retrieve selected order from sessionStorage
     const orderData = sessionStorage.getItem("selectedOrder");
    // if (!orderData) {
    //   orderDetail.innerHTML = `<p style="text-align:center;">No order selected.</p>`;
    //   return;
    // }

    const order = JSON.parse(orderData);
    if (!order || !order.sellerItems || !order.buyerId) {
      orderDetail.innerHTML = `<p style="text-align:center;color:red;">Invalid order data.</p>`;
      return;
    }

    try {
      // Get buyer shipping info
      const shippingQuery = query(
        collection(db, "shipping"),
        where("buyeruid", "==", order.buyerId)
      );

      const shippingSnapshot = await getDocs(shippingQuery);
      let fullName = "Unknown Buyer";
      let contact = "N/A";
      

      if (!shippingSnapshot.empty) {
        const shippingData = shippingSnapshot.docs[0].data();
        fullName = `${shippingData.firstname} ${shippingData.lastname}`;
        contact = shippingData.contact || "N/A";
      }

      const productCount = order.sellerItems.reduce((sum, item) => sum + item.quantity, 0);

      const BuyerOrders = document.createElement("section");
      BuyerOrders.innerHTML = `
        <h3>Order from: ${fullName}</h3>
        <p>Contact Detail: ${contact}</p>
        <p><strong>Total Products:</strong> ${productCount}</p>
        <section class="product-list">
          ${order.sellerItems.map(item => `
            <figure class="product-item">
              <img src="${item.imageUrl || '#'}" alt="${item.name}" />
              <figcaption>
                <p><strong>${item.name}</strong></p>
                <p>Qty: ${item.quantity}</p>
                <p>Price: R${item.price?.toFixed(2) || 'N/A'}</p>
              </figcaption>
            </figure>
          `).join("")}
        </section>
      `;

      orderDetail.appendChild(BuyerOrders);

    } catch (error) {
      console.error("Error loading order details:", error);
      orderDetail.innerHTML = `
        <p style='text-align:center;color:red;'>
          Error loading order details. Please try again later.
        </p>
      `;
    }
  });
});
