  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
  import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
  

  const firebaseConfig = {
    apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
    authDomain: "artalley-b9c96.firebaseapp.com",
    projectId: "artalley-b9c96",
    storageBucket: "artalley-b9c96.firebasestorage.app",
    messagingSenderId: "1056868925602",
    appId: "1:1056868925602:web:4fa9734632b255594917fb"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth();
  const db = getFirestore(app);
  

  //adding the products to the cart list
const cart = [];

  export async function addToCart(product) {
    console.log('addToCart is called');
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");
  
    const userId = user.uid;
    const cartRef = doc(db, "users", userId, "cart", "active");
    const cartSnap = await getDoc(cartRef);
  
    if (!cartSnap.exists()) {
      await setDoc(cartRef, { total: 0 });
    }
  
    const itemsRef = collection(cartRef, "items");
  
    // Check if the product already exists in cart
    const q = query(itemsRef, where("name", "==", product.name));
    const snapshot = await getDocs(q);
  
    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      const existingItem = snapshot.docs[0].data();
      await updateDoc(docRef, {
        quantity: existingItem.quantity + 1
      });
    } else {
      await addDoc(itemsRef, {
        name: product.name,
        price: product.price,
        quantity: 1,
        imageUrl: product.imageUrls[0] // First Cloudinary URL
      });
    }
  
    updateCartUI(); // Call the UI updater
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadCartFromFirestore(user.uid);
      updateCartUI(); // update the DOM after loading
    } else {
      // Optional: Clear cart and redirect if user logs out
      cart = [];
      updateCartUI();
      alert("Please log in.");
      window.location.href = "login.html";
    }
  });
  
  async function loadCartFromFirestore() {
    const user = auth.currentUser;
    if (!user) return;
  
    const cartItemsRef = collection(db, "users", user.uid, "cart", "active", "items");
    const snapshot = await getDocs(cartItemsRef);
  
    cart.length = 0; // Clear current cart array
  
    snapshot.forEach(doc => {
      cart.push(doc.data());
    });
  
    updateCartUI();
  }
  

  function updateCartUI() {
    const cartSection = document.getElementById('CartProducts');
    if (!cartSection) {
      console.error('cart-products section not found in DOM');
      return;
    }
    cartSection.innerHTML = "";
  
    if (cart.length === 0) {
      cartSection.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }
  
    let total = 0;
  
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const imageUrl = item.imageUrl || "";
  
      const cartItem = document.createElement("article");
      cartItem.classList.add("cart-item");
      cartItem.innerHTML = `
      <article>
          <img src="${imageUrl}" alt="${item.name}">
          <h3>${item.name}</h3>
          <p>Quantity: ${item.quantity}</p>
          <p>Price: R${itemTotal.toFixed(2)}</p>
      </article>
      `;
      cartSection.appendChild(cartItem);
    });
  
    const totalElement = document.createElement("p");
    totalElement.innerHTML = `<strong>Total: R${total.toFixed(2)}</strong>`;
    cartSection.appendChild(totalElement);
  }
  