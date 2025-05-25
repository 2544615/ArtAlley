import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, getDocs, query, orderBy, getDoc, doc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


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
import { addToCart } from './Carts.js';

let currentPage = 1;
const itemsPerPage = 24; 


let products = [];
let filteredProducts = [];


function renderProducts(productList) {
  const productContainer = document.getElementById("productContainer");
  productContainer.innerHTML = ""; 

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const paginatedProducts = productList.slice(startIndex, endIndex);

  paginatedProducts.forEach((product) => {
    const imageUrl = product.imageUrls ? product.imageUrls[0] : "";

    const productCard = document.createElement("article");
productCard.classList.add("product-card");

productCard.innerHTML = `
  <a class="clickable" data-product-id="${product.id}" style="text-decoration: none; color: inherit; cursor: pointer;">
    <figure>
      <img src="${imageUrl}" alt="${product.name}" />
      <figcaption>
        <h2>${product.name}</h2>
        <p>Price: R${product.price.toFixed(2)}</p>
      </figcaption>
    </figure>
  </a>
  <button class="add-to-cart-btn">Add to cart</button>
`;



productCard.querySelector('.clickable').addEventListener('click', () => {
  localStorage.setItem("selectedProductId", product.id); 
  window.location.href = "product-details.html"; 
  console.log("Selected Product ID saved to localStorage:", product.id);
});


    productContainer.appendChild(productCard);
    const button = productCard.querySelector('.add-to-cart-btn');
    button.addEventListener('click', (e) => {
      e.stopPropagation(); 
      addToCart(product);
      
    });
  });
 

  document.getElementById("currentPage").textContent = `Page ${currentPage}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = endIndex >= productList.length;
}

<<<<<<< HEAD

async function loadProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
=======
// Function to Load Products, excluding out-of-stock items
async function loadProducts() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    
    products = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((product) => product.quantity > 0); // Exclude out-of-stock items

    filteredProducts = products;
>>>>>>> c92034ed (Admin tings)
    
    products = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((product) => product.quantity > 0); 

    filteredProducts = products;

    const storedSearch = localStorage.getItem('searchQuery');
    if (storedSearch) {
      filteredProducts = searchProducts(storedSearch);
      localStorage.removeItem('searchQuery'); 
    }
    
    renderProducts(filteredProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    alert("Failed to load products.");
  }
}


<<<<<<< HEAD
=======
// Sorting Functionality
>>>>>>> c92034ed (Admin tings)
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



async function populateSellerDropdown() {
  try {
    const querySnapshot = await getDocs(collection(db, "products"));
    const sellerUIDs = new Set(); 

    querySnapshot.forEach(doc => {
      const sellerUID = doc.data().sellerUID;
      if (sellerUID) {
        sellerUIDs.add(sellerUID);
      }
    });

    const sellerDropdown = document.getElementById("sellerDropdown");
    sellerDropdown.innerHTML = '<option value="all">All Sellers</option>'; 

    
    for (const uid of sellerUIDs) {
      const sellerRef = doc(db, "users", uid);
      const sellerSnapshot = await getDoc(sellerRef);

      if (sellerSnapshot.exists()) {
        const sellerData = sellerSnapshot.data();
        const sellerName = sellerData.username || sellerData.email; 

        const option = document.createElement("option");
        option.value = uid; 
        option.textContent = sellerName;
        sellerDropdown.appendChild(option);
      }
    }
  } catch (error) {
    console.error("Error loading sellers:", error);
  }
}


document.getElementById("filterBtn").addEventListener("click", () => {
  const minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
  const maxPrice = parseFloat(document.getElementById("maxPrice").value) || Infinity;
  const selectedSellerUID = document.getElementById("sellerDropdown").value;

  filteredProducts = products.filter(product => {
    const matchesSeller = selectedSellerUID === "all" || product.sellerUID === selectedSellerUID;

    return product.price >= minPrice && product.price <= maxPrice && matchesSeller;
  });

  currentPage = 1;
  renderProducts(filteredProducts);
});


document.addEventListener("DOMContentLoaded", () => {
  populateSellerDropdown();
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


document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadProducts();
    } else {
      alert("You need to log in to view the products.");
      window.location.href = "../SignIn Folder/login-buyer.html";
    }
  });
});


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
  window.location.href = "cart.html";
});

document.getElementById("profileButton").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (user) {
    try {
      const userDocRef = doc(db, "users", user.uid); 
      const querySnapshot = await getDoc(userDocRef);
      

      if (!querySnapshot.exists()) {
        
        window.location.href = "../SignUp Folder/buyer-profile.html";
        return;
      }

      const userData = querySnapshot.data();

      
      const requiredFields = ["firstName","lastName", "email", "phone", "address", "username"]; 
      const hasEmptyField = requiredFields.some(field => {
        return !userData[field] ||  (typeof userData[field] === 'string' && userData[field].trim() === "");
      });

      if (hasEmptyField) {
        window.location.href = "../SignUp Folder/buyer-profile.html"; 
      } else {
        window.location.href = "../SignIn Folder/my-profile-buyer.html"; 
      }
      
    } catch (error) {
      console.error("Error checking profile:", error);
      alert("Error loading your profile. Try again.");
    }
  } else {
    window.location.href = "../SignIn Folder/login-buyer.html"; 
  }
});
  
