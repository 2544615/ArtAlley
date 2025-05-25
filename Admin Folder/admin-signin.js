// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword,signOut  } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import{getFirestore,doc,getDoc} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";


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

const email = document.getElementById('email');
const password = document.getElementById('password');
const submit = document.querySelector('.login-btn');
const provider = new GoogleAuthProvider();

const google_login = document.getElementById("google-btn");

const expectedRole="admin";

async function verifyUserRole(user){
  const userRef=doc(db,"users",user.uid);
  const userSnap=await getDoc(userRef);

if(!userSnap.exists()){
  await signOut(auth);
  alert("User data not found in the database");
  return false;
}
const userData=userSnap.data();
if(userData.role!==expectedRole){
  await signOut(auth);
  alert("Access denied!");
  return false;
}
return userData;
}

submit.addEventListener('click', function(event){
    event.preventDefault();
    const emailValue = email.value;
    const passwordValue = password.value;
    if(!emailValue||!passwordValue){
      alert("please enter both email and password");
      return;
    }
  signInWithEmailAndPassword(auth, emailValue, passwordValue)
  .then(async(userCredential) => {
    // Signed in 
    const user = userCredential.user;

    const userData=await verifyUserRole(user);
    if(!userData)
      return;
    window.location.href="admin-users.html";
     // ...
  })
  .catch((error) => {
    alert('Login failed!')
    const errorCode = error.code;
    const errorMessage = error.message;
    alert(errorMessage);
  });
})

google_login.addEventListener("click", function(){

  signInWithPopup(auth, provider)
    .then(async(result) => {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      const user = result.user;
      const userRef=doc(db,"users",user.uid);
      const userSnap=await getDoc(userRef);
      if(userSnap.exists()){
        const userData=userSnap.data();
        if(userData.role!==expectedRole){
          await signOut(auth);
          alert("Access denied");
          return;
        }
        console.log(user);
        window.location.href="admin-users.html";
      }else{
        alert("User data not found");
      } 
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      const email = error.customData.email;
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error("Error during sign-in:", errorCode, errorMessage);
    });
});
