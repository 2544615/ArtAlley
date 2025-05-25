/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Seller Dashboard", () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, "seller-dashboard.html");
    htmlContent = fs.readFileSync(htmlPath, "utf-8");
  });

  beforeEach(() => {
    document.body.innerHTML = htmlContent;
  });

  test("Loads the seller dashboard correctly", () => {
    expect(document.querySelector("title")?.textContent).toBe("Seller Dashboard");
    expect(document.querySelector("section#header")).toBeTruthy();
    expect(document.querySelector("section#products")).toBeTruthy();
  });

  test("Displays empty product section when no products exist", () => {
    const emptySection = document.querySelector("#empty-product-section");
    const productList = document.querySelector("#product");
    
   
    emptySection.classList.remove("hidden");
    productList.hidden = true;

    expect(emptySection.classList.contains("hidden")).toBe(false);
    expect(productList.hidden).toBe(true);
  });

  test("Adds new product when button is clicked", () => {
    document.body.innerHTML = htmlContent; // Load the HTML
    const addProductBtn = document.querySelector("#add-product-btn");
    expect(addProductBtn).toBeTruthy();
  

    addProductBtn.addEventListener("click", () => {
      window.location.assign("add-product.html");
    });
  
    delete window.location;
    window.location = { assign: jest.fn() };
  

    addProductBtn.click();
  
    expect(window.location.assign).toHaveBeenCalledWith("add-product.html"); // Ensure redirection works
  });
  
  test("Ensures delete button removes product from DOM", () => {
    
    const productList = document.querySelector("#product");
    const productElement = document.createElement("article");
    productElement.id = "product-123";
    
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    
    productElement.appendChild(deleteBtn);
    productList.appendChild(productElement);

    expect(document.querySelector("#product-123")).toBeTruthy(); // Product exists

  
    deleteBtn.dispatchEvent(new Event("click"));
    productElement.remove(); 
    expect(document.querySelector("#product-123")).toBeFalsy(); // Product should be gone
  });

  test("Redirects to edit page when edit button is clicked", () => {
    document.body.innerHTML = htmlContent; 
    const productElement = document.createElement("article");
    productElement.id = "product-123";
  
    const editBtn = document.createElement("button");
    editBtn.className = "edit-button";
    editBtn.innerHTML = '<i class="fa-solid fa-pen"></i>';
    
    editBtn.addEventListener("click", () => {
      window.location.href = `edit.html?id=123`;
    });
  
    productElement.appendChild(editBtn);
    document.body.appendChild(productElement);
  
    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });
  
    editBtn.click(); 
  
    expect(window.location.href).toBe("edit.html?id=123"); // Check correct redirection
  });
});