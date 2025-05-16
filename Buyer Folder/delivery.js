import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs,deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
    authDomain: "artalley-b9c96.firebaseapp.com",
    projectId: "artalley-b9c96",
    storageBucket: "artalley-b9c96.firebasestorage.app",
    messagingSenderId: "1056868925602",
    appId: "1:1056868925602:web:4fa9734632b255594917fb"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const auth = getAuth(app);



  const delivery = document.getElementById("deliver");
  const collect = document.getElementById("collect1");
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in first.");
    window.location.href = "../SignIn Folder/login-buyer.html";
    return;
  }

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      alert("User data not found.");
      return;
    }

    const userData = userDoc.data();

    if (userData.role !== "buyer") {
      alert("Access denied. Only buyers can perform this action.");
      window.location.href = "../index.html"; // or redirect to another appropriate page
      return;
    }

    // ✅ The user is a buyer — allow the action
    delivery.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        await addDoc(collection(db, "deliveryoption"), {
          option: "Delivery",
          buyeruid: user.uid,
          timestamp: serverTimestamp()
        });

        window.location.href = "checkoutdelivery.html";

      } catch (error) {
        console.error("Error uploading delivery option:", error);
        alert("Failed to add delivery option.");
      }
    });
    collect.addEventListener("click", async (e) => {
      e.preventDefault();

      try {
        await addDoc(collection(db, "deliveryoption"), {
          option: "Collection",
          buyeruid: user.uid,
          timestamp: serverTimestamp()
        });

        window.location.href = "paystack.html";

      } catch (error) {
        console.error("Error uploading delivery option:", error);
        alert("Failed to add delivery option.");
      }
    });

  } catch (error) {
    console.error("Error checking user role:", error);
    alert("Error verifying user role.");
  }
});

    onAuthStateChanged(auth, async (user) => {
        if (!user) {
          alert("Please log in first.");
          window.location.href = "login.html";
          return;
        }
      
        const cartItemsRef = collection(db, "users", user.uid, "cart", "active", "items");
      const snapshot = await getDocs(cartItemsRef);
    
      const cartItemsSection = document.getElementById("cart-items");
       let total = 0;
    
      if (snapshot.empty) {
        cartItemsSection.innerHTML = "<p>Your cart is empty.</p>";
        return;
      }
    
      cartItemsSection.innerHTML = ""; // Clear existing content
    
      snapshot.forEach(doc => {
        const item = doc.data();
        const subtotal = item.price * item.quantity;
        total += subtotal;
    
        const itemSummary = document.createElement("section");
        itemSummary.classList.add("summary-item");
    
        itemSummary.innerHTML = `
          <p id>  ${item.quantity}x ${item.name} </p>
          <p>R${subtotal.toFixed(2)}</p>
        `;
    
        cartItemsSection.appendChild(itemSummary);
      });
    
      const totalSection = document.createElement("section");
    totalSection.style.display = "flex";
    totalSection.style.justifyContent = "space-between";
    totalSection.style.alignItems = "center";
    totalSection.style.marginTop = "1rem";
    totalSection.style.paddingTop = "0.5rem";
    totalSection.style.borderTop = "2px solid #000";
    
    totalSection.innerHTML = `
      <h4 style="margin: 0;">Total</h4>
      <p style="margin: 0; font-weight: bold;">R${total.toFixed(2)}</p>
    `;
    
    cartItemsSection.appendChild(totalSection);
    
    });
  