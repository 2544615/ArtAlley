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
  
  const ship = document.getElementById('form2');

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in first.");
    window.location.href = "../SignIn Folder/login-buyer.html";
    return;
  }

  // Check user role
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
      window.location.href = "../index.html";
      return;
    }

    // ✅ Load Cart Items
    const cartItemsRef = collection(db, "users", user.uid, "cart", "active", "items");
    const snapshot = await getDocs(cartItemsRef);

    const cartItemsSection = document.getElementById("cart-items");
    let total = 0;

    if (snapshot.empty) {
      cartItemsSection.innerHTML = "<p>Your cart is empty.</p>";
    } else {
      cartItemsSection.innerHTML = "";

      snapshot.forEach(doc => {
        const item = doc.data();
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const itemSummary = document.createElement("section");
        itemSummary.classList.add("summary-item");
        itemSummary.innerHTML = `
          <p>${item.quantity}x ${item.name}</p>
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
    }

    // ✅ Submit Form
    //const ship = document.getElementById('form2');
    ship.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = document.getElementById('firstname').value;
      const cellphone = parseInt(document.getElementById('contact').value);
      const email = document.getElementById('email').value;
      const street = document.getElementById('address').value;
      const complex = document.getElementById('complex').value;
      const suburb = document.getElementById('suburb').value;
      const city = document.getElementById('city').value;
      const postalcode = parseInt(document.getElementById('code').value);
      const province = document.getElementById('province').value;
      const note = document.getElementById('note').value;

      try {
        await addDoc(collection(db, "users", user.uid, "delivery"), {
          name, complex, province, city, street,
          email, cellphone, note, suburb,postalcode,
          buyeruid: user.uid,
          timestamp: serverTimestamp()
        });

        localStorage.setItem("shippingName", name);
        localStorage.setItem("cartTotal", total.toFixed(2));
        localStorage.setItem("contact", cellphone);
        localStorage.setItem("checkoutEmail", email);
        localStorage.setItem("shippingCity", city);
        localStorage.setItem("shippingStreet", street);
        localStorage.setItem("shippingComplex", complex);
        localStorage.setItem("shippingSuburb", suburb);
        localStorage.setItem("shippingProvince", province);
        localStorage.setItem("shippingPostalCode", postalcode);
        localStorage.setItem("shippingCountry", "South Africa");


        window.location.href = "paystack.html";
      } catch (error) {
        console.error("Error uploading delivery info:", error);
        alert("Failed to add delivery info.");
      }
    });

  } catch (error) {
    console.error("Error checking user role:", error);
    alert("Error verifying user role.");
  }
});


const provinces = [
  "Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal",
  "Limpopo", "Mpumalanga", "North West", "Northern Cape", "Western Cape"
];

document.addEventListener("DOMContentLoaded", () => {
  const province = document.getElementById("province");
  province.innerHTML = '<option value="">Select your province</option>';
  provinces.sort().forEach(prov => {
    const option = document.createElement("option");
    option.value = prov;
    option.textContent = prov;
    province.appendChild(option);
  });
});
