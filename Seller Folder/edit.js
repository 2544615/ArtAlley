import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.appspot.com", // Corrected the domain
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const cloudName = "dw0ukiusn";
const uploadPreset = "ArtAlley";

async function uploadToCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  if (data.secure_url) {
    return data.secure_url;
  } else {
    throw new Error("Image upload failed.");
  }
}

const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");
const form = document.getElementById("form");

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Please log in first.");
    window.location.href = "../SignIn Folder/login-seller.html";
    return;
  }

  const productRef = doc(db, "products", productId);
  const productSnap = await getDoc(productRef);

  if (!productSnap.exists()) {
    alert("Product not found.");
    return;
  }

  const product = productSnap.data();

  // Pre-fill the form
  document.getElementById("ProductName").value = product.name;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productQuantity").value = product.quantity;
  document.getElementById("productDescription").value = product.description;
  
  if(product.imageUrls && product.imageUrls.length>0){
    document.getElementById("productImage").src=product.imageUrls[0];
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedData = {
      name: document.getElementById("ProductName").value,
      price: parseFloat(document.getElementById("productPrice").value),
      quantity: parseInt(document.getElementById("productQuantity").value),
      description: document.getElementById("productDescription").value,
      timestamp: serverTimestamp()
    };

    const imageFile = document.getElementById("productImage").files[0];

    if (imageFile) {
      try {
        const newImageUrl = await uploadToCloudinary(imageFile);
        updatedData.imageUrls = [newImageUrl]; // replace with new image
      } catch (error) {
        alert("Image upload failed.");
        return;
      }
    }else{
      if(product.imageUrls && product.imageUrls.length>0){
        updatedData.imageUrls=product.imageUrls;
      }
    }

    try {
      await updateDoc(productRef, updatedData);
      alert("Product updated successfully!");
      window.location.href = "../SignIn Folder/seller-dashboard.html";
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update product.");
    }
  });
});
