import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {getFirestore,doc,getDoc,updateDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.appspot.com",
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
const productImageInput = document.getElementById("productImage");
const previewContainer = document.getElementById("preview-images");
const currentImagesContainer = document.getElementById("CurrentImage");
const mainImageIndexInput = document.getElementById("mainImageIndex");

let selectedFiles = [];
let mainImageIndex = 0;
let originalImageUrls = [];
let isUsingNewImages = false;

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
  originalImageUrls = product.imageUrls || [];
  mainImageIndex = typeof product.mainImageIndex === "number" ? product.mainImageIndex : 0;

  // Pre-fill the form fields
  document.getElementById("ProductName").value = product.name;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productQuantity").value = product.quantity;
  document.getElementById("productDescription").value = product.description;

  // Render existing image previews
  function renderExistingImages() {
    currentImagesContainer.innerHTML = "";
    if (originalImageUrls.length > 0) {
      originalImageUrls.forEach((url, idx) => {
        const img = document.createElement("img");
        img.src = url;
        img.style.width = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";
        img.style.margin = "5px";
        img.style.border = idx === mainImageIndex ? "3px solid blue" : "1px solid #ccc";
        img.title = idx === mainImageIndex ? "Main image (click to change)" : "Click to set as main image";
        img.style.cursor = "pointer";
        
        img.addEventListener("click", () => {
          if (!isUsingNewImages) {
            mainImageIndex = idx;
            mainImageIndexInput.value = mainImageIndex;
            renderExistingImages();
          }
        });
        
        currentImagesContainer.appendChild(img);
      });
      mainImageIndexInput.value = mainImageIndex;
    }
  }

  renderExistingImages();

  // Handle new image input
  productImageInput.addEventListener("change", (e) => {
    selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      isUsingNewImages = true;
      previewContainer.innerHTML = "";
      currentImagesContainer.innerHTML = "";
      mainImageIndex = 0; 

      selectedFiles.forEach((file, idx) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = document.createElement("img");
          img.src = event.target.result;
          img.style.width = "100px";
          img.style.height = "100px";
          img.style.objectFit = "cover";
          img.style.margin = "5px";
          img.style.border = idx === mainImageIndex ? "3px solid blue" : "1px solid #ccc";
          img.title = idx === mainImageIndex ? "Main image (click to change)" : "Click to set as main image";
          img.style.cursor = "pointer";
          //for when the current image index matches the wrong selected main image index
          if (!isUsingNewImages) {
            mainImageIndex = idx;
            mainImageIndexInput.value = mainImageIndex;
            renderExistingImages(); 
          }          

          img.addEventListener("click", () => {
            mainImageIndex = idx;
            mainImageIndexInput.value = mainImageIndex;
            // Update highlighting for all preview images
            Array.from(previewContainer.children).forEach((child, i) => {
              child.style.border = i === mainImageIndex ? "3px solid blue" : "1px solid #ccc";
              child.title = i === mainImageIndex ? "Main image (click to change)" : "Click to set as main image";
            });
          });

          previewContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
      });

      mainImageIndexInput.value = mainImageIndex;
    } else {
      isUsingNewImages = false;
      renderExistingImages();
    }
  });

  // Form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updatedData = {
      name: document.getElementById("ProductName").value,
      price: parseFloat(document.getElementById("productPrice").value),
      quantity: parseInt(document.getElementById("productQuantity").value),
      description: document.getElementById("productDescription").value,
      timestamp: serverTimestamp(),
      mainImageIndex: parseInt(mainImageIndexInput.value)
    };

    try {
      if (isUsingNewImages && selectedFiles.length > 0) {
        // Upload new images
        const uploadPromises = selectedFiles.map(file => uploadToCloudinary(file));
        updatedData.imageUrls = await Promise.all(uploadPromises); 
        
      } else {
        // Keep existing images
        updatedData.imageUrls = originalImageUrls;
      }
      updatedData.mainImageUrl = updatedData.imageUrls[updatedData.mainImageIndex];
 
      
      await updateDoc(productRef, updatedData);
      alert("Product updated successfully!");
      window.location.href = "../SignIn Folder/seller-dashboard.html";
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update product: " + error.message);
    }
  });
});