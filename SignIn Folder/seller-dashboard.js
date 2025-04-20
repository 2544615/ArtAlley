import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

const productList = document.getElementById("product-list");
const noProductsText = document.getElementById("no-products");
const addProductBtn = document.getElementById("add-product-btn");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const sellerUID = user.uid;

    const q = query(collection(db, "products"), where("sellerUID", "==", sellerUID));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      noProductsText.hidden = false;
      productList.hidden = true;
    } else {
      noProductsText.hidden = true;
      productList.hidden = false;

      querySnapshot.forEach((doc) => {
        const product = doc.data();

        const article = document.createElement("article");

        const h3 = document.createElement("h3");
        h3.textContent = product.name;

        const img = document.createElement("img");
        img.src = product.imageURL;
        img.width = 150;

        const price = document.createElement("p");
        price.textContent = `Price: $${product.price}`;

        const quantity = document.createElement("p");
        quantity.textContent = `Quantity: ${product.quantity}`;

        const desc = document.createElement("p");
        desc.textContent = product.description;

        article.appendChild(h3);
        article.appendChild(img);
        article.appendChild(price);
        article.appendChild(quantity);
        article.appendChild(desc);

        productList.appendChild(article);
      });
    }
  } else {
    window.location.href = "login-seller.html";
  }
});

addProductBtn.addEventListener("click", () => {
  window.location.href = "add-product.html";
});
