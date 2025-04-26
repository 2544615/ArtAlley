// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {getFirestore,doc,getDoc,setDoc, collection, query, where, getDocs} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider,signInWithPopup,createUserWithEmailAndPassword,signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.firebasestorage.app",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);
auth.languageCode = 'en';

const profileForm = document.getElementById("profileForm");

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      

      profileForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();
        const lastName = document.getElementById("lastName").value.trim();
        const username = document.getElementById("profileUsername").value.trim();
        const phone = document.getElementById("number").value.trim();
        const address = document.getElementById("address").value.trim();

        // ✅ Check if username is only numbers
        if (/^\d+$/.test(username)) {
          alert("Username cannot consist of numbers only.");
          return;
        }

        // Check if username meets all the rules: at least 4 characters, no special characters, doesn't start with a number
        const usernamePattern = /^[A-Za-z][A-Za-z0-9]{3,}$/;
        if (!usernamePattern.test(username)) {
          alert("Username must be at least 4 characters, start with a letter, and contain only letters and numbers.");
          return;
        }

        // ✅ Check if username already exists among buyers
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

        try {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            firstName,
            lastName,
            username,
            phone,
            address,
            role: "buyer"
          }, { merge: true });

          alert("Profile setup successful!");
          window.location.href = "../Buyer Folder/product-listing.html";
        } catch (error) {
          console.error("Error writing document: ", error);
          alert("An error occurred while saving your profile.");
        }
      });
    } else {
      alert("User not logged in. Redirecting to login page.");
      window.location.href = "../SignIn Folder/login-buyer.html";
    }
  });