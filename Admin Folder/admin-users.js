import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { 
  getFirestore, collection, getDocs, query, where, orderBy, doc, getDoc 
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.appspot.com",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

// DOM Elements
const usersContainer = document.getElementById('usersContainer');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const roleFilter = document.getElementById('roleFilter');
const filterBtn = document.getElementById('filterBtn'); // Added this line
const signOutButton = document.getElementById('signOutButton');

// Sign Out Handler
signOutButton.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "admin-signin.html";
  } catch (error) {
    console.error("Sign-out error:", error);
    alert("Failed to sign out.");
  }
});

// Authentication Check
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "admin-signin.html";
    return;
  }

  try {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists() || userSnap.data().role !== "admin") {
      alert("Access denied. Admins only.");
      window.location.href = "../index.html";
      return;
    }

    loadUsers();
  } catch (error) {
    console.error("Authentication error:", error);
    showError(`Failed to verify admin status: ${error.message}`);
  }
});

// Display Users
function displayUsers(users) {
  usersContainer.innerHTML = ""; // Clear existing users

  if (users.length === 0) {
    showMessage("No users found.");
    return;
  }

  users.forEach(user => {
    const userCard = document.createElement("section");
    userCard.className = "user-card";

    userCard.innerHTML = `
      <h4>${user.username}</h4>
      <p class="email">${user.email}</p>
      <p class="role"><strong>Role: </strong>${user.role}</p>
    `;

    usersContainer.appendChild(userCard);
  });

  // Hide the loading indicator since users are successfully displayed
  const loadingIndicator = document.getElementById("loadingIndicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "none";
  }
}

// Load Users
async function loadUsers(filter = "all") {
  try {
    const usersRef = collection(db, "users");
    const usersQuery = filter === "all" ? query(usersRef, orderBy("role")) : query(usersRef, where("role", "==", filter));
    const querySnapshot = await getDocs(usersQuery);

    const usersList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      email: doc.data().email || "No email",
      username: doc.data().username || "No username",
      role: doc.data().role
    }));

    window.allUsers = usersList; // Store for search functionality
    displayUsers(usersList);
  } catch (error) {
    console.error("Error fetching users:", error);
    showError(`Failed to fetch users: ${error.message}`);
  }
}

// Filter Button Functionality - ONLY ADDITION I MADE
filterBtn.addEventListener("click", () => {
  const selectedRole = roleFilter.value;
  loadUsers(selectedRole);
});

// Search Functionality
searchBtn.addEventListener("click", () => {
  const searchTerm = searchInput.value.trim().toLowerCase();
  console.log("Search term entered:", searchTerm);

  if (!window.allUsers) {
    console.error("Search failed: user list is undefined");
    return;
  }

  if (!searchTerm) {
    displayUsers(window.allUsers);
    return;
  }

  const filteredUsers = window.allUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm)
  );

  console.log("Filtered Users:", filteredUsers);
  displayUsers(filteredUsers);
});

function showMessage(message) {
  const messageElement = document.getElementById('errorMessage');
  messageElement.textContent = message;
  messageElement.style.display = 'block';
}

function showError(message) {
  console.error(message);
  const errorElement = document.getElementById('errorMessage');
  errorElement.textContent = message;
  errorElement.style.display = 'block';
}