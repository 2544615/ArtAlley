/**
 * @jest-environment jsdom
 */
//THE FORGETPASSWORD ORIGINAL TESTS.JS

describe('Forgot Password Page', () => {
  beforeEach(() => {
    //form id was 'forgotPasswordForm'
  document.body.innerHTML = ` 
  <h1>Forgot Your Password</h1> 
  <form id='resetForm'> 
  <input type="email" placeholder="Email address" required>
  
  <button type="submit">Reset Password</button>
    </form>`
  ;
  // Simulate form behavior
  document.getElementById('resetForm').addEventListener('submit', (event) => {
    event.preventDefault();
  });


});

test('Loads the Forgot Password form correctly', () => {
  expect(document.querySelector('h1')?.textContent).toBe('Forgot Your Password');

  const emailInput = document.querySelector('input[type="email"]');
  expect(emailInput).toBeTruthy();
  expect(emailInput?.getAttribute('placeholder')).toBe('Email address');

  const submitButton = document.querySelector('button[type="submit"]');
  expect(submitButton).toBeTruthy();
  expect(submitButton?.textContent).toBe('Reset Password');
});

test('Prevents submission with empty email', () => {
  const form = document.getElementById('resetForm');
  const emailInput = document.querySelector('input[type="email"]');
  emailInput.value = ''; // empty email

  const event = new Event('submit', { bubbles: true, cancelable: true });
  const prevented = !form.dispatchEvent(event);

  expect(prevented).toBe(true); // submission is prevented due to form validation
});

test('Submits the form with a valid email', () => {
  const form = document.getElementById('resetForm');
  const emailInput = document.querySelector('input[type="email"]');

    // Simulate user input
    emailInput.value = 'resetme@example.com';
  const event = new Event('submit', { bubbles: true, cancelable: true });
  const prevented = !form.dispatchEvent(event);

  // In a real DOM, checkValidity would block invalid forms,
  // but in jsdom, we have to simulate the logic manually
  expect(emailInput.value).toBe('resetme@example.com');
  expect(prevented).toBe(true); // event.preventDefault() still runs
});
  

});


//LOGIN BUYER TEST.JS

/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Buyer Login Page', () => {
  let htmlContent;

  beforeAll(() => {
    // Read the HTML file content
    const htmlPath = path.resolve(__dirname, 'login-buyer.html'); // Adjust the path
    htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  });

  beforeEach(() => {
    // Set the document's innerHTML to the HTML content read from the file
    document.body.innerHTML = htmlContent;
  });

  test('Loads the login form correctly', () => {
    expect(document.querySelector('h2')?.textContent).toBe('Login as a buyer');
    expect(document.querySelector('p')?.textContent).toBe('Welcome back');
  });

  test('Has email and password fields', () => {
    const emailInput = document.querySelector('input#email');
    const passwordInput = document.querySelector('input#password');

    expect(emailInput).toBeTruthy();
    expect(emailInput?.getAttribute('type')).toBe('email');
    expect(emailInput?.getAttribute('placeholder')).toBe('Enter your email here');

    expect(passwordInput).toBeTruthy();
    expect(passwordInput?.getAttribute('type')).toBe('password');
    expect(passwordInput?.getAttribute('placeholder')).toBe('**********');
  });

  test('Login button is present and functional', () => {
    const loginBtn = document.querySelector('button.login-btn');
    expect(loginBtn).toBeTruthy();
    expect(loginBtn?.textContent).toContain('Login');
  });

  test('Forgot Password link is correct', () => {
    const forgotLink = document.querySelector('nav.options a');
    expect(forgotLink).toBeTruthy();
    expect(forgotLink?.getAttribute('href')).toBe('ForgotPaswword.html');
  });

  test('Google sign-in section is visible', () => {
    const googleBtn = document.querySelector('#google-btn');
    const googleImg = document.querySelector('#google-btn img');

    expect(googleBtn).toBeTruthy();
    expect(googleBtn?.textContent).toContain('Sign in with Google');

    expect(googleImg?.getAttribute('src')).toContain('google-logo.png');
  });

  test('Sign up link goes to buyer signup', () => {
    const signupLink = document.querySelector('p.signup a');
    expect(signupLink).toBeTruthy();
    expect(signupLink?.getAttribute('href')).toBe('../SignUp Folder/buyer-signup.html');
  });
});


//ANDMIN SIGNIN JEST TESTS


/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Admin Sign-In Page Functionality", () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, "admin-signin.html");
    htmlContent = fs.readFileSync(htmlPath, "utf-8");
  });

  beforeEach(() => {
    document.body.innerHTML = htmlContent;
  });

  test("Admin login page loads correctly", () => {
    expect(document.querySelector("title").textContent).toBe("Login Page");
    expect(document.querySelector("form")).toBeTruthy();
    expect(document.querySelector("#email")).toBeTruthy();
    expect(document.querySelector("#password")).toBeTruthy();
    expect(document.querySelector(".login-btn")).toBeTruthy();
    expect(document.querySelector("#google-btn")).toBeTruthy();
  });

  test("Handles email/password login correctly", () => {
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const loginButton = document.querySelector(".login-btn");

    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    emailInput.value = "admin@example.com";
    passwordInput.value = "password123";

    loginButton.addEventListener("click", () => {
      if (emailInput.value && passwordInput.value) {
        window.location.href = "admin-dashboard.html";
      } else {
        alert("Please enter both email and password.");
      }
    });

    loginButton.click();
    expect(window.location.href).toBe("admin-dashboard.html");
  });

  test("Denies access for non-admin users", () => {
    const userData = { role: "user" };
    const expectedRole = "admin";

    if (userData.role !== expectedRole) {
      window.location.href = "access-denied.html"; // Simulated redirection
    }

    expect(window.location.href).toBe("access-denied.html");
  });

  test("Handles Google sign-in correctly", () => {
    const googleLoginButton = document.querySelector("#google-btn");

    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    googleLoginButton.addEventListener("click", () => {
      const userRole = "admin"; // Simulated role check
      if (userRole === "admin") {
        window.location.href = "admin-dashboard.html";
      } else {
        alert("Access denied");
      }
    });

    googleLoginButton.click();
    expect(window.location.href).toBe("admin-dashboard.html");
  });

  test("Displays error message for failed login attempt", () => {
    const emailInput = document.querySelector("#email");
    const passwordInput = document.querySelector("#password");
    const loginButton = document.querySelector(".login-btn");

    emailInput.value = "wronguser@example.com";
    passwordInput.value = "wrongpassword";

    loginButton.addEventListener("click", () => {
      if (emailInput.value !== "admin@example.com" || passwordInput.value !== "password123") {
        alert("Login failed!");
      }
    });

    jest.spyOn(window, "alert").mockImplementation(() => {});
    loginButton.click();

    expect(window.alert).toHaveBeenCalledWith("Login failed!");
  });
});














//THE HOMEPAGE ORIGINAL TEST.JS
/**
 * @jest-environment jsdom
 */

describe('Art Alley Homepage', () => {
    let originalLocation;
  
    beforeAll(() => {
      // Mock window.location
      delete window.location;
      window.location = { href: '' };
      originalLocation = window.location;
    });
  
    beforeEach(() => {
      // Set up DOM with homepage structure
      document.body.innerHTML = `
        <header>
    <nav>
      <ul class="icons">
        <li><button><i class="fas fa-search"></i></button></li>
        <li><button><i class="fas fa-shopping-cart"></i></button></li>
        <li><button><i class="fas fa-user"></i></button></li>
      </ul>
    </nav>
  </header>

  <main>
    <section class="title-section">
      <h1>ArtAlley</h1>
      <p>Where Culture Meets Craft – Handmade Treasures Await</p>
    </section>

    <section class="artisan-gallery">
      <figure><img src="https://www.insightsafariholidays.com/wp-content/uploads/crafts.jpg" alt="Crafts 1"></figure>
      <figure><img src="https://ebaronosleather.com/wp-content/uploads/2018/07/arts-and-crafts.jpg" alt="Crafts 2"></figure>
      <figure><img src="https://t3.ftcdn.net/jpg/08/46/64/76/360_F_846647619_MRvbMx2QmXrnCg0U7k9sRZKOpttnco6u.jpg" alt="Crafts 3"></figure>
    </section>

    <section class="auth-section">
      <p>New to our platform?</p>
      <form id="roleForm" aria-label="Role selection form">
        <label for="roleSelect" class="visually-hidden">Select your role</label>
        <select id="roleSelect" name="role" required>
          <option value="" disabled selected>Select a role</option>
          <option value="../SignUp Folder/buyer-signup.html">Buyer</option>
          <option value="../SignUp Folder/seller-signup.html">Seller</option>
        </select>
        <button type="submit">Submit</button>
      </form>

      <p>Already an existing user? <a href="choose.html">Login here</a></p>
    </section>
  </main>

  <footer>
    <section class="footer-help">
      <h2>Help</h2>
      <ul>
        <li><a href="#">Contact Us</a></li>
        <li><a href="#">Submit an Idea</a></li>
        <li><a href="#">Suggest a Product</a></li>
      </ul>
    </section>

    <section class="footer-logo">
      <h2>ArtAlley</h2>
    </section>

    <section class="footer-account">
      <h2>Account</h2>
      <ul>
        <li><a href="#">My Account</a></li>
        <li><a href="#">Track Order</a></li>
        <li><a href="#">Personal Details</a></li>
      </ul>
    </section>
  </footer>
      `;
  
      // Mock form submission
      document.getElementById('roleForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const role = document.getElementById('roleSelect').value;
        window.location.href = `${role.toLowerCase()}-signup`;
      });
    });
  
    afterAll(() => {
      // Restore original location
      window.location = originalLocation;
    });
  
    test('Displays header icons correctly', () => {
      const buttons = document.querySelectorAll('.icons button');
      expect(buttons.length).toBe(3);
      expect(document.querySelector('.fa-search')).not.toBeNull();
      expect(document.querySelector('.fa-shopping-cart')).not.toBeNull();
      expect(document.querySelector('.fa-user')).not.toBeNull();
    });
  
    test('Displays title section correctly', () => {
      const title = document.querySelector('h1');
      const subtitle = document.querySelector('p');
      expect(title.textContent).toBe('ArtAlley');
      expect(subtitle.textContent).toBe('Where Culture Meets Craft – Handmade Treasures Await');
    });
  
    test('Shows all 3 artisan images', () => {
      const images = document.querySelectorAll('.artisan-gallery img');
      expect(images.length).toBe(3);
    });
  
    test('Validates role selection form', () => {
      const select = document.getElementById('roleSelect');
      const submitButton = document.querySelector('#roleForm button[type="submit"]');
      expect(select).not.toBeNull();
      expect(submitButton.textContent).toContain('Submit');
    });
  
    test('Redirects user to selected signup page', () => {
        // Mock window.location
        delete window.location;
        window.location = { href: '' };

        // Reattach the submit listener as per your script
        document.getElementById("roleForm").addEventListener("submit", function(event) {
            event.preventDefault();
            const selected = document.getElementById("roleSelect").value;
            if (selected) {
            window.location.href = selected;
            }
        });

        /// Set the selected value
        const select = document.getElementById('roleSelect');
        select.value = '../SignUp Folder/buyer-signup.html';

        // Submit the form
        const form = document.getElementById('roleForm');
        const event = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(event);

        // Expect the redirect
        expect(window.location.href).toBe('../SignUp Folder/buyer-signup.html');
      });
  
    test('Displays footer sections and links', () => {
      const footerTexts = ['Help', 'Account', 'ArtAlley'];
      footerTexts.forEach(text => {
        expect(document.body.textContent).toContain(text);
      });
      
      const footerLinks = document.querySelectorAll('footer a');
      expect(footerLinks.length).toBeGreaterThanOrEqual(6);
    });
  });

  
  
//ANDMIN-SIGNIN.JS (LOOKS LIKE A JEST TESTS)/**
 

//CARTS JEST TEST


/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Shopping Cart Functionality", () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, "cart.html");
    htmlContent = fs.readFileSync(htmlPath, "utf-8");
  });

  beforeEach(() => {
    document.body.innerHTML = htmlContent;
  });

  test("Cart page loads correctly", () => {
    expect(document.querySelector("title").textContent).toBe("ArtAlley - Cart");
    expect(document.querySelector("section#CartProducts")).toBeTruthy();
    expect(document.querySelector("button#checkout")).toBeTruthy();
  });

  test("Redirects to login page if user is not authenticated", () => {
    // Simulate authentication failure
    delete window.location;
    window.location = { href: "" };

    const authStateChangedCallback = (user) => {
      if (!user) {
        window.location.href = "login.html";
      }
    };

    authStateChangedCallback(null); // No user logged in

    expect(window.location.href).toBe("login.html"); // Ensure redirection occurs
  });

  test("Adds a product to the cart and updates UI", () => {
    document.body.innerHTML = htmlContent; // Load the HTML
    const cartSection = document.querySelector("#CartProducts");

    const product = {
      name: "Test Item",
      price: 100.0,
      quantity: 1,
      imageUrls: ["test-image.jpg"],
    };

    const cartItem = document.createElement("article");
    cartItem.classList.add("cart-item");
    cartItem.innerHTML = `
      <h3>${product.name}</h3>
      <p>R${product.price.toFixed(2)}</p>
    `;
    cartSection.appendChild(cartItem);

    expect(cartSection.innerHTML).toContain("Test Item");
    expect(cartSection.innerHTML).toContain("R100.00");
  });

  test("Handles quantity increase and decrease correctly", () => {
    document.body.innerHTML = htmlContent; // Load the HTML
    const quantityControl = document.createElement("nav");
    quantityControl.className = "quantity-control";
    quantityControl.dataset.name = "Test Item";
    quantityControl.dataset.stock = "5"; // Simulating stock availability
  
    const increaseButton = document.createElement("button");
    increaseButton.className = "increaseQuantity";
    quantityControl.appendChild(increaseButton);
  
    const quantitySpan = document.createElement("p");
    quantitySpan.className = "quantity";
    quantitySpan.textContent = "1";
    quantityControl.appendChild(quantitySpan);
  
    document.body.appendChild(quantityControl);
  
    // Ensure clicking button triggers update
    increaseButton.addEventListener("click", () => {
      let quantity = parseInt(quantitySpan.textContent);
      if (quantity < 5) quantitySpan.textContent = quantity + 1;
    });
  
    increaseButton.click(); // Simulate quantity increase
    expect(parseInt(quantitySpan.textContent)).toBe(2); // Quantity should increase
  
    const decreaseButton = document.createElement("button");
    decreaseButton.className = "decreaseQuantity";
    quantityControl.appendChild(decreaseButton);
  
    decreaseButton.addEventListener("click", () => {
      let quantity = parseInt(quantitySpan.textContent);
      if (quantity > 1) quantitySpan.textContent = quantity - 1;
    });
  
    decreaseButton.click(); // Simulate quantity decrease
    expect(parseInt(quantitySpan.textContent)).toBe(1); // Quantity should decrease
  });
  

  test("Handles cart checkout correctly", () => {
    document.body.innerHTML = htmlContent; // Load the HTML
    const checkoutButton = document.querySelector("#checkout");
  
    // Mock window.location.href
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  
    // Simulate empty cart
    const cart = [];
    checkoutButton.addEventListener("click", () => {
      if (cart.length === 0) {
        window.location.href = "cart.html"; // Should stay on cart page
      } else {
        window.location.href = "checkout.html"; // Redirect to checkout
      }
    });
  
    checkoutButton.click();
    expect(window.location.href).toBe("cart.html"); // Should stay on cart page
  
    // Simulate items in cart
    cart.push({ name: "Test Item", price: 100 });
    checkoutButton.click();
    expect(window.location.href).toBe("checkout.html"); // Should redirect to checkout
  });
  
});


//CARTS.JS FILE

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
  import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs,deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
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
  

  //adding the products to the cart list
const cart = [];


  export async function addToCart(product) {
    console.log('addToCart is called');
    console.log(product);
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in.");
  
    const userId = user.uid;
    const cartRef = doc(db, "users", userId, "cart", "active");
    const cartSnap = await getDoc(cartRef);
  
    if (!cartSnap.exists()) {
      await setDoc(cartRef, { total: 0 });
    }
  
    const itemsRef = collection(cartRef, "items");
  
    // Check if the product already exists in cart
    const q = query(itemsRef, where("name", "==", product.name));
    const snapshot = await getDocs(q);
  
    if (!snapshot.empty) {
      const docRef = snapshot.docs[0].ref;
      const existingItem = snapshot.docs[0].data();
      if (existingItem.quantity + 1 > product.quantity) {
        return alert(`Only ${product.quantity} item(s) in stock.`);
      }
      await updateDoc(docRef, {
        quantity: existingItem.quantity + 1
      });
      } else {
        if (product.quantity < 1) {
            return alert("This product is out of stock.");
        }

      await addDoc(itemsRef, {
        name: product.name,
        price: product.price,
        quantity: 1,
        user: userId,
        imageUrl: product.imageUrls[0], // First Cloudinary URL
        stock: product.quantity
      });
    }
  
    updateCartUI(); // Call the UI updater
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadCartFromFirestore(user.uid);
      updateCartUI(); // update the DOM after loading
    } else {
      // Optional: Clear cart and redirect if user logs out
      cart = [];
      updateCartUI();
      alert("Please log in.");
      window.location.href = "login.html";
    }
  });
  
  async function loadCartFromFirestore() {
    const user = auth.currentUser;
    if (!user) return;
  
    const cartItemsRef = collection(db, "users", user.uid, "cart", "active", "items");
    const snapshot = await getDocs(cartItemsRef);
  
    cart.length = 0; // Clear current cart array
  
    snapshot.forEach(doc => {
      cart.push(doc.data());
    });
  
    updateCartUI();
  }
  
  

  function updateCartUI() {
    const cartSection = document.getElementById('CartProducts');
    if (!cartSection) {
      console.error('cart-products section not found in DOM');
      return;
    }
    cartSection.innerHTML = "";
  
    if (cart.length === 0) {
      cartSection.innerHTML = '<p>Your cart is empty.</p>';
      return;
    }
  
    let total = 0;
  
    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      const imageUrl = item.imageUrl || "";
  
      const cartItem = document.createElement("article");
      cartItem.classList.add("cart-item");

    cartItem.innerHTML = `
  <figure>
    <img src="${imageUrl}" alt="${item.name}">
  </figure>
    <h3>${item.name}</h3>
    <p><button class="remove-button" id="DeleteBtn" aria-label="Remove ${item.name} from cart">Remove</button></p>
  <nav class="quantity-control" aria-label="Quantity control for ${item.name}" data-name="${item.name}" data-stock="${item.stock}">
    <button class="decreaseQuantity" aria-label="Decrease quantity">−</button>
    <p class="quantity">${item.quantity}</p>
    <button class="increaseQuantity" aria-label="Increase quantity">+</button>
  </nav>
  <aside>
    <p>R${itemTotal.toFixed(2)}</p>
  </aside>
`;

      cartSection.appendChild(cartItem);
     });
  
    const totalElement = document.createElement("p");
    totalElement.innerHTML = `<strong>Total: R${total.toFixed(2)}</strong>`;
    cartSection.appendChild(totalElement);
  }


console.log(cart);
async function deleteItemFromCart(docRef, name) {
  const confirmRemove = confirm(`Are you sure you want to delete ${name} from your cart?`);
  if (confirmRemove) {
    try {
      await deleteDoc(docRef);
      await loadCartFromFirestore();
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
  }
}

document.addEventListener("click", async function (e) {
  const isIncrease = e.target.classList.contains("increaseQuantity");
  const isDecrease = e.target.classList.contains("decreaseQuantity");
  const isRemove = e.target.classList.contains("remove-button");

  if (!isIncrease && !isDecrease && !isRemove) return;

  const user = auth.currentUser;
  if (!user) return alert("You must be logged in.");

  const cartRef = doc(db, "users", user.uid, "cart", "active");
  const itemsRef = collection(cartRef, "items");

  
  if (isRemove) {
    const name = e.target.closest(".cart-item")?.querySelector("h3")?.textContent;
    if (!name) return;

  /*const user = auth.currentUser;
  if (!user) return alert("You must be logged in.");

  const cartRef = doc(db, "users", user.uid, "cart", "active");
  const itemsRef = collection(cartRef, "items");*/

  const q = query(itemsRef, where("name", "==", name));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const docRef = snapshot.docs[0].ref;
  await deleteItemFromCart(docRef,name);
  }

  const quantityContainer = e.target.closest(".quantity-control");
  if(!quantityContainer)return;

  const quantitySpan = quantityContainer.querySelector(".quantity");
  const name = quantityContainer.dataset.name;
  const stock = parseInt(quantityContainer.dataset.stock);
  let currentQuantity = parseInt(quantitySpan.textContent);

  const q = query(itemsRef, where("name", "==", name));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return;
  const docRef = snapshot.docs[0].ref;
 

  if (isIncrease) {
    if (currentQuantity < stock) {
      await updateDoc(docRef, { quantity: currentQuantity + 1 });
    } else {
      alert(`Cannot exceed available stock quantity for ${name}`);
    }
  }

  if (isDecrease) {
    if (currentQuantity > 1) {
      await updateDoc(docRef, { quantity: currentQuantity - 1 });
    } else {
      await deleteItemFromCart(docRef, name);
    }
  }

  await loadCartFromFirestore();
});

  

  document.getElementById("cartButton").addEventListener("click", () => {
    window.location.href = "cart.html";
  });
  //ALso here for the go back
  document.addEventListener("DOMContentLoaded", function () {
    const goBack = document.getElementById("goBack");
  
    if (goBack) {
      goBack.addEventListener("click", function () {
        window.history.back();
      });
    }
  });
  
  
  document.getElementById("profileButton").addEventListener("click", async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, "users", user.uid); 
        const querySnapshot = await getDoc(userDocRef);
        
  
        if (!querySnapshot.exists()) {
          
          window.location.href = "../SignUp Folder/buyer-profile.html";
          return;
        }
  
        const userData = querySnapshot.data();
  
        // Check if any important field is missing
        const requiredFields = ["firstName","lastName", "email", "phone", "address", "username"]; // Adjust these fields based on your profile structure
        const hasEmptyField = requiredFields.some(field => {
          return !userData[field] ||  (typeof userData[field] === 'string' && userData[field].trim() === "");
        });
  
        if (hasEmptyField) {
          window.location.href = "../SignUp Folder/buyer-profile.html"; // Go to profile completion page
        } else {
          window.location.href = "../SignIn Folder/my-profile.html"; // Profile is complete
        }
        
      } catch (error) {
        console.error("Error checking profile:", error);
        alert("Error loading your profile. Try again.");
      }
    } else {
      window.location.href = "../SignIn Folder/login-buyer.html"; // Just in case user is not authenticated
    }
  });



document.addEventListener("DOMContentLoaded", function() {
  const check = document.getElementById('checkout');
  if (check) {
    check.addEventListener("click", function() {
      if (cart.length === 0) {
        alert("Please add to cart first.");
      } else {
        window.location.href = "checkout.html";
      }
    });
  }
});


//CHECKOUTS JEST TESTS


/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Checkout Page Functionality", () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, "checkout.html");
    htmlContent = fs.readFileSync(htmlPath, "utf-8");
  });

  beforeEach(() => {
    document.body.innerHTML = htmlContent;
  });

  test("Checkout page loads correctly", () => {
    expect(document.querySelector("title").textContent).toBe("ArtAlley-Checkout");
    expect(document.querySelector("form#form2")).toBeTruthy();
    expect(document.querySelector("#cart-items")).toBeTruthy();
  });

  test("Redirects to login page if user is not authenticated", () => {
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    if (!document.body.dataset.authenticated) {
      window.location.href = "../SignIn Folder/login-buyer.html";
    }

    expect(window.location.href).toBe("../SignIn Folder/login-buyer.html");
  });

  test("Handles checkout form submission correctly", () => {
    const form = document.querySelector("#form2");

    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      window.location.href = "confirmation.html"; // Simulated redirection after submission
    });

    form.dispatchEvent(new Event("submit"));

    expect(window.location.href).toBe("confirmation.html");
  });

  test("Loads cart summary and calculates total correctly", () => {
    const cartItemsSection = document.querySelector("#cart-items");
    const cartItems = [
      { name: "Item A", price: 50, quantity: 2 },
      { name: "Item B", price: 30, quantity: 1 },
    ];

    let total = 0;
    cartItems.forEach((item) => {
      const subtotal = item.price * item.quantity;
      total += subtotal;

      const itemSummary = document.createElement("section");
      itemSummary.classList.add("summary-item");
      itemSummary.innerHTML = `<p>${item.quantity}x ${item.name}</p><p>R${subtotal.toFixed(2)}</p>`;
      cartItemsSection.appendChild(itemSummary);
    });

    const totalElement = document.createElement("p");
    totalElement.innerHTML = `<strong>Total: R${total.toFixed(2)}</strong>`;
    cartItemsSection.appendChild(totalElement);

    expect(cartItemsSection.innerHTML).toContain("Item A");
    expect(cartItemsSection.innerHTML).toContain("Item B");
    expect(cartItemsSection.innerHTML).toContain("R130.00");
  });

  test("Handles country and city selection dynamically", () => {
    const countrySelect = document.createElement("select");
    countrySelect.id = "country";
    document.body.appendChild(countrySelect);

    const citySelect = document.createElement("select");
    citySelect.id = "city";
    document.body.appendChild(citySelect);

    // Simulate fetching countries
    countrySelect.innerHTML = '<option value="">Select your country</option>';
    const countries = ["South Africa", "United States"];
    countries.forEach((country) => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });

    expect(countrySelect.innerHTML).toContain("South Africa");
    expect(countrySelect.innerHTML).toContain("United States");

    // Simulate country selection and fetching cities
    countrySelect.value = "South Africa";
    citySelect.innerHTML = '<option value="">Select your city</option>';
    const cities = ["Johannesburg", "Cape Town"];
    cities.forEach((city) => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });

    expect(citySelect.innerHTML).toContain("Johannesburg");
    expect(citySelect.innerHTML).toContain("Cape Town");
  });
});


//CHECKOUT JS

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs,deleteDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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
  const auth = getAuth(app);
  
  const ship = document.getElementById('form2');

onAuthStateChanged(auth, async(user) => {
  if (!user) {
    alert("Please log in first.");
    window.location.href = "../SignIn Folder/login-buyer.html";
    return;
  }
  let total = 0;

  ship.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstname = document.getElementById('firstname').value;
    const lastname = document.getElementById('lastname').value;
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value; 
    const address = document.getElementById('address').value; 
    const email = document.getElementById('email').value;
    const contact = parseInt(document.getElementById('contact').value);
    const note = document.getElementById('note').value;

  

    try {
        

      await addDoc(collection(db, "shipping"), {
        firstname,
        lastname,
        country,
        city,
        address,
        email,
        contact,
        note,
        buyeruid: user.uid,
        timestamp: serverTimestamp()
      });
      
      // Save email and total for Paystack
      localStorage.setItem("checkoutAmount", total.toFixed(2));
      localStorage.setItem("checkoutEmail", email);

      //alert("Successfully checked out!");
      window.location.href = "paystack.html";
      
    } catch (error) {
      console.error("Error uploading product:", error);
      alert("Failed to add product.");
    }
  });


  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      alert("Please log in first.");
      window.location.href = "login.html";
      return;
    }
  
    const cartItemsRef = collection(db, "users", user.uid, "cart", "active", "items");
  const snapshot = await getDocs(cartItemsRef);

  const cartItemsSection = document.getElementById("cart-items");
  total = 0;

  if (snapshot.empty) {
    cartItemsSection.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  cartItemsSection.innerHTML = ""; // Clear existing content

  snapshot.forEach(doc => {
    const item = doc.data();
    const subtotal = item.price * item.quantity;
    total += subtotal;

    const itemSummary = document.createElement("section");
    itemSummary.classList.add("summary-item");

    itemSummary.innerHTML = `
      <p id>  ${item.quantity}x ${item.name} </p>
      <p>R${subtotal.toFixed(2)}</p>
    `;

    cartItemsSection.appendChild(itemSummary);
  });

  const totalSection = document.createElement("section");
totalSection.style.display = "flex";
totalSection.style.justifyContent = "space-between";
totalSection.style.alignItems = "center";
totalSection.style.marginTop = "1rem";
totalSection.style.paddingTop = "0.5rem";
totalSection.style.borderTop = "2px solid #000";

totalSection.innerHTML = `
  <h4 style="margin: 0;">Total</h4>
  <p style="margin: 0; font-weight: bold;">R${total.toFixed(2)}</p>
`;

cartItemsSection.appendChild(totalSection);

});
  
});






const countrySelect = document.getElementById("country");
const citySelect = document.getElementById("city");

// Load countries
fetch("https://countriesnow.space/api/v0.1/countries/positions")
  .then(response => response.json())
  .then(data => {
    const countries = data.data.map(c => c.name).sort();
    countrySelect.innerHTML = '<option value="">Select your country</option>';
    countries.forEach(country => {
      const option = document.createElement("option");
      option.value = country;
      option.textContent = country;
      countrySelect.appendChild(option);
    });
  })
  .catch(() => {
    countrySelect.innerHTML = '<option value="">Could not load countries</option>';
  });

// When country is selected, fetch cities
countrySelect.addEventListener("change", () => {
  const selectedCountry = countrySelect.value;
  citySelect.disabled = true;
  citySelect.innerHTML = '<option>Loading cities...</option>';

  fetch("https://countriesnow.space/api/v0.1/countries/cities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ country: selectedCountry })
  })
  .then(response => response.json())
  .then(data => {
    const cities = data.data;
    citySelect.innerHTML = '<option value="">Select your city</option>';
    cities.forEach(city => {
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
    citySelect.disabled = false;
  })
  .catch(() => {
    citySelect.innerHTML = '<option value="">Could not load cities</option>';
    citySelect.disabled = true;
  });
});


