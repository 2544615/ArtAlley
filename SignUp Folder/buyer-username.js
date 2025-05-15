import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, updateDoc, getDocs, query, where, collection } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

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

const form = document.getElementById("usernameForm");
const usernameInput = document.getElementById("username");

onAuthStateChanged(auth, (user) => {
    if (!user) {
      alert("No authenticated user found. Please sign in again.");
      window.location.href = "../SignIn Folder/login-buyer.html";
      return;
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();

    

      if (/^\d+$/.test(username)) {
        alert("Username cannot consist of numbers only.");
        return;
      }

      const usernamePattern = /^[A-Za-z][A-Za-z0-9]{3,}$/;
      if (!usernamePattern.test(username)) {
        alert("Username must be at least 4 characters, start with a letter, and contain only letters and numbers.");
        return;
      }

      try {
        // ✅ Check uniqueness among buyers
        const usersRef = collection(db, "users");
        const buyerQuery = query(usersRef, where("username", "==", username), where("role", "==", "buyer"));
        const querySnapshot = await getDocs(buyerQuery);

        let usernameTaken = false;
        querySnapshot.forEach((docSnap) => {
          if (docSnap.id !== user.uid) {
            usernameTaken = true;
          }
        });

        if (usernameTaken) {
          alert("This username is already taken by another buyer. Please choose another one.");
          return;
        }

        // ✅ Update Firestore
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          username: username
        });

        alert("Username created successfully!");
        window.location.href = "../Buyer Folder/product-listing.html"; // adjust if needed

      } catch (error) {
        console.error("Error updating username:", error);
        alert("Something went wrong. Try again.");
      }
    });
  });