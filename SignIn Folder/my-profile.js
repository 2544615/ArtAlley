import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import {
  getAuth, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.firebasestorage.app",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth();

const form = document.getElementById("myProfileForm");
const emailInput = document.getElementById("email");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const usernameInput = document.getElementById("profileUsername");
const numberInput = document.getElementById("number");
const addressInput = document.getElementById("address");
const backBtn = document.getElementById("back-btn");


[firstNameInput, lastNameInput].forEach((input) => {
  input.addEventListener("input", (e) => {
    e.target.value = e.target.value.replace(/[^A-Za-z]/g, "");
  });

  input.pattern = "^[A-Za-z]+$";
  input.oninvalid = function () {
    this.setCustomValidity("Only letters are allowed in names—no numbers or special characters.");
  };
  input.oninput = function () {
    this.setCustomValidity("");
  };
});


usernameInput.pattern = "^[A-Za-z][A-Za-z0-9._-]{3,}$";
usernameInput.oninvalid = function () {
  this.setCustomValidity("Username must start with a letter, be at least 4 characters, and can include numbers, '.', '_', and '-'.");
};
usernameInput.oninput = function () {
  this.setCustomValidity("");
};


numberInput.pattern = "[0-9]{10}";
numberInput.oninvalid = function () {
  this.setCustomValidity("Phone number must be exactly 10 digits.");
};
numberInput.oninput = function () {
  this.setCustomValidity("");
};

let originalPhoneNumber = "";


numberInput.addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "");

  if (e.target.value.length < 10) {
    numberInput.setCustomValidity("Phone number must be exactly 10 digits.");
  } else {
    numberInput.setCustomValidity("");
  }
});

numberInput.addEventListener("blur", () => {
  if (numberInput.value.length !== 10) {
    alert("Phone number must be exactly 10 digits.");
    numberInput.value = originalPhoneNumber;
  }
});


  if (backBtn) {
    backBtn.addEventListener("click", function () {
      window.history.back();
    });
  }

[firstNameInput, lastNameInput].forEach((input) => {
  input.addEventListener("keydown", (e) => {
    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
    if (!/^[A-Za-z]$/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  });
});

usernameInput.addEventListener("keydown", (e) => {
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];
  if (!/^[A-Za-z0-9._-]$/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
});


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Not logged in. Redirecting to login.");
    window.location.href = "../SignIn Folder/login-seller.html";
    return;
  }

  const userRef = doc(db, "users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const data = userSnap.data();
  emailInput.value = data.email || "";
  firstNameInput.value = data.firstName || "";
  lastNameInput.value = data.lastName || "";
  usernameInput.value = data.username || "";
  numberInput.value = data.phone || "";
  addressInput.value = data.address || "";

 
  originalPhoneNumber = data.phone || "";


  document.querySelectorAll('input[data-editable="true"]').forEach((input) => {
    input.addEventListener("click", () => {
      input.readOnly = false;
      input.focus();
    });

  
    input.addEventListener("blur", async () => {
      const value = input.value.trim();
      const field = input.id;

      if (!value) {
        alert("Field cannot be empty.");
        input.value = data[field] || ""; 
        input.readOnly = true;
        return;
      }

      if (field === "profileUsername") {
        
        if (/^\d+$/.test(value)) {
          alert("Username cannot consist of numbers only.");
          input.value = data.username;
          input.readOnly = true;
          return;
        }

        if (!/^[A-Za-z]/.test(value)) {
          alert("Username must start with a letter.");
          input.value = data.username;
          input.readOnly = true;
          return;
        }

        if (value.length < 4) {
          alert("Username must be at least 4 characters long.");
          input.value = data.username;
          input.readOnly = true;
          return;
        }

        if (!/^[A-Za-z0-9._-]+$/.test(value)) {
          alert("Username can only contain letters, numbers, '.', '_', and '-'.");
          input.value = data.username;
          input.readOnly = true;
          return;
        }

        
        const usernameQuery = query(
          collection(db, "users"),
          where("username", "==", value),
          where("role", "==", "seller")
        );
        const snapshot = await getDocs(usernameQuery);
        let taken = false;
        snapshot.forEach((docSnap) => {
          if (docSnap.id !== user.uid) {
            taken = true;
          }
        });
        if (taken) {
          alert("This username is already taken by another seller.");
          input.value = data.username;
          input.readOnly = true;
          return;
        }
      }


      try {
        await setDoc(userRef, { [field]: value }, { merge: true });
        data[field] = value;
        console.log("Auto-saved:", field);
      } catch (err) {
        console.error("Auto-save failed", err);
        alert("Failed to save changes.");
        input.value = data[field];
      }

      input.readOnly = true;
    });
  });
});
