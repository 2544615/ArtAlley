import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
  getFirestore, doc, getDoc, updateDoc 
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
const orderIdElement = document.getElementById('orderId');
const orderDateElement = document.getElementById('orderDate');
const orderStatusElement = document.getElementById('orderStatus');
const buyerDetailsElement = document.getElementById('buyerDetails');
const itemsListElement = document.getElementById('itemsList');
const subtotalElement = document.getElementById('subtotal');
const totalElement = document.getElementById('total');
const statusSelect = document.getElementById('statusSelect');
const updateStatusBtn = document.getElementById('updateStatusBtn');
const signOutButton = document.getElementById('signOutButton');

// Get order ID from URL parameters
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('id');

async function loadOrderData() {
  if (!orderId) {
    showError("No order ID provided in URL");
    setTimeout(() => {
      window.location.href = "admin-orders.html";
    }, 2000);
    return;
  }

  try {
    console.log("Loading order with ID:", orderId);
    
    // Fetch order document from Firestore using the order ID as unique identifier
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      showError("Order not found in database");
      setTimeout(() => {
        window.location.href = "admin-orders.html";
      }, 3000);
      return;
    }

    const orderData = orderSnap.data();
    console.log("Order data loaded:", orderData);
    
    displayOrderDetails(orderData);
  } catch (error) {
    console.error("Error loading order:", error);
    showError("Failed to load order details: " + error.message);
  }
}

function displayOrderDetails(orderData) {
  try {
    // Display basic order info
    orderIdElement.textContent = orderId;
    
    // Handle date display
    let dateString = 'Unknown date';
    if (orderData.timestamp) {
      if (orderData.timestamp.toDate) {
        // Firestore timestamp
        dateString = orderData.timestamp.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (orderData.timestamp instanceof Date) {
        dateString = orderData.timestamp.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric', 
          hour: '2-digit',
          minute: '2-digit'
        });
      } else if (typeof orderData.timestamp === 'string') {
        dateString = new Date(orderData.timestamp).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit', 
          minute: '2-digit'
        });
      }
    } else if (orderData.createdAt) {
      if (orderData.createdAt.toDate) {
        dateString = orderData.createdAt.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    }
    orderDateElement.textContent = dateString;

    // Update status display
    const status = orderData.status || 'pending';
    updateStatusDisplay(status);

    // Display buyer information (User ID only)
    displayBuyerInfo(orderData.userId);

    // Display order items with all required details
    displayOrderItems(orderData.items || []);

    // Calculate and display totals
    calculateTotals(orderData);
    
  } catch (error) {
    console.error("Error displaying order details:", error);
    showError("Error displaying order information");
  }
}

async function displayBuyerInfo(buyerId) {
  if (!buyerId) {
    buyerDetailsElement.innerHTML = '<div>No buyer information available</div>';
    return;
  }

  try {
    const userRef = doc(db, 'users', buyerId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const buyerName = userData.username || userData.email || 'Unknown Buyer';

      buyerDetailsElement.innerHTML = `
        <div class="buyer-details">
          <strong>Buyer:</strong> ${buyerName}
        </div>
      `;
    } else {
      buyerDetailsElement.innerHTML = '<div>Buyer account not found</div>';
    }
  } catch (error) {
    console.error("Error fetching buyer info:", error);
    buyerDetailsElement.innerHTML = '<div>Error loading buyer information</div>';
  }
}


async function displayOrderItems(items) {
  if (!items || items.length === 0) {
    itemsListElement.innerHTML = `
      <div class="no-items">
        <i class="fas fa-shopping-basket"></i>
        <span>No items found in this order</span>
      </div>
    `;
    return;
  }

  let itemsHTML = '';

  for (const item of items) {
    const imageUrl = item.imageUrl || 'https://via.placeholder.com/100x100?text=No+Image';
    const name = item.name || 'Unnamed Product';
    const price = parseFloat(item.price) || 0;
    const quantity = parseInt(item.quantity) || 1;
    const itemTotal = price * quantity;

    let sellerInfo = 'Unknown Seller';

    // Fetch seller info from users collection
    if (item.sellerId) {
      try {
        const sellerRef = doc(db, 'users', item.sellerId);
        const sellerSnap = await getDoc(sellerRef);

        if (sellerSnap.exists()) {
          const sellerData = sellerSnap.data();
          sellerInfo = sellerData.username || sellerData.email || 'Registered Seller';
        }
      } catch (error) {
        console.error('Error fetching seller info:', error);
      }
    }

    itemsHTML += `
      <div class="order-item">
        <div class="item-image-container">
          <img src="${imageUrl}" 
               alt="${name}" 
               class="item-image"
               onerror="this.src='https://via.placeholder.com/100x100?text=No+Image'">
        </div>
        <div class="item-details">
          <div class="item-name">${name}</div>
          <div class="item-pricing">
            <div class="price-info">
              <span class="unit-price">R${price.toFixed(2)} each</span>
              <span class="quantity">Qty: ${quantity}</span>
              <span class="item-total">Total: R${itemTotal.toFixed(2)}</span>
            </div>
          </div>
          <div class="seller-info">
            <span class="seller-label"><i class="fas fa-store"></i> Seller:</span>
            <span class="seller-id">${sellerInfo}</span>
          </div>
        </div>
      </div>
    `;
  }

  itemsListElement.innerHTML = itemsHTML;
}


function calculateTotals(orderData) {
  let subtotal = 0;
  let shipping = parseFloat(orderData.shippingCost) || 0;
  let tax = parseFloat(orderData.tax) || 0;

  // Calculate subtotal from items
  if (orderData.items && Array.isArray(orderData.items)) {
    subtotal = orderData.items.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return sum + (price * quantity);
    }, 0);
  }

  const total = subtotal + shipping + tax;

  // Update display
  subtotalElement.textContent = `R${subtotal.toFixed(2)}`;
  
  // Update shipping and tax if elements exist
  if (shippingElement) {
    shippingElement.textContent = `R${shipping.toFixed(2)}`;
  }
  if (taxElement) {
    taxElement.textContent = `R${tax.toFixed(2)}`;
  }
  if (totalElement) {
    totalElement.textContent = `R${total.toFixed(2)}`;
  }
}

function updateStatusDisplay(status) {
  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);
  orderStatusElement.textContent = formattedStatus;
  
  // Remove existing status classes and add new one
  orderStatusElement.className = 'status-badge';
  orderStatusElement.classList.add(status.toLowerCase().replace(/\s+/g, '-'));
  
  // Update select dropdown
  statusSelect.value = status;
}

async function updateOrderStatus() {
  const newStatus = statusSelect.value;
  if (!orderId || !newStatus) {
    showError("Missing order ID or status");
    return;
  }

  try {
    console.log("Updating order status to:", newStatus);
    
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      updatedAt: new Date()
    });
    
    updateStatusDisplay(newStatus);
    showMessage(`Order status successfully updated to "${newStatus}"`);
    
  } catch (error) {
    console.error('Error updating order status:', error);
    showError('Failed to update order status: ' + error.message);
  }
}

function showMessage(message, type = 'success') {
  const msg = document.createElement('div');
  msg.className = `message ${type}`;
  msg.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(msg);
  
  setTimeout(() => {
    msg.classList.add('fade-out');
    setTimeout(() => msg.remove(), 300);
  }, 3000);
}

function showError(message) {
  const err = document.createElement('div');
  err.className = 'message error';
  err.innerHTML = `
    <i class="fas fa-exclamation-circle"></i>
    <span>${message}</span>
  `;
  document.body.appendChild(err);
  
  setTimeout(() => {
    err.classList.add('fade-out');
    setTimeout(() => err.remove(), 300);
  }, 4000);
}

// Event Listeners
updateStatusBtn.addEventListener('click', updateOrderStatus);

signOutButton.addEventListener('click', () => {
  signOut(auth).then(() => {
    window.location.href = "admin-signin.html";
  }).catch((error) => {
    console.error("Sign out error:", error);
    showError("Failed to sign out");
  });
});

// Authentication state monitoring
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../SignIn Folder/login-admin.html";
    return;
  }

  // Verify admin role
  const userRef = doc(db, 'users', user.uid);
  getDoc(userRef).then((docSnap) => {
    if (!docSnap.exists()) {
      alert('User profile not found. Access denied.');
      signOut(auth);
      return;
    }
    
    const userData = docSnap.data();
    if (userData.role !== 'admin') {
      alert('Access denied. Administrator privileges required.');
      window.location.href = "../index.html";
      return;
    }
    
    // Load order data if user is authenticated admin
    loadOrderData();
  }).catch((error) => {
    console.error("Error checking user role:", error);
    showError("Authentication error");
  });
});