import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { addToCart } from './Carts.js';  // Adjust path as needed

const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.firebasestorage.app",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

function createProductDetailHTML(product) {
  // Create thumbnails HTML
  const thumbnails = product.imageUrls.map((url, index) => 
    `<img src="${url}" alt="Thumbnail ${index + 1}" class="thumbnail" data-index="${index}">`
  ).join("");

  return `
    <section id="imageGalleryWrapper">
      <section id="thumbnailColumn" aria-label="Thumbnails">
        ${thumbnails}
      </section>
      <section id="mainImageContainer">
        <img id="mainImage" src="${product.imageUrls[0]}" alt="${product.name}" />
      </section>
    </section>

    <article>
      <header>
        <h2 id="productName">${product.name}</h2>
        <p id="productPrice">Price: R${product.price.toFixed(2)}</p>
      </header>

      <section>
        <p id="productDescription">${product.description || "No description available."}</p>
      </section>

      <footer class="add-to-cart-footer">
        <button id="addToCartBtn" type="button">Add to Cart</button>
      </footer>
    </article>
  `;
}

function setupThumbnailClicks(product) {
  const thumbnails = document.querySelectorAll("#thumbnailColumn .thumbnail");
  const mainImage = document.getElementById("mainImage");

  thumbnails.forEach(thumb => {
    thumb.addEventListener("click", () => {
      mainImage.src = thumb.src;
    });
  });
}

function setupAddToCart(product) {
  const btn = document.getElementById("addToCartBtn");
  btn.addEventListener("click", () => {
    addToCart(product);
    alert(`${product.name} added to cart`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Please log in to view product details.");
      window.location.href = "login-buyer.html";
      return;
    }

    const productId = localStorage.getItem("selectedProductId");
    if (!productId) {
      alert("No product selected.");
      window.location.href = "product-listing.html";
      return;
    }

    const goBack = document.getElementById("goBack");
    if (goBack) {
      goBack.addEventListener("click", function () {
         window.location.href = "product-listing.html";
      });
    }

    try {
      const productRef = doc(db, "products", productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        alert("Product not found.");
        return;
      }

      const product = { id: productSnap.id, ...productSnap.data() };

      const container = document.getElementById("productContainer");
      container.innerHTML = createProductDetailHTML(product);

      setupThumbnailClicks(product);
      setupAddToCart(product);

    } catch (error) {
      console.error("Error loading product:", error);
      alert("Failed to load product details.");
    }
  });
});
