import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { writeBatch, getFirestore, doc, collection, getDocs, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
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

  if (savedEmail) emailInput.value = savedEmail;
  if (savedAmount) amountInput.value = savedAmount;
});

// Restrict card holder input to letters and spaces
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

    callback: async function (response) {
      alert('✅ Payment successful!\nReference: ' + response.reference);

      onAuthStateChanged(auth, async (user) => {
        if (!user) {
          alert("⚠️ User not authenticated.");
          return;
        }

        try {
          // ✅ Fetch cart items
          const cartRef = doc(db, "users", user.uid, "cart", "active");
          const itemsRef = collection(cartRef, "items");
          const cartSnapshot = await getDocs(itemsRef);

          const items = [];
          cartSnapshot.forEach(doc => {
            const data = doc.data();
            items.push({
              name: data.name,
              imageUrl: data.imageUrl || "",
              price: data.price,
              quantity: data.quantity
            });
          });

          // ✅ Save to 'orders' collection
          await addDoc(collection(db, "orders"), {
            userId: user.uid,
            timestamp: serverTimestamp(),
            items: items
          });

          console.log("✅ Order saved to Firestore");

          // ✅ Remove items from cart
          await removeItemsFromCart(user);

          // ✅ Redirect
          window.location.href = "product-listing.html";

        } catch (error) {
          console.error("❌ Error saving order:", error);
          alert("There was a problem saving your order. Please contact support.");
        }
      });
    },

    onClose: function () {
      alert('❌ Payment window closed.');
    }
  });

  handler.openIframe();
}

// Remove cart items after successful payment
async function removeItemsFromCart(user) {
  const cartRef = doc(db, "users", user.uid, "cart", "active");
  const itemsRef = collection(cartRef, "items");

  const cartSnapshot = await getDocs(itemsRef);

  if (cartSnapshot.empty) {
    console.log("Cart is empty. No items to remove.");
    return;
  }

  const batch = writeBatch(db);
  cartSnapshot.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log("🧹 Cart cleared.");
}
