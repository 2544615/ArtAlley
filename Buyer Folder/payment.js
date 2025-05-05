import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { writeBatch, getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs,deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyDUfE0XLFPlpw_SAJIFoQlJhylk-r2VY4Y",
  authDomain: "artalley-b9c96.firebaseapp.com",
  projectId: "artalley-b9c96",
  storageBucket: "artalley-b9c96.firebasestorage.app",
  messagingSenderId: "1056868925602",
  appId: "1:1056868925602:web:4fa9734632b255594917fb"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore(app);


const form = document.getElementById('paymentForm');
    const errorMessage = document.getElementById('errorMessage');
    const message = document.getElementById('message');

    const cardSection = document.getElementById('cardDetails');
    const paypalSection = document.getElementById('paypalDetails');
    const bankSection = document.getElementById('bankDetails');

    const confirmation = document.getElementById('confirmation');
    const summary = document.getElementById('orderSummary');
    const confirmBtn = document.getElementById('confirmBtn');
    confirmBtn.disabled = true;

    // Show input fields based on selected payment method
    document.querySelectorAll('input[name="payment"]').forEach(input => {
      input.addEventListener('change', function () {
        cardSection.classList.add('hidden');
        paypalSection.classList.add('hidden');
        bankSection.classList.add('hidden');
        errorMessage.textContent = '';
        message.textContent = '';
        confirmation.classList.add('hidden');

        if (this.value === 'card') cardSection.classList.remove('hidden');
        else if (this.value === 'paypal') paypalSection.classList.remove('hidden');
        else if (this.value === 'bank') bankSection.classList.remove('hidden');
        updateRequiredFields(this.value);
      });
    });

    document.getElementById('bankProof').addEventListener('change', function () {
      const fileParagraph = document.getElementById('bankFilename');
      if (this.files.length > 0) {
        fileParagraph.textContent = `📎 ${this.files[0].name}`;
      } else {
        fileParagraph.textContent = '';
      }
    });
    

    // Input restrictions
    document.getElementById('cardNumber').addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 16);
    });

    document.getElementById('expiryMonth').addEventListener('input', e => {
      let month = e.target.value.replace(/\D/g, '').slice(0, 2);
      if (parseInt(month) > 12) {
        month = '12';
      }
      e.target.value = month;
    });

    document.getElementById('expiryYear').addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 2);
    });

    document.getElementById('cvv').addEventListener('input', e => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
    });

    document.getElementById('cardHolder').addEventListener('input', e => {
      e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
    });

    function updateRequiredFields(method) {
      ['cardNumber', 'expiryMonth', 'expiryYear', 'cvv', 'cardHolder', 'paypalEmail'].forEach(id => {
        document.getElementById(id).required = false;
      });

      if (method === 'card') {
        ['cardNumber', 'expiryMonth', 'expiryYear', 'cvv', 'cardHolder'].forEach(id => {
          document.getElementById(id).required = true;
        });
      } else if (method === 'paypal') {
        document.getElementById('paypalEmail').required = true;
      }

      document.getElementById('bankProof').required = false;

      if (method === 'bank') {
        document.getElementById('bankProof').required = true;
      }
    }

    // Form submit
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorMessage.textContent = '';
      
      const payment = document.querySelector('input[name="payment"]:checked');
      if (!payment) {
        errorMessage.textContent = 'Please select a payment method.';
        return;
      }
      
      summary.textContent = '';
      confirmation.classList.add('hidden');


      const method = payment.value;
      let valid = true;
      let summaryText = `Payment Method: ${payment.nextSibling.textContent.trim()}\n`;
      let errorMessages = [];

      if (method === 'card') {
        const cardNumber = document.getElementById('cardNumber').value.trim();
        const expiryMonth = document.getElementById('expiryMonth').value.trim();
        const expiryYear = document.getElementById('expiryYear').value.trim();
        const cvv = document.getElementById('cvv').value.trim();
        const holder = document.getElementById('cardHolder').value.trim();
        const save = document.getElementById('saveCard').checked;

        if (!/^\d{16}$/.test(cardNumber)) {
          errorMessages.push('Card number must be 16 digits.');
          valid = false;
        } 
        
        if (expiryMonth === '' || expiryYear === '') {
          errorMessages.push('Please enter both expiry month and year.');
          valid = false;
        } 
        else {
          const now = new Date();
          const enteredMonth = parseInt(expiryMonth, 10);
          const enteredYear = parseInt(expiryYear, 10) + 2000;

          if (isNaN(enteredMonth) || isNaN(enteredYear)) {
            errorMessages.push('Expiry date must be numeric.');
            valid = false;
          }

          else if (enteredMonth < 1 || enteredMonth > 12) {
            errorMessages.push('Expiry month must be between 01 and 12.');
            valid = false;
          } else {
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1;

            if (enteredYear < currentYear || (enteredYear === currentYear && enteredMonth < currentMonth)) {
              errorMessages.push('Card is expired.');
              valid = false;
            }
          }
        }
        
        if (!/^\d{3,4}$/.test(cvv)) {
          errorMessages.push('CVV must be 3 or 4 digits.');
          valid = false;
        }

        if (holder === '') {
          errorMessages.push('Card holder name is required.');
          valid = false;
        }

        // Check if there are any error messages
        if (errorMessages.length > 0) {
          // Append the error messages to the errorMessage container
          errorMessages.forEach(msg => {
              const errorElem = document.createElement('p');
              errorElem.textContent = msg;
              errorMessage.appendChild(errorElem);
          });
          valid = false;
        }

        if (valid) {
          summaryText += `Card ending in ${cardNumber.slice(-4)}\n`;
          summaryText += save ? "Card will be saved." : "Card won't be saved.";
        }

      } else if (method === 'paypal') {
        const email = document.getElementById('paypalEmail').value.trim();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
          errorMessage.textContent = 'Enter a valid PayPal email.';
          valid = false;
        } else {
          summaryText += `PayPal Email: ${email}`;
        }

      } else if (method === 'bank') {
          const bankProof = document.getElementById('bankProof');
          if (!bankProof.files || bankProof.files.length === 0) {
            errorMessage.textContent = 'Please upload proof of bank transfer.';
            valid = false;
          } else {
            summaryText += "Follow the bank instructions to complete the payment.\n";
            summaryText += `Uploaded File: ${bankProof.files[0].name}`;
          }
        }

      if (valid) {
        summary.textContent = summaryText;
        confirmation.classList.remove('hidden');
        confirmBtn.disabled = false;
        } else {
          confirmBtn.disabled = true;
      }
    });

    // Confirm button click
    confirmBtn.addEventListener('click', async function () {
      confirmBtn.disabled = true;
      form.classList.add('loading');
      document.getElementById('loader').classList.remove('hidden');
      
      setTimeout(async () => {
        confirmation.classList.add('hidden');
        message.textContent = "✅ Payment was successfully!";
        form.reset();
        cardSection.classList.add('hidden');
        paypalSection.classList.add('hidden');
        bankSection.classList.add('hidden');
        form.classList.remove('loading');
        document.getElementById('loader').classList.add('hidden');
        confirmBtn.disabled = false;

        // Step 2: Remove items from cart after successful payment
        const user = auth.currentUser;
        if (user) {
          await removeItemsFromCart(user); // Remove items from Firestore
        }
        window.location.href = 'cart.html';
      }, 4000); // simulate delay
    });

    // Function to remove items from cart in Firestore
async function removeItemsFromCart(user) {
  const cartRef = doc(db, "users", user.uid, "cart", "active");
  const itemsRef = collection(cartRef, "items");

  // Step 1: Get all items in the cart
  const cartSnapshot = await getDocs(itemsRef);
  
  if (cartSnapshot.empty) {
    console.log("Cart is empty. No items to remove.");
    return;
  }

  // Step 2: Create a batch to delete all items in one atomic operation
  const batch = writeBatch(db); // Write batch for atomic operations
  
  // Step 3: Loop through each document in the cart and delete it
  cartSnapshot.forEach(doc => {
    batch.delete(doc.ref); // Delete each item document
  });

  // Step 4: Commit the batch operation
  await batch.commit();
  console.log("Items successfully removed from the cart.");
}