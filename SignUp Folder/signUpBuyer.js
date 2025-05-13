// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {getFirestore,doc,getDoc,setDoc, collection, query, where, getDocs} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider,signInWithPopup,createUserWithEmailAndPassword,signOut,sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
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

const email = document.getElementById('address');
//const username= document.getElementById('username');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const submit = document.getElementById('register');
const google_login = document.getElementById("icon");
const togglePassword = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const termsCheckbox = document.getElementById('termsCheckbox');
const provider = new GoogleAuthProvider();

// Toggle Password Visibility
togglePassword.addEventListener('click', () => {
  const isPassword = password.type === 'password';
  password.type = isPassword ? 'text' : 'password';
  eyeIcon.classList.toggle('fa-eye');
  eyeIcon.classList.toggle('fa-eye-slash');
});

submit.addEventListener('click', async function(event){
  event.preventDefault(); // prevent form from refreshing/submitting

  const emailValue = email.value.trim();
  //const usernameValue = username.value.trim();
  const passwordValue = password.value;
  const confirmPasswordValue = confirmPassword.value;
  
  if (!emailValue || !passwordValue || !confirmPasswordValue) {
    let missing = [];
    if (!emailValue) missing.push("Email");
    if (!passwordValue) missing.push("Password");
    if (!confirmPasswordValue) missing.push("Confirm Password");
    alert("Please fill in the following fields:\n" + missing.join(", "));
    return;
  }

  // ✅ Password Format Check
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\d\W]).{8,}$/;
  if (!passwordRegex.test(passwordValue)) {
    alert("Password must be at least 8 characters long, with at least 1 lowercase letter, 1 uppercase letter, and 1 number or special character.");
    return;
  }

  if (passwordValue !== confirmPasswordValue) {
    alert("Passwords do not match.");
    return;
  }

  if (!termsCheckbox.checked) {
    alert("Please accept the terms and conditions first.");
    return;
  }

  

  // Regex: only letters, at least 4 characters
  //const usernameRegex = /^[A-Za-z]{4,}$/;

  

  // Check all fields
  // if (!usernameValue || !emailValue || !passwordValue) {
  //   alert('All fields are required.');
  //   return;
  // }

  // Validate username format
  // if (!usernameRegex.test(usernameValue)) {
  //   alert("The username should have at least 4 characters,no numbers");
  //   return;
  // }


  try {
    const userCredential = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
    const user = userCredential.user;

    //Send email verification
  await sendEmailVerification(user);
  alert("A verification email has been sent. Please check your inbox.");
  // Start auto-check for verification
const checkInterval = setInterval(async () => {
  await user.reload(); // Refresh user data

  const latestUser = auth.currentUser;

  if (latestUser.emailVerified) {
    clearInterval(checkInterval);
    alert("Email verified! Successfully signed up as a buyer! ");
    window.location.href = "../Buyer Folder/product-listing.html";
  }
}, 5000); // Check every 5 seconds
  
    await setDoc(doc(db,"users",user.uid),{
      uid:user.uid,
      //username:usernameValue,
      email:emailValue,
      role:"buyer",
      createdAt:new Date()
    });
    const docSnap = await getDoc(doc(db,"users",user.uid));
    if(!docSnap.exists()||docSnap.data().role !=="buyer"){
      await auth.signOut();
      throw new Error("Role verification failed");
    }
    // alert('Successfully signed up as a buyer!');
    // console.log('user signed up');
    // window.location.href="../Buyer Folder/product-listing.html";
    } catch(error) {
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
    };
});

google_login.addEventListener("click", async function() {
  //const termsChecked = document.getElementById("termsCheckbox").checked;

  if (!termsCheckbox.checked) {
    alert("Please accept the terms and conditions first.");
    return;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {

      await setDoc(userRef, {
        uid: user.uid,
        //username: user.displayName || "GoogleUser",
        email: user.email,
        role: "buyer", 
        createdAt: new Date()
      });
    }

    alert("Successfully signed up as a buyer!");
    window.location.href = "../Buyer Folder/product-listing.html"; 
  } catch (error) {
    console.error("Error during sign-in:", error.code, error.message);
    alert(`Error: ${error.message}`);
  }
});
