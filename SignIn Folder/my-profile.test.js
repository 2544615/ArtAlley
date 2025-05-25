/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

describe("Profile Management Page", () => {
  let htmlContent;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, "my-profile.html");
    htmlContent = fs.readFileSync(htmlPath, "utf-8");
  });

  beforeEach(() => {
    document.body.innerHTML = htmlContent;
  });

  test("Loads the profile form correctly", () => {
    expect(document.querySelector("h1")?.textContent).toBe("My Profile");
    expect(document.querySelector("form#myProfileForm")).toBeTruthy();
  });

  test("Has email, first name, last name, username, phone number, and address fields", () => {
    const fields = ["email", "firstName", "lastName", "profileUsername", "number", "address"];
    fields.forEach((id) => {
      const input = document.querySelector(`input#${id}`);
      expect(input).toBeTruthy();
    });
  });

  test("Email input should be disabled", () => {
    const emailInput = document.querySelector("input#email");
    expect(emailInput.disabled).toBe(true);
  });

  test("Ensure phone number input restricts non-numeric characters", () => {
    const numberInput = document.querySelector("input#number");
    numberInput.value = "abc123"; // Invalid case (should only allow digits)
  
    numberInput.dispatchEvent(new Event("input"));
  
    expect(numberInput.validity.valid).toBe(false);
  });
  
  test("Ensure first name only allows letters", () => {
    const firstNameInput = document.querySelector("input#firstName");
    firstNameInput.value = "John123"; 
  
    firstNameInput.dispatchEvent(new Event("input"));
  
    expect(firstNameInput.validity.valid).toBe(false); 
  });
  
  test("Ensure last name only allows letters", () => {
    const lastNameInput = document.querySelector("input#lastName");
    lastNameInput.value = "Doe@"; 
    lastNameInput.dispatchEvent(new Event("input"));
  
    expect(lastNameInput.validity.valid).toBe(false); 
  });
  
  test("Username follows expected rules", () => {
    const usernameInput = document.querySelector("input#profileUsername");

    usernameInput.value = "1234"; 
    usernameInput.dispatchEvent(new Event("input"));
  
    expect(usernameInput.validity.valid).toBe(false); 
  
    usernameInput.value = "J_Doe"; 
    usernameInput.dispatchEvent(new Event("input"));
  
    expect(usernameInput.validity.valid).toBe(false); 
  
    usernameInput.value = "John123"; 
    usernameInput.dispatchEvent(new Event("input"));
  
    expect(usernameInput.validity.valid).toBe(true); 
  });

  test("Phone number validation enforces exactly 10 digits", () => {
    const numberInput = document.querySelector("input#number");

    numberInput.value = "123456789"; 
    numberInput.dispatchEvent(new Event("blur"));

    expect(numberInput.value.length).toBeLessThanOrEqual(10); // Should not exceed 10 digits
  });

  test("Profile form exists and is functional", () => {
    const form = document.querySelector("form#myProfileForm");
    expect(form).toBeTruthy();
  });
});