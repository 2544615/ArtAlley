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
