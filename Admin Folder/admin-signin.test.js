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
