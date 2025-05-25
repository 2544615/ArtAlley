import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
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

const cloudName = "dw0ukiusn"; 
const uploadPreset = "ArtAlley";

async function uploadToCloudinary(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
  
    try {
        const response = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
            formData
        );

        console.log(response.data);

        if (response.data && response.data.secure_url) {
            return response.data.secure_url;  
        } else {
            throw new Error("Cloudinary did not return a valid URL.");
        }
    } catch (error) {
        console.error("Cloudinary upload failed:", error);
        alert("Image upload failed.");
        throw error; 
    }
  }

const form = document.getElementById('product-form');
const imageInput = document.getElementById("image");
const previewContainer = document.getElementById("preview-images");
const mainImageText = document.getElementById("select-main-text"); 
const mainImageIndexInput = document.getElementById("mainImageIndex");
const backBtn = document.getElementById("back-btn");

let selectedMainImageIndex = null;

imageInput.addEventListener("change", () => {
  previewContainer.innerHTML = ""; 
  const files = Array.from(imageInput.files);

  if (files.length > 0) {
    mainImageText.style.display = "block";
  }
  
  files.forEach((file, index) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.width = 100;
    img.style.margin = "10px";
    img.style.cursor = "pointer";
    img.style.border = "3px solid transparent";

    img.addEventListener("click", () => {
      selectedMainImageIndex = index;
      mainImageIndexInput.value = index;

      Array.from(previewContainer.children).forEach((child, i) => {
        child.style.border = i === index ? "3px solid green" : "3px solid transparent";
      });
    });

    previewContainer.appendChild(img);
  });
});

if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.history.back();
    });
  }

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Please log in first.");
    window.location.href = "login-seller.html";
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('price').value);
    const quantity = parseInt(document.getElementById('quantity').value);
    const description = document.getElementById('description').value;
    const imageFiles = document.getElementById('image').files;

    if (!imageFiles || imageFiles.length === 0) {
      alert("Please select an image.");
      return;
    }

    if (selectedMainImageIndex === null) {
      alert("Please select a main image.");
      return;
    }

    try {
        const imageUrls = [];

        for (const file of imageFiles) {
            const imageUrl = await uploadToCloudinary(file);
            imageUrls.push(imageUrl);
        }

        const productRef = doc(collection(db, "products"));
        const productId = productRef.id;

      await setDoc(productRef, {
        productId,
        name,
        price,
        quantity,
        description,
        imageUrls,
        mainImageUrl: imageUrls[selectedMainImageIndex],
        sellerUID: user.uid,
        timestamp: serverTimestamp()
      });

      alert("Product added successfully!");
      window.location.href = "seller-dashboard.html";
    } catch (error) {
      console.error("Error uploading product:", error);
      alert("Failed to add product.");
    }
  });
});
