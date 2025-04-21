import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
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

// Upload image to Cloudinary
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
            return response.data.secure_url;  // Return the image URL
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

    try {
        const imageUrls = [];

        for (const file of imageFiles) {
            const imageUrl = await uploadToCloudinary(file);
            imageUrls.push(imageUrl);
        }
        

      await addDoc(collection(db, "products"), {
        name,
        price,
        quantity,
        description,
        imageUrls,
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