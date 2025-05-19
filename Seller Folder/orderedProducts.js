import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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
    alert("Please log in to view your orders.");
    window.location.href = "../SignIn Folder/login-seller.html";
    return;
  }

  const OrdersList = document.getElementById("Orders");
  //const orderDetail = document.getElementById("orderDetail");

  try {
    const ordersSnapshot = await getDocs(collection(db, "orders"));
    const sellerOrders = [];

    for (const docSnap of ordersSnapshot.docs) {
      const order = docSnap.data();
      const sellerItems = order.items.filter(item => item.sellerId === user.uid);

      if (sellerItems.length > 0) {
        sellerOrders.push({
          ...order,
          sellerItems,
          buyerId: order.userId // Store buyer ID to fetch shipping info
        });
      }
    }

    if (sellerOrders.length === 0) {
      OrdersList.innerHTML = `<p style="text-align:center;">No orders from your store yet.</p>`;
      return;
    }

    // Generate HTML
    OrdersList.innerHTML = "";
    console.log("done");
    // orderDetail.innerHTML= "";
    // console.log("this is a problem");

    for (const order of sellerOrders) {
      const shippingQuery = query(
        collection(db, "shipping"),
        where("buyeruid", "==", order.buyerId)
      );

      const shippingSnapshot = await getDocs(shippingQuery);
      let fullName = "Unknown Buyer";

      if (!shippingSnapshot.empty) {
        const shippingData = shippingSnapshot.docs[0].data();
        fullName = `${shippingData.firstname} ${shippingData.lastname}`;
      }

      const productCount = order.sellerItems.reduce((sum, item) => sum + item.quantity, 0);

      const listItem = document.createElement("section");
      listItem.className = "order-box";
      listItem.innerHTML = `
        <article class="order-content">
          <header>
            <h3>${fullName}</h3>
            <p><strong>Products bought:</strong> ${productCount}</p>
          </header>
          
        </article>
      `;
      // const BuyerOrders=document.createElement('section');
      // BuyerOrders.innerHTML=`
      //   <h3>Order from: ${fullName}</h3>
      //   <section class="product-list">
      //       ${order.sellerItems.map(item => `
      //         <figure class="product-item">
      //           <img src="${item.imageUrl || '#'}" alt="${item.name}" />
      //           <figcaption>
      //             <p><strong>${item.name}</strong></p>
      //             <p>Qty: ${item.quantity}</p>
      //             <p>Price: R${item.price?.toFixed(2) || 'N/A'}</p>
      //           </figcaption>
      //         </figure>
      //       `).join("")}
      //     </section>
      
      // `;

      
      OrdersList.appendChild(listItem);
      //orderDetail.appendChild(BuyerOrders);
  // Example click handler
  listItem.addEventListener("click", () => {
    try {
      const orderJson = JSON.stringify(order);
      sessionStorage.setItem("selectedOrder", orderJson);
      console.log("Order saved:", orderJson);
  
      // Delay redirect by 100ms
      setTimeout(() => {
        window.location.href = "OrderDetail.html";
      }, 100);
    } catch (err) {
      console.error("Could not save order:", err);
    }
  });
  

    }

  } catch (error) {
    console.error("Error fetching seller orders:", error);
    OrdersList.innerHTML = `
      <p style='text-align:center;color:red;'>
        Error loading orders. Please try again later.
      </p>
    `;
  }
});
});