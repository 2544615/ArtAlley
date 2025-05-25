
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {getFirestore,doc,getDoc,setDoc, collection, query, where, getDocs} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider,signInWithPopup,createUserWithEmailAndPassword,signOut,sendEmailVerification} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

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

const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword');
const submit = document.getElementById('register');
const google_login = document.getElementById("icon");
const togglePassword = document.getElementById('togglePassword');
const eyeIcon = document.getElementById('eyeIcon');
const termsCheckbox = document.getElementById('termsCheckbox');
const provider = new GoogleAuthProvider();


togglePassword.addEventListener('click', () => {
  const isPassword = password.type === 'password';
  password.type = isPassword ? 'text' : 'password';
  eyeIcon.classList.toggle('fa-eye');
  eyeIcon.classList.toggle('fa-eye-slash');
});

submit.addEventListener('click', async function(event){
  event.preventDefault();

  const emailValue = email.value.trim();

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


  try {
    const userCredential = await createUserWithEmailAndPassword(auth, emailValue, passwordValue);
    const user = userCredential.user;

 
  await sendEmailVerification(user);
  alert("A verification email has been sent. Please check your inbox.");
  
const checkInterval = setInterval(async () => {
  await user.reload(); 

  const latestUser = auth.currentUser;

  if (latestUser.emailVerified) {
    clearInterval(checkInterval);
    alert("Email verified! Successfully signed up as a seller! ");
    console.log('user signed up');
    window.location.href="seller-profile.html";
  }
}, 5000); 
    await setDoc(doc(db,"users",user.uid),{
      uid:user.uid,
  
      email:emailValue,
      role:"seller",
      createdAt:new Date()
    });
    const docSnap = await getDoc(doc(db,"users",user.uid));
    if(!docSnap.exists()||docSnap.data().role !=="seller"){
      await auth.signOut();
      throw new Error("Role verification failed");
    }

    } catch(error) {
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
    };
});

google_login.addEventListener("click", async function() {

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

        email: user.email,
        role: "seller", 
        createdAt: new Date()
      });
    }

    
    window.location.href = "profile.html"; 
  } catch (error) {
    console.error("Error during sign-in:", error.code, error.message);
    alert(`Error: ${error.message}`);
  }
});
