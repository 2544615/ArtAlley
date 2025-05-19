import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { addToCart } from './Carts.js';

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

const productId = localStorage.getItem("selectedProductId");

async function loadProductDetails() {
  if (!productId) {
    alert("No product selected.");
    return;
  }

  try {
    const docRef = doc(db, "products", productId);
    const docSnap = await getDoc(docRef);

    console.log("docSnap.exists():", docSnap.exists());

    if (!docSnap.exists()) {
      alert("Product not found.");
      return;
    }

    const product = docSnap.data();
    console.log("Product data:", product);

    document.getElementById("productName").textContent = product.name;
    document.getElementById("productPrice").textContent = `Price: R${product.price.toFixed(2)}`;
    document.getElementById("productDescription").textContent = product.description || "No description available.";

    const thumbnailColumn = document.getElementById("thumbnailColumn");
    const mainImage = document.getElementById("mainImage");

    thumbnailColumn.innerHTML = "";

    if (product.imageUrls && product.imageUrls.length > 0) {
      mainImage.src = product.imageUrls[0];
      mainImage.alt = product.name;

      product.imageUrls.forEach((url, index) => {
        const thumb = document.createElement("img");
        thumb.src = url;
        thumb.alt = `Thumbnail ${index + 1}`;
        if (index === 0) thumb.classList.add("selected");

        thumb.addEventListener("click", () => {
          mainImage.src = url;
          document.querySelectorAll("#thumbnailColumn img").forEach(img => img.classList.remove("selected"));
          thumb.classList.add("selected");
        });

        thumbnailColumn.appendChild(thumb);
      });
    }

    document.getElementById("addToCartBtn").addEventListener("click", () => {
      addToCart(product);
      alert(`${product.name} added to cart.`);
    });

  } catch (error) {
    console.error("Error loading product:", error);
    alert("Failed to load product details.");
  }
}

// Authenticate before loading product
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User signed in:", user.uid);
      loadProductDetails();
    } else {
      signInAnonymously(auth)
        .then(() => {
          console.log("Signed in anonymously.");
          // `onAuthStateChanged` will re-trigger and call `loadProductDetails()`
        })
        .catch((error) => {
          console.error("Anonymous sign-in failed:", error);
          alert("You must be signed in to view product details.");
        });
    }
  });
});
