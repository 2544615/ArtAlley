// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth,GoogleAuthProvider,signInWithPopup, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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
auth.languageCode = 'en';
const email = document.getElementById('address');
const username = document.getElementById('username');
const password = document.getElementById('password');
const submit = document.getElementById('register');
const provider = new GoogleAuthProvider();
const google_login = document.getElementById("icon");

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
    alert('Username must be at least 4 letters and contain only alphabets (no numbers or symbols).');
    return;
  }

  // Proceed with Firebase sign up
  createUserWithEmailAndPassword(auth, emailValue, passwordValue)
    .then((userCredential) => {
      const user = userCredential.user;
      alert('Successfully signed up!');
      // Optional: redirect or store user info
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
    });
});



google_login.addEventListener("click", function(){
signInWithPopup(auth, provider)
    .then((result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      console.log(user);
      alert("Succesfully signed up")
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error("Error during sign-in:", errorCode, errorMessage);
    });
})
