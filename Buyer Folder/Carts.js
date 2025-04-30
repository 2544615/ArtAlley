  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs,deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
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
    console.log(product);
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
      if (existingItem.quantity + 1 > product.quantity) {
        return alert(`Only ${product.quantity} item(s) in stock.`);
      }
      await updateDoc(docRef, {
        quantity: existingItem.quantity + 1
      });
    } else {
        if (product.quantity < 1) {
            return alert("This product is out of stock.");
        }

      await addDoc(itemsRef, {
        name: product.name,
        price: product.price,
        quantity: 1,
        user: userId,
        imageUrl: product.imageUrls[0], // First Cloudinary URL
        stock: product.quantity
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
  <figure>
    <img src="${imageUrl}" alt="${item.name}">
  </figure>
    <h3>${item.name}</h3>
    <p><button class="remove-button" aria-label="Remove ${item.name} from cart">Remove</button></p>
  <nav class="quantity-control" aria-label="Quantity control for ${item.name}" data-name="${item.name}" data-stock="${item.stock}">
    <button class="decreaseQuantity" aria-label="Decrease quantity">−</button>
    <p class="quantity">${item.quantity}</p>
    <button class="increaseQuantity" aria-label="Increase quantity">+</button>
  </nav>
  <aside>
    <p>R${itemTotal.toFixed(2)}</p>
  </aside>
`;

      cartSection.appendChild(cartItem);
     });
  
    const totalElement = document.createElement("p");
    totalElement.innerHTML = `<strong>Total: R${total.toFixed(2)}</strong>`;
    cartSection.appendChild(totalElement);
  }

console.log(cart);
  document.addEventListener("click", async function (e) {
    const isIncrease = e.target.classList.contains("increaseQuantity");
    const isDecrease = e.target.classList.contains("decreaseQuantity");
    const isRemove = e.target.classList.contains("remove-button");
  
    if (!isIncrease && !isDecrease && !isRemove) return;
    const quantityContainer = e.target.closest(".quantity-control");
    const quantitySpan = quantityContainer.querySelector(".quantity");
    const name = quantityContainer.dataset.name;
    const stock = parseInt(quantityContainer.dataset.stock);
    let currentQuantity = parseInt(quantitySpan.textContent);
    console.log(stock);
  
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");
    const cartRef = doc(db, "users", user.uid, "cart", "active");
    const itemsRef = collection(cartRef, "items");
  

    const q = query(itemsRef, where("name", "==", name));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const docRef = snapshot.docs[0].ref;
  
    // Increase
    if (isIncrease && currentQuantity < stock) {
        console.log("increase in pressed");
      await updateDoc(docRef, { quantity: currentQuantity + 1 })
    }else if(isIncrease && currentQuantity >= stock){
        return alert(`Cannot exceed available stock quantity for ${name}`);
    }
  
    // Decrease
    if (isDecrease) {
        console.log("decrease is pressed");
      if (currentQuantity > 1) {
        await updateDoc(docRef, { quantity: currentQuantity - 1 });
      } else {
        const confirmRemove = confirm("Remove item from cart?");
        if (confirmRemove) await deleteDoc(docRef);
      }
    }
    // if(isRemove){
    //     const confirmRemove = confirm("Are you sure you want to delete item from cart?");
    //     if (confirmRemove) await deleteDoc(docRef);
    // }
  
    await loadCartFromFirestore(); // ← Reload and re-render
  });
  

  document.getElementById("cartButton").addEventListener("click", () => {
    window.location.href = "cart.html";
  });
  
  document.getElementById("profileButton").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid); // Assuming your user profiles are stored in a "users" collection
        const querySnapshot = await getDoc(userDocRef);
        //let userData = null;
  
        if (!querySnapshot.exists()) {
          // No profile found — redirect to profile.html
          window.location.href = "../SignUp Folder/buyer-profile.html";
          return;
        }
  
        const userData = querySnapshot.data();
  
        // Check if any important field is missing
        const requiredFields = ["firstName","lastName", "email", "phone", "address", "username"]; // Adjust these fields based on your profile structure
        const hasEmptyField = requiredFields.some(field => {
          return !userData[field] ||  (typeof userData[field] === 'string' && userData[field].trim() === "");
        });
  
        if (hasEmptyField) {
          window.location.href = "../SignUp Folder/buyer-profile.html"; // Go to profile completion page
        } else {
          window.location.href = "../SignIn Folder/my-profile.html"; // Profile is complete
        }
        
      } catch (error) {
        console.error("Error checking profile:", error);
        alert("Error loading your profile. Try again.");
      }
    } else {
      window.location.href = "../SignIn Folder/login-buyer.html"; // Just in case user is not authenticated
    }
  });