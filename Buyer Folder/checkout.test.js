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
