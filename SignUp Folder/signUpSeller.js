// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {getFirestore,doc,getDoc,setDoc} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider,signInWithPopup,createUserWithEmailAndPassword,signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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
const db=getFirestore(app);
auth.languageCode = 'en';

const email = document.getElementById('address');
const username= document.getElementById('username');
const password = document.getElementById('password');
const submit = document.getElementById('register');
const google_login = document.getElementById("icon");
const provider = new GoogleAuthProvider();

submit.addEventListener('click', function(event){
  event.preventDefault(); // prevent form from refreshing/submitting

  const emailValue = email.value.trim();
  const usernameValue = username.value.trim();
  const passwordValue = password.value;

  // Regex: only letters, at least 4 characters
  const usernameRegex = /^[A-Za-z]{4,}$/;

  // Check all fields
  if (!usernameValue || !emailValue || !passwordValue) {
    alert('All fields are required.');
    return;
  }

  // Validate username format
  if (!usernameRegex.test(usernameValue)) {
    alert("Invalid Username");
    return;
  }

  // Proceed with Firebase sign up
  createUserWithEmailAndPassword(auth, emailValue, passwordValue)
    .then(async(userCredential) => {
      const user = userCredential.user;
      await setDoc(doc(db,"users",user.uid),{
        uid:user.uid,
        username:usernameValue,
        email:emailValue,
        role:"seller",
        createdAt:new Date()
      });
      const docSnap = await getDoc(doc(db,"users",user.uid));
      if(!docSnap.exists()||docSnap.data().role !=="seller"){
        await auth.signOut();
        throw new Error("Role verification failed");
      }
      alert('Successfully signed up as a seller!');
      console.log('user signed up');
      window.location.href="#";//buyer-dashboard
      // Optional: redirect or store user info
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
    });
});

google_login.addEventListener("click", async function() {
  const termsChecked = document.getElementById("termsCheckbox").checked;

  if (!termsChecked) {
    alert("Please agree to the Terms and Conditions before signing up with Google.");
    return;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // New user — assign role
      await setDoc(userRef, {
        uid: user.uid,
        username: user.displayName || "GoogleUser",
        email: user.email,
        role: "seller", // <-- Assign seller role here
        createdAt: new Date()
      });
    }

    alert("Successfully signed up as a seller!");
    window.location.href = "#"; // Replace with seller dashboard if needed
  } catch (error) {
    console.error("Error during sign-in:", error.code, error.message);
    alert(`Error: ${error.message}`);
  }
});
