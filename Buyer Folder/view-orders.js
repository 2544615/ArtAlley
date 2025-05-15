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
const ordersContainer = document.getElementById("ordersContainer");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in to view your orders.");
    window.location.href = "../SignIn Folder/login-buyer.html";
    return;
  }

  try {
    console.log("Fetching orders for user:", user.uid);
    
    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc")
    );

    const snapshot = await getDocs(q);
    console.log("Orders snapshot:", snapshot);
    
    if (snapshot.empty) {
      console.log("No orders found for user");
      ordersContainer.innerHTML = "<p style='text-align:center;'>You have no orders yet.</p>";
      return;
    }

    ordersContainer.innerHTML = ""; // Clear previous content

    snapshot.forEach((doc) => {
      console.log("Processing order document:", doc.id);
      const order = doc.data();
      console.log("Order data:", order);
      
      let dateStr = "Date not available";
      
      if (order.timestamp?.toDate) {
        // If timestamp is a Firestore Timestamp object
        const dateObj = order.timestamp.toDate();
        dateStr = dateObj.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
      } else if (order.timestamp?.seconds) {
        // If timestamp has seconds property
        const dateObj = new Date(order.timestamp.seconds * 1000);
        dateStr = dateObj.toLocaleDateString("en-GB", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric"
        });
      }

      const orderGroup = document.createElement("section");
      orderGroup.className = "order-group";

      const dateLabel = document.createElement("div");
      dateLabel.className = "order-date";
      dateLabel.textContent = `Ordered ${dateStr}`;

      const itemContainer = document.createElement("div");
      itemContainer.className = "order-items";

      if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
          console.log(`Processing item ${index}:`, item);
          const itemCard = document.createElement("div");
          itemCard.className = "order-item";
          itemCard.innerHTML = `
            <img src="${item.imageUrl || 'https://via.placeholder.com/150'}" alt="${item.name || 'Unnamed item'}" />
            <p>${item.name || 'Unnamed item'}</p>
            <p>Qty: ${item.quantity || 1}</p>
            <p>R${item.price || 0}</p>
          `;
          itemContainer.appendChild(itemCard);
        });
      } else {
        console.log("No items found in order");
        itemContainer.innerHTML = "<p>No items in this order</p>";
      }

      orderGroup.appendChild(dateLabel);
      orderGroup.appendChild(itemContainer);
      ordersContainer.appendChild(orderGroup);
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    ordersContainer.innerHTML = `
      <p style='text-align:center;color:red;'>
        Error loading orders. Please try again later.
      </p>
      <p style='text-align:center;font-size:0.8rem;'>
        ${error.message || 'Unknown error'}
      </p>
    `;
  }
});
