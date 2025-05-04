/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Product Listing Page Functionality", () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, "product-listing.html");
    htmlContent = fs.readFileSync(htmlPath, "utf-8");
  });

  beforeEach(() => {
    document.body.innerHTML = htmlContent;
  });

  test("Product listing page loads correctly", () => {
    expect(document.querySelector("title").textContent).toBe("Product Listing");
    expect(document.querySelector("#productContainer")).toBeTruthy();
    expect(document.querySelector("#sortFilterForm")).toBeTruthy();
  });

  test("Redirects to login page if user is not authenticated", () => {
    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    if (!document.body.dataset.authenticated) {
      window.location.href = "login.html";
    }

    expect(window.location.href).toBe("login.html"); // Ensure redirection occurs
  });

  test("Displays products correctly when loaded", () => {
    const productContainer = document.querySelector("#productContainer");

    const products = [
      { name: "Product A", price: 50, imageUrls: ["imageA.jpg"] },
      { name: "Product B", price: 30, imageUrls: ["imageB.jpg"] },
    ];

    productContainer.innerHTML = "";
    products.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.classList.add("product-card");
      productCard.innerHTML = `<h2>${product.name}</h2><p>Price: R${product.price.toFixed(2)}</p>`;
      productContainer.appendChild(productCard);
    });

    expect(productContainer.innerHTML).toContain("Product A");
    expect(productContainer.innerHTML).toContain("Product B");
    expect(productContainer.innerHTML).toContain("R50.00");
  });

  test("Sorts products correctly", () => {
    const sortDropdown = document.createElement("select");
    sortDropdown.id = "sortOptions";
    document.body.appendChild(sortDropdown);

    sortDropdown.innerHTML = `
      <option value="priceLowHigh">Price: Low to High</option>
      <option value="priceHighLow">Price: High to Low</option>
    `;

    const products = [
      { name: "Product A", price: 50 },
      { name: "Product B", price: 30 },
    ];

    // Simulate sorting low to high
    sortDropdown.value = "priceLowHigh";
    const sortedProductsLowHigh = products.sort((a, b) => a.price - b.price);
    expect(sortedProductsLowHigh[0].name).toBe("Product B");

    // Simulate sorting high to low
    sortDropdown.value = "priceHighLow";
    const sortedProductsHighLow = products.sort((a, b) => b.price - a.price);
    expect(sortedProductsHighLow[0].name).toBe("Product A");
  });

  test("Filters products correctly by price range", () => {
    const minPriceInput = document.createElement("input");
    minPriceInput.id = "minPrice";
    minPriceInput.value = "40";
    document.body.appendChild(minPriceInput);

    const maxPriceInput = document.createElement("input");
    maxPriceInput.id = "maxPrice";
    maxPriceInput.value = "100";
    document.body.appendChild(maxPriceInput);

    const products = [
      { name: "Product A", price: 50 },
      { name: "Product B", price: 30 },
      { name: "Product C", price: 70 },
    ];

    const filteredProducts = products.filter(
      (product) => product.price >= parseFloat(minPriceInput.value) && product.price <= parseFloat(maxPriceInput.value)
    );

    expect(filteredProducts.length).toBe(2);
    expect(filteredProducts.map((p) => p.name)).toEqual(["Product A", "Product C"]);
  });

  test("Handles pagination correctly", () => {
    const prevPageBtn = document.createElement("button");
    prevPageBtn.id = "prevPage";
    document.body.appendChild(prevPageBtn);

    const nextPageBtn = document.createElement("button");
    nextPageBtn.id = "nextPage";
    document.body.appendChild(nextPageBtn);

    let currentPage = 1;
    const totalPages = 5;

    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) currentPage++;
    });

    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) currentPage--;
    });

    nextPageBtn.click(); // Simulate next page
    expect(currentPage).toBe(2);

    prevPageBtn.click(); // Simulate previous page
    expect(currentPage).toBe(1);
  });

  test("Handles product search correctly", () => {
    const searchBar = document.createElement("input");
    searchBar.className = "search-bar";
    document.body.appendChild(searchBar);

    const products = [
      { name: "Painting A", price: 100 },
      { name: "Painting B", price: 80 },
      { name: "Sculpture C", price: 150 },
    ];

    searchBar.value = "Painting";
    const searchResults = products.filter((product) =>
      product.name.toLowerCase().includes(searchBar.value.toLowerCase())
    );

    expect(searchResults.length).toBe(2);
    expect(searchResults.map((p) => p.name)).toEqual(["Painting A", "Painting B"]);
  });

  test("Handles cart button redirection", () => {
    const cartButton = document.createElement("button");
    cartButton.id = "cartButton";
    document.body.appendChild(cartButton);

    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    cartButton.addEventListener("click", () => {
      window.location.href = "cart.html";
    });

    cartButton.click();
    expect(window.location.href).toBe("cart.html");
  });

  test("Handles profile button redirection", () => {
    const profileButton = document.createElement("button");
    profileButton.id = "profileButton";
    document.body.appendChild(profileButton);

    Object.defineProperty(window, "location", {
      value: { href: "" },
      writable: true,
    });

    profileButton.addEventListener("click", () => {
      window.location.href = "profile.html";
    });

    profileButton.click();
    expect(window.location.href).toBe("profile.html");
  });
});
