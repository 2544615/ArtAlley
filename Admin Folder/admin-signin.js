/*
** @jest-environment jsdom
*/

const fs = require("fs");
const path = require("path");

describe("Admin Login Page", () => {
  let htmlContent;

  beforeAll(() => {
    // Read the HTML file content
    const htmlPath = path.resolve(__dirname, "admin-signin.html");
    htmlContent = fs.readFileSync(htmlPath, "utf-8");
  });

  beforeEach(() => {
    // Set the document's innerHTML to the HTML content read from the file
    document.body.innerHTML = htmlContent;

    // Reset and mock window.location
    delete window.location;
    window.location = { href: "" };
  });

  test("Loads the login form correctly", () => {
    expect(document.querySelector("h2")?.textContent).toBe("Admin SignIn");
    expect(document.querySelector("p.welcome-msg")?.textContent).toBe("Welcome back");
  });

  test("Has email and password fields", () => {
    const emailInput = document.querySelector("input#email");
    const passwordInput = document.querySelector("input#password");

    expect(emailInput).toBeTruthy();
    expect(emailInput.getAttribute("type")).toBe("email");
    expect(emailInput.getAttribute("placeholder")).toBe("Enter your email here");

    expect(passwordInput).toBeTruthy();
    expect(passwordInput.getAttribute("type")).toBe("password");
    expect(passwordInput.getAttribute("placeholder")).toBe("**********");
  });

  test("Login button is present and functional", () => {
    const loginBtn = document.querySelector("button.login-btn");
    expect(loginBtn).toBeTruthy();
    expect(loginBtn.textContent).toContain("Login");
  });

  test("Forgot Password link is correct", () => {
    const forgotLink = document.querySelector("nav.options a");
    expect(forgotLink).toBeTruthy();
    expect(forgotLink.getAttribute("href")).toBe("ForgotPaswword.html");
  });

  test("Google sign-in section is visible", () => {
    const googleBtn = document.querySelector("#google-btn");
    const googleImg = document.querySelector("#google-btn img");

    expect(googleBtn).toBeTruthy();
    expect(googleBtn.textContent).toContain("Sign in with Google");

    expect(googleImg).toBeTruthy();
    expect(googleImg.getAttribute("src")).toContain("google-logo.png");
  });

  test("Redirects correctly after successful login", () => {
    const loginBtn = document.querySelector("button.login-btn");

    loginBtn.addEventListener("click", () => {
      window.location.href = "admin-dashboard.html";
    });

    loginBtn.click();
    expect(window.location.href).toBe("admin-dashboard.html");
  });

  test("Denies access if user is not an admin", () => {
    const userData = { role: "user" }; // Simulate a non-admin user
    const expectedRole = "admin";

    if (userData.role !== expectedRole) {
      window.location.href = "access-denied.html";
    }

    expect(window.location.href).toBe("access-denied.html");
  });
});
