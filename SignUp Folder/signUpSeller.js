// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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
const username=document.getElementById('username');
const email = document.getElementById('address');
const password = document.getElementById('password');
const submit = document.getElementById('register');

ubmit.addEventListener('click', function(event){
    const emailValue = email.value;
    const passwordValue = password.value;
    if(username.value!="" && typeof(username.value)=="string" && emailValue==="" && passwordValue===""){
      createUserWithEmailAndPassword(auth, emailValue, passwordValue)
  .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    alert('creating user...')
    // ...
  })
  .catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
    // ..
  });
<<<<<<< HEAD:signUpSeller.js
      

    }
    
})
=======
})
>>>>>>> bcdc7c82fee2221c9ac6e2bdc7d16923b5104a28:SignUp Folder/signUpSeller.js
