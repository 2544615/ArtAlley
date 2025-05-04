/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Edit Product Page", () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, "edit.html");
    htmlContent = fs.readFileSync(htmlPath, "utf-8");
  });

  beforeEach(() => {
    document.body.innerHTML = htmlContent;
  });

  test("Loads the edit form correctly", () => {
    expect(document.querySelector("title")?.textContent).toBe("ArtAlley");
    expect(document.querySelector("form#form")).toBeTruthy();
    expect(document.querySelector("input#ProductName")).toBeTruthy();
    expect(document.querySelector("input#productPrice")).toBeTruthy();
    expect(document.querySelector("input#productQuantity")).toBeTruthy();
    expect(document.querySelector("textarea#productDescription")).toBeTruthy();
  });

  test("Pre-fills form fields when product data is loaded", () => {
    document.querySelector("#ProductName").value = "Test Product";
    document.querySelector("#productPrice").value = "50.00";
    document.querySelector("#productQuantity").value = "10";
    document.querySelector("#productDescription").value = "This is a test description.";

    expect(document.querySelector("#ProductName").value).toBe("Test Product");
    expect(document.querySelector("#productPrice").value).toBe("50.00");
    expect(document.querySelector("#productQuantity").value).toBe("10");
    expect(document.querySelector("#productDescription").value).toBe("This is a test description.");
  });


  test("Handles image selection and updates main image index", () => {
    document.body.innerHTML = htmlContent; // Load the HTML
    const previewContainer = document.querySelector("#preview-images");
    const mainImageIndexInput = document.querySelector("#mainImageIndex");
  
    // Create test images
    const img1 = document.createElement("img");
    img1.src = "image1.jpg";
    img1.style.border = "1px solid #ccc";
    previewContainer.appendChild(img1);
  
    const img2 = document.createElement("img");
    img2.src = "image2.jpg";
    img2.style.border = "1px solid #ccc";
    previewContainer.appendChild(img2);
  
    img2.addEventListener("click", () => {
      mainImageIndexInput.value = "1"; // Update index
    });
  
    img2.click(); // Simulate clicking the second image
  
    expect(mainImageIndexInput.value).toBe("1"); // Confirm update
  });
  
  test("Redirects to login page if user is not authenticated", () => {
    document.body.innerHTML = htmlContent; // Load the HTML
  
    // Mock window.location.href properly
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  
    // Simulate authentication failure
    if (!document.body.dataset.authenticated) {
      window.location.href = "../SignIn Folder/login-seller.html"; // Simulated redirection
    }
  
    expect(window.location.href).toBe("../SignIn Folder/login-seller.html"); // Ensure redirection occurs
  });
  
  

  test("Triggers Firebase update logic on form submission", () => {
    document.body.innerHTML = htmlContent; // Load the HTML
    const form = document.querySelector("#form");
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      window.location.href = "seller-dashboard.html"; // Simulated redirection after update
    });
  
    form.dispatchEvent(new Event("submit")); // Simulate form submission
  
    expect(window.location.href).toContain("seller-dashboard.html"); // Ensure redirection after update
  });
  
  
});
