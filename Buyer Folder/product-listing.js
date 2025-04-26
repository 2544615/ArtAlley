import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


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

// Variables for Pagination
let currentPage = 1;
const itemsPerPage = 24; 

// Variables for Sorting and Filtering
let products = [];
let filteredProducts = [];

// Function to Render Products
function renderProducts(productList) {
  const productContainer = document.getElementById("productContainer");
  productContainer.innerHTML = ""; 

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const paginatedProducts = productList.slice(startIndex, endIndex);

  paginatedProducts.forEach((product) => {
    const imageUrl = product.imageUrls ? product.imageUrls[0] : "";

    const productCard = document.createElement("div");
    productCard.classList.add("product-card");

    productCard.innerHTML = `
      <div class="clickable" onclick="window.location.href='#'">
        <img src="${imageUrl}" alt="${product.name}">
        <h2>${product.name}</h2>
        <p>Price: R${product.price.toFixed(2)}</p>
      </div>
    `;

    productContainer.appendChild(productCard);
  });

  document.getElementById("currentPage").textContent = `Page ${currentPage}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = endIndex >= productList.length;
}

// Function to Load Products
async function loadProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    products = querySnapshot.docs.map((doc) => doc.data());
    filteredProducts = products;
    
    // Check for stored search query
    const storedSearch = localStorage.getItem('searchQuery');
    if (storedSearch) {
      filteredProducts = searchProducts(storedSearch);
      localStorage.removeItem('searchQuery'); // Clear after use
    }
    
    renderProducts(filteredProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    alert("Failed to load products.");
  }
}

// Sorting Functionality
document.getElementById("sortOptions").addEventListener("change", (event) => {
  const sortBy = event.target.value;

  if (sortBy === "priceLowHigh") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === "priceHighLow") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === "nameAZ") {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === "nameZA") {
    filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
  }
  renderProducts(filteredProducts);
});


// Filtering Functionality
document.getElementById("filterBtn").addEventListener("click", () => {
  const minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
  const maxPrice = parseFloat(document.getElementById("maxPrice").value) || Infinity;

  filteredProducts = products.filter((product) => product.price >= minPrice && product.price <= maxPrice);
  currentPage = 1;
  renderProducts(filteredProducts);
});

function searchProducts(query) {
  if (!query.trim()) {
    return filteredProducts;
  }
  const searchTerm = query.toLowerCase();
  return filteredProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm)
  );
}

// Pagination Functionality
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderProducts(filteredProducts);
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
  if (currentPage * itemsPerPage < filteredProducts.length) {
    currentPage++;
    renderProducts(filteredProducts);
  }
});

// Check Authentication and Load Products
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadProducts();
    } else {
      alert("You need to log in to view the products.");
      window.location.href = "login.html";
    }
  });
});

// Add Click Event Listeners for the Icons
document.getElementById("searchButton").addEventListener("click", () => {
  const searchQuery = document.querySelector(".search-bar").value.trim();
  if (searchQuery) {
    const searchedProducts = searchProducts(searchQuery);
    currentPage = 1;
    renderProducts(searchedProducts);
  } else {
    currentPage = 1;
    renderProducts(filteredProducts);
  }
});

document.querySelector(".search-bar").addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const searchQuery = document.querySelector(".search-bar").value.trim();
    if (searchQuery) {
      const searchedProducts = searchProducts(searchQuery);
      currentPage = 1;
      renderProducts(searchedProducts);
    } else {
      currentPage = 1;
      renderProducts(filteredProducts);
    }
  }
});

document.getElementById("cartButton").addEventListener("click", () => {
  window.location.href = "#";
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
  
