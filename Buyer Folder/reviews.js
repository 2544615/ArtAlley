import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.appspot.com",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);

// DOM Elements
const productsList = document.getElementById('productsList');
const reviewFilter = document.getElementById('reviewFilter');
const modal = document.getElementById('reviewModal');
const closeBtn = document.querySelector('.close');
const submitReviewBtn = document.getElementById('submitReview');
const modalProductImage = document.getElementById('modalProductImage');
const modalProductName = document.getElementById('modalProductName');
const reviewText = document.getElementById('reviewText');
const stars = document.querySelectorAll('.star');

// State
let currentUser = null;
let currentProduct = null;
let selectedRating = 0;

// Event Listeners
reviewFilter.addEventListener('change', loadProducts);
closeBtn.addEventListener('click', () => modal.style.display = 'none');
submitReviewBtn.addEventListener('click', submitReview);
stars.forEach(star => {
  star.addEventListener('click', () => setRating(star));
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// Initialize
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    loadProducts();
  } else {
    window.location.href = "../SignIn Folder/login-buyer.html";
  }
});

// Load products from orders
async function loadProducts() {
  try {
    productsList.innerHTML = '<div class="loading">Loading your products...</div>';
    
    // Get all orders for current user
    const q = query(
      collection(db, "orders"),
      where("userId", "==", currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const productsMap = new Map(); // To avoid duplicates
    
    // Extract all unique products from orders
    querySnapshot.forEach(orderDoc => {
      const orderData = orderDoc.data();
      if (orderData.items && orderData.items.length > 0) {
        orderData.items.forEach(item => {
          if (!productsMap.has(item.name)) {
            productsMap.set(item.name, {
              ...item,
              productId: item.productId,
              orderId: orderDoc.id,
              orderDate: orderData.timestamp?.toDate() || new Date()
            });
          }
        });
      }
    });
    
    // Convert to array and sort by order date (newest first)
    const products = Array.from(productsMap.values()).sort((a, b) => b.orderDate - a.orderDate);
    
    // Filter based on selection
    const filterValue = reviewFilter.value;
    let filteredProducts = products;
    
    if (filterValue === 'reviewed') {
      // Check which products have reviews
      const reviewedProducts = await getReviewedProducts();
      filteredProducts = products.filter(p => reviewedProducts.includes(p.name));
    } else if (filterValue === 'not-reviewed') {
      const reviewedProducts = await getReviewedProducts();
      filteredProducts = products.filter(p => !reviewedProducts.includes(p.name));
    }
    
    // Display products
    displayProducts(filteredProducts);
    
  } catch (error) {
    console.error("Error loading products:", error);
    productsList.innerHTML = `<div class="error">Error loading products: ${error.message}</div>`;
  }
}

// Display products in the UI
async function displayProducts(products) {
  if (products.length === 0) {
    productsList.innerHTML = '<div class="no-products">No products found matching your criteria.</div>';
    return;
  }
  
  productsList.innerHTML = '';
  
  // Get list of reviewed products to show badges
  const reviewedProducts = await getReviewedProducts();
  
  products.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    
    const isReviewed = reviewedProducts.includes(product.name);
    
    productCard.innerHTML = `
      <div class="product-info">
        <img src="${product.imageUrl || 'https://via.placeholder.com/80'}" 
             alt="${product.name}" class="product-image">
        <div class="product-details">
          <h3 class="product-name">${product.name}</h3>
          <p class="product-price">R${product.price.toFixed(2)}</p>
          <p class="order-date">Ordered: ${product.orderDate.toLocaleDateString()}</p>
        </div>
      </div>
      ${isReviewed 
        ? '<div class="reviewed-badge">Reviewed</div>' 
        : `<button class="review-btn" data-product='${JSON.stringify(product)}'>
            Write Review
           </button>`}
    `;
    
    productsList.appendChild(productCard);
    
    // Add event listener to review button if it exists
    const reviewBtn = productCard.querySelector('.review-btn');
    if (reviewBtn) {
      reviewBtn.addEventListener('click', () => openReviewModal(product));
    }
  });
}

// Open review modal with product info
function openReviewModal(product) {
  currentProduct = product;
  selectedRating = 0;
  reviewText.value = '';
  
  // Reset stars
  stars.forEach(star => star.classList.remove('active'));
  
  // Set product info in modal
  modalProductImage.src = product.imageUrl || 'https://via.placeholder.com/150';
  modalProductImage.alt = product.name;
  modalProductName.textContent = product.name;
  
  modal.style.display = 'block';
}

// Set star rating
function setRating(star) {
  const value = parseInt(star.getAttribute('data-value'));
  selectedRating = value;
  
  stars.forEach((s, index) => {
    if (index < value) {
      s.classList.add('active');
      s.textContent = '★';
    } else {
      s.classList.remove('active');
      s.textContent = '☆';
    }
  });
}

// Submit review to Firestore
async function submitReview() {
  if (selectedRating === 0) {
    alert('Please select a rating');
    return;
  }
  
  if (!reviewText.value.trim()) {
    alert('Please write your review');
    return;
  }
  
  try {
    // Create or update review document
    const reviewRef = doc(db, "reviews", `${currentUser.uid}_${currentProduct.name.replace(/\s+/g, '_')}`);
    
    await setDoc(reviewRef, {
      userId: currentUser.uid,
      productId: currentProduct.productId, 
      productName: currentProduct.name,
      productImage: currentProduct.imageUrl,
      rating: selectedRating,
      reviewText: reviewText.value.trim(),
      timestamp: new Date()
    }, { merge: true });
    
    alert('Thank you for your review!');
    modal.style.display = 'none';
    loadProducts(); // Refresh the list
    
  } catch (error) {
    console.error("Error submitting review:", error);
    alert('There was an error submitting your review. Please try again.');
  }
}

// Get list of product names that user has reviewed
async function getReviewedProducts() {
  const q = query(
    collection(db, "reviews"),
    where("userId", "==", currentUser.uid)
  );
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data().productName);
}
