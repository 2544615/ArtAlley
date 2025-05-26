import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
  getFirestore, collection, getDocs, query, orderBy, doc, getDoc 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.appspot.com",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// DOM Elements
const ordersContainer = document.getElementById('ordersContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const sortOrder = document.getElementById('sortOrder');
const sortBtn = document.getElementById('sortBtn');
const signOutButton = document.getElementById('signOutButton');

let allOrders = [];
let currentSort = 'desc';

// Sign Out Handler
signOutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "admin-signin.html";
  } catch (error) {
    console.error("Sign-out error:", error);
    alert("Failed to sign out.");
  }
});

function displayOrders(orders) {
  ordersContainer.innerHTML = "";

  if (orders.length === 0) {
    showMessage("No orders found.");
    return;
  }

  orders.forEach(order => {
    const orderCard = document.createElement("section");
    orderCard.className = "order-card";
    
    // Create product items list if they exist
    let productsHTML = '';
    if (order.items && order.items.length > 0) {
      productsHTML = '<section class="order-products">';
      order.items.forEach(item => {
        productsHTML += `
          <section class="order-product">
            <span class="product-name">${item.name || 'Unnamed Product'}</span>
            <span class="product-qty">${item.quantity || 1}x</span>
            <span class="product-price">R${item.price ? item.price.toFixed(2) : '0.00'}</span>
          </section>
        `;
      });
      productsHTML += '</section>';
    }

    orderCard.innerHTML = `
      <section class="order-header">
        <section class="order-id">Order #${order.id}</section>
        <section class="order-date">${order.date || 'No date'}</section>
      </section>
      
      <section class="order-buyer">
        <span class="buyer-label">Buyer:</span>
        <span class="buyer-info">${order.buyerName || 'Unknown Buyer'}</span>
      </section>
      
      ${productsHTML}
      
      <section class="order-footer">
        <section class="order-status">Status: ${order.status || 'Pending'}</section>
        <section class="order-total">Total: R${order.total ? order.total.toFixed(2) : '0.00'}</section>
      </section>
    `;
    ordersContainer.appendChild(orderCard);

    // Make the entire card clickable
    orderCard.addEventListener('click', (e) => {
      // Check if the click was on a specific element that has its own handler
      if (e.target.closest('.order-id') || e.target.closest('.buyer-info') || e.target.closest('.update-status-btn')) {
        return; // Let the specific handler deal with it
      }
      viewOrderDetails(order.id);
    });
  });
}

async function loadOrders(sortDirection = 'desc') {
  try {
    showLoading();
    
    const ordersRef = collection(db, "orders");
    const ordersQuery = query(ordersRef, orderBy("timestamp", sortDirection));
    const querySnapshot = await getDocs(ordersQuery);

    allOrders = [];
    
    for (const docSnap of querySnapshot.docs) {
      try {
        const orderData = docSnap.data();
        const orderId = docSnap.id;
        
        // Get buyer information
        let buyerInfo = 'Unknown Buyer';
        let buyerId = null;
        
        // Check for buyer ID in common field names
        const possibleBuyerIdFields = ['userId', 'buyerId', 'userUid', 'uid'];
        for (const field of possibleBuyerIdFields) {
          if (orderData[field]) {
            buyerId = orderData[field];
            break;
          }
        }

        if (buyerId) {
          const userRef = doc(db, "users", buyerId);
          const userSnap = await getDoc(userRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            // Get either username or email from user document
            buyerInfo = userData.username || userData.email || 'Registered Buyer';
          }
        }

        // Calculate total
        let orderTotal = 0;
        if (typeof orderData.total === 'number') {
          orderTotal = orderData.total;
        } else if (orderData.items && Array.isArray(orderData.items)) {
          orderTotal = orderData.items.reduce((sum, item) => {
            return sum + ((item.price || 0) * (item.quantity || 1));
          }, 0);
        }

        // Prepare order object
        const order = {
          id: orderId,
          ...orderData,
          buyerId: buyerId,
          buyerInfo: buyerInfo,
          total: orderTotal,
          date: orderData.timestamp?.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          status: orderData.status || 'Pending'
        };

        allOrders.push(order);
      } catch (error) {
        console.error(`Error processing order ${docSnap.id}:`, error);
      }
    }

    displayOrders(allOrders);
    hideLoading();
    
  } catch (error) {
    console.error("Error loading orders:", error);
    showError(`Failed to load orders: ${error.message}`);
    hideLoading();
  }
}

// Search Functionality (updated to only search order ID and buyer)
searchBtn.addEventListener("click", () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  
  if (!searchTerm) {
    displayOrders(allOrders);
    return;
  }

  const filteredOrders = allOrders.filter(order =>
    (order.id && order.id.toLowerCase().includes(searchTerm)) ||
    (order.buyerName && order.buyerName.toLowerCase().includes(searchTerm))
  );

  displayOrders(filteredOrders);
});

// Sort Functionality remains the same
sortBtn.addEventListener("click", () => {
  currentSort = sortOrder.value;
  loadOrders(currentSort);
});

// View Order Details (placeholder)
function viewOrderDetails(orderId) {
  console.log("Viewing order:", orderId);
  window.location.href = `order-details.html?id=${orderId}`;
}

// Loading state functions
function showLoading() {
  document.getElementById('loadingIndicator').style.display = 'block';
  document.getElementById('errorMessage').style.display = 'none';
}

function hideLoading() {
  document.getElementById('loadingIndicator').style.display = 'none';
}

function showMessage(message) {
  const messageElement = document.getElementById('errorMessage');
  messageElement.textContent = message;
  messageElement.style.display = 'block';
  messageElement.style.color = 'black';
}

function showError(message) {
  const errorElement = document.getElementById('errorMessage');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  errorElement.style.color = 'red';
}

// Authentication Check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../SignIn Folder/login-admin.html";
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().role !== "admin") {
      alert("Access denied. Admins only.");
      window.location.href = "../index.html";
      return;
    }

    loadOrders();
  } catch (error) {
    console.error("Authentication error:", error);
    showError(`Failed to verify admin status: ${error.message}`);
  }
});