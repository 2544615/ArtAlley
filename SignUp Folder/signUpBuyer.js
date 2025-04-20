// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth,GoogleAuthProvider,signInWithPopup, createUserWithEmailAndPassword,signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {getFirestore,doc,getDoc,setDoc} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
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
    //console.log('all field are required');
    return;
  }

  // Validate username format
  if (!usernameRegex.test(usernameValue)) {
    alert('Invalid username');
    console.log('invalid username');
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
        role:"buyer",
        createdAt: serverTimestamp()
      });
      const docSnap = await getDoc(doc(db,"users",user.uid));
      if(!docSnap.exists()||docSnap.data().role !=="buyer"){
        await auth.signOut();
        throw new Error("Role verification failed");
      }
      alert('Successfully signed up as a buyer!');
      console.log('user signed up');
      window.location.href="#";//buyer-dashboard
      // Optional: redirect or store user info
    })
    .catch((error) => {
      const errorMessage = error.message;
      alert(`Error: ${errorMessage}`);
      console.log(errorMessage);
    });
});



google_login.addEventListener("click", function(){
signInWithPopup(auth, provider)
    .then(async(result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      console.log(user);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          uid: user.uid,
          username: user.displayName || "GoogleUser",
          email: user.email,
          role: "buyer",
          createdAt: serverTimestamp()
        });
      }
      alert("Succesfully signed up")
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error("Error during sign-in:", errorCode, errorMessage);
    });
});