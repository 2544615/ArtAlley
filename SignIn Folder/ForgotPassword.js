//  Your Firebase config

const firebaseConfig = {
    apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
    authDomain: "artalley-b9c96.firebaseapp.com",
    projectId: "artalley-b9c96",
    storageBucket: "artalley-b9c96.appspot.com", // fixed typo here
    messagingSenderId: "1056868925602",
    appId: "1:1056868925602:web:4fa9734632b255594917fb"
  };


  
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  //  Listen to form submit
  document.getElementById("resetForm").addEventListener("submit", function (e) {
    e.preventDefault();
  
    const email = document.getElementById("email").value;
  
    firebase.auth().sendPasswordResetEmail(email)
      .then(() => {
        document.getElementById("message").textContent =
          "A password reset link has been sent to your email.";
      })//The catch is failing in line 27
      .catch((error) => {
        document.getElementById("message").textContent = error.message;
        console.error("Error sending reset email:", error);
      });
  });
  
  
