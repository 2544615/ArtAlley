import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

// Show product detail in a modal or alert (simplified version)
function showProductDetails(product) {
    const detailWindow = window.open("", "_blank", "width=600,height=600");
    detailWindow.document.write(`<h1>${product.name}</h1>`);
    detailWindow.document.write(`<p>Price: R${product.price}</p>`);
    detailWindow.document.write(`<p>Quantity: ${product.quantity}</p>`);
    detailWindow.document.write(`<p>Description: ${product.description}</p>`);
  
    product.imageUrls.forEach((url) => {
      detailWindow.document.write(`<img src="${url}" width="200" style="margin:5px;">`);
    });
  }


// Function to delete a product
async function deleteProduct(productId) {
    try {
      await deleteDoc(doc(db, "products", productId));
      // Remove the product from the DOM
      document.getElementById(`product-${productId}`).remove();
      alert("Product deleted successfully.");
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  }


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
        const productId = doc.id;

        const article = document.createElement("article");
        article.id = `product-${productId}`;

        const h3 = document.createElement("h3");
        h3.textContent = product.name;

        const img = document.createElement("img");
        img.src = product.mainImageUrl;
        img.alt = product.name;
        img.width = 150;

        img.addEventListener("click", () => {
            showProductDetails(product); // You'll define this function
        });
        

        const price = document.createElement("p");
        price.textContent = `Price: R${product.price}`;

        const quantity = document.createElement("p");
        quantity.textContent = `Quantity: ${product.quantity}`;

        const desc = document.createElement("p");
        desc.textContent = product.description;

        // Delete Button
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.addEventListener("click", () => {
          if (confirm("Are you sure you want to delete this product?")) {
            deleteProduct(productId);
          }
        });


        article.appendChild(h3);
        article.appendChild(img);
        article.appendChild(price);
        article.appendChild(quantity);
        //article.appendChild(desc);
        article.appendChild(deleteBtn);

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
