import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {writeBatch, updateDoc, getFirestore, doc, collection, getDocs, setDoc, serverTimestamp, getDoc, increment, addDoc} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase config
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
const auth = getAuth();
const db = getFirestore(app);

    document.addEventListener("DOMContentLoaded", () => {
    const emailInput = document.getElementById("email-address");
    const amountInput = document.getElementById("amount");

    const savedEmail = localStorage.getItem("checkoutEmail");
    const savedAmount = localStorage.getItem("cartTotal"); // 👈 get cart total

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

            onAuthStateChanged(auth, async (user) => {
              try{
                if (user) {
                  
                  const cartRef = doc(db, "users", user.uid, "cart", "active");
                  const itemsRef = collection(cartRef, "items");
                  const cartSnapshot = await getDocs(itemsRef);
                
                  const items = [];
                  cartSnapshot.forEach(doc => {
                    const data = doc.data();
                    items.push({
                      productId: data.productId,
                      name: data.name,
                      imageUrl: data.imageUrl || "",
                      price: data.price,
                      quantity: data.quantity,
                      sellerId: data.sellerId
                    });
                  });

                  // Get shipping info from localStorage
                  let shippingData = {};

                  if (localStorage.getItem("shippingFirstName")) {
                    // Case 1: From checkout.js
                    shippingData = {
                      firstname: localStorage.getItem("shippingFirstName"),
                      lastname: localStorage.getItem("shippingLastName"),
                      email: localStorage.getItem("checkoutEmail"),
                      phone: localStorage.getItem("contact"),
                      address: localStorage.getItem("shippingAddress"),
                      city: localStorage.getItem("shippingCity"),
                      country: localStorage.getItem("shippingCountry")
                    };
                  } else if (localStorage.getItem("shippingStreet")) {
                    // Case 2: From checkoutdelivery.js
                    shippingData = {
                      name: localStorage.getItem("shippingName"),
                      email: localStorage.getItem("checkoutEmail"),
                      phone: localStorage.getItem("contact"),
                      street: localStorage.getItem("shippingStreet"),
                      complex: localStorage.getItem("shippingComplex") || "N/A",
                      suburb: localStorage.getItem("shippingSuburb"),
                      city: localStorage.getItem("shippingCity"),
                      province: localStorage.getItem("shippingProvince"),
                      postalcode: localStorage.getItem("shippingPostalCode"),
                      country: localStorage.getItem("shippingCountry") || "South Africa"
                    };
                  } else {
                    // Fallback if nothing is available
                    shippingData = {
                      email: user.email,
                      address: "36 Rssik street Marshalltown",
                      city: "Johannesburg",
                      country: "South Africa"
                    };
                  }
                  
                  const amount = localStorage.getItem("cartTotal");
                
                
                  await addDoc(collection(db, "orders"), {
                  userId: user.uid,
                  amount: amount,
                  status: "pending",  // initial status for tracking
                  shipping: shippingData,
                  items: items,
                  ref: response.reference,
                  timestamp: serverTimestamp()
                });
                
                  console.log("✅ Order saved to Firestore with shipping and status");  


                  await finalizeOrder(user.uid, db);

                  // 2. Then remove the items from the cart
                  await removeItemsFromCart(user);

                  localStorage.removeItem("shippingFirstName");
                  localStorage.removeItem("shippingLastName");
                  localStorage.removeItem("shippingAddress");
                  localStorage.removeItem("shippingCity");
                  localStorage.removeItem("shippingCountry");
                  localStorage.removeItem("shippingName");
                  localStorage.removeItem("shippingStreet");
                  localStorage.removeItem("shippingSuburb");
                  localStorage.removeItem("shippingProvince");
                  localStorage.removeItem("shippingPostalCode");
                  localStorage.removeItem("checkoutEmail");
                  localStorage.removeItem("cartTotal");


                  window.location.href = "product-listing.html";
                } else {
                alert("⚠️ User not authenticated.");
                }
              } catch (error) {
                console.error("❌ Error finalizing order:", error);
                alert("❌ There was a problem finalizing your order. Please try again.");
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

    async function finalizeOrder(userId, db) {
  try {
    console.log("🛠 Finalizing order for:", userId); 


    const itemsRef = collection(db, "users", userId, "cart", "active", "items");
    const cartSnapshot = await getDocs(itemsRef);

    if (cartSnapshot.empty) {
      console.log("Cart is empty. Nothing to finalize.");
      return;
    }

    for (const cartDoc of cartSnapshot.docs) {
      const cartItem = cartDoc.data();
      const { productId, quantity, price } = cartItem;

      console.log("📦 Cart item:", cartItem); 

      if (!productId || !quantity || !price) {
        console.warn("Cart item missing productId, quantity, or price:", cartItem);
        continue;
      }

      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        console.warn(`Product ${productId} not found.`);
        continue;
      }

      const productData = productSnap.data();
      const sellerUID = productData.sellerUID;

      if (!sellerUID) {
        console.warn(`Product ${productId} missing sellerUID.`);
        continue;
      }

      console.log("⬇️ Decreasing stock for product:", productId, "by", quantity);  

      // Decrease product quantity
      await updateDoc(productRef, {
        quantity: increment(-Number(quantity))
      });
      console.log("📝 Recording sale for seller:", sellerUID);  

      // Record sale for seller
      const saleRef = doc(collection(db, "sellers", sellerUID, "sales"));
      await setDoc(saleRef, {
        productId,
        buyerId: userId,
        quantity,
        price,
        timestamp: serverTimestamp()
      });

      console.log("✅ Successfully updated stock and recorded sale for product:", productId);
    }

    console.log("✅ Stock updated and sales recorded.");
  } catch (error) {
    console.error("Error inside finalizeOrder:", error);
    throw error;  // rethrow to propagate error up
  }
}
