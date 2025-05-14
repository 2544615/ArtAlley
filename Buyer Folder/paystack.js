import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {writeBatch, getFirestore, doc, collection, getDocs} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.appspot.com",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// Restore input values from localStorage
    
    document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email-address");
    const amountInput = document.getElementById("amount");

    const savedEmail = localStorage.getItem("checkoutEmail");
    const savedAmount = localStorage.getItem("checkoutAmount");

    if (savedEmail) {
        emailInput.value = savedEmail;
    }

    if (savedAmount) {
        amountInput.value = savedAmount;
    }
    });

    document.getElementById('cardHolder').addEventListener('input', e => {
      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
    });

    const paymentForm = document.getElementById('paymentForm');
    paymentForm.addEventListener("submit", payWithPaystack, false);

    function payWithPaystack(e) {
      e.preventDefault();

      let handler = PaystackPop.setup({
        key: 'pk_test_959f6d667e0fe43328197575f6bbd632b9a5df01',
        email: document.getElementById("email-address").value,
        amount: document.getElementById("amount").value * 100,
        currency: 'ZAR',
        ref: 'TX_' + Math.floor(Math.random() * 1000000000 + 1),
        callback: function(response) {
          alert('✅ Payment successful!\nReference: ' + response.reference);
          // TODO: Call backend endpoint to verify the payment using this reference
          // Remove cart items and redirect after success
            onAuthStateChanged(auth, async (user) => {
                if (user) {
                await removeItemsFromCart(user);
                window.location.href = "checkout.html";
                } else {
                alert("⚠️ User not authenticated.");
                }
            });
        },
        onClose: function() {
          alert('❌ Payment window closed.');
        }
      });

      handler.openIframe();
    }

    // Function to remove items from cart in Firestore
    async function removeItemsFromCart(user) {
      const cartRef = doc(db, "users", user.uid, "cart", "active");
      const itemsRef = collection(cartRef, "items");
    
      // Step 1: Get all items in the cart
      const cartSnapshot = await getDocs(itemsRef);
      
      if (cartSnapshot.empty) {
        console.log("Cart is empty. No items to remove.");
        return;
      }
    
      // Step 2: Create a batch to delete all items in one atomic operation
      const batch = writeBatch(db); // Write batch for atomic operations
      
      // Step 3: Loop through each document in the cart and delete it
      cartSnapshot.forEach(doc => {
        batch.delete(doc.ref); // Delete each item document
      });
    
      // Step 4: Commit the batch operation
      await batch.commit();
      console.log("Items successfully removed from the cart.");
    }