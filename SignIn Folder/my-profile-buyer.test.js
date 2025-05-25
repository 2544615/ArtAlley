/**
 * @jest-environment jsdom
 */

import { jest } from "@jest/globals";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";

// Mock Firebase modules
jest.mock("firebase/auth", () => {
  return {
    getAuth: jest.fn(),
    onAuthStateChanged: jest.fn()
  };
});

jest.mock("firebase/firestore", () => {
  const mockSetDoc = jest.fn();
  return {
    getFirestore: jest.fn(),
    doc: jest.fn(),
    getDoc: jest.fn(),
    setDoc: mockSetDoc,
    collection: jest.fn(),
    query: jest.fn(),
    where: jest.fn(),
    getDocs: jest.fn(),
  };
});

// Create required DOM elements
function setupDOM() {
  document.body.innerHTML = `
    <form id="myProfileForm"></form>
    <input id="email" />
    <input id="firstName" />
    <input id="lastName" />
    <input id="profileUsername" />
    <input id="number" />
    <input id="address" />
    <button id="back-btn">Back</button>
  `;
}

describe("Buyer Profile Page Tests", () => {
  let mockUser, mockUserData;

  beforeEach(() => {
    jest.clearAllMocks();
    setupDOM();

    mockUser = { uid: "123" };
    mockUserData = {
      email: "test@example.com",
      firstName: "John",
      lastName: "Doe",
      username: "john_doe",
      phone: "0123456789",
      address: "123 Street",
      role: "buyer",
    };

    // Simulate getDoc returning user data
    getDoc.mockResolvedValue({
      exists: () => true,
      data: () => mockUserData
    });

    // Simulate getDocs returning no conflicting usernames
    getDocs.mockResolvedValue({
      forEach: jest.fn()
    });

    // Auth mock
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
    });

    // Load module under test
    return import("./my-profile-buyer.js");
  });

  test("should populate form with user data on auth", async () => {
    const email = document.getElementById("email");
    const firstName = document.getElementById("firstName");
    const lastName = document.getElementById("lastName");

    await new Promise((r) => setTimeout(r, 50)); // wait for async

    expect(email.value).toBe(mockUserData.email);
    expect(firstName.value).toBe(mockUserData.firstName);
    expect(lastName.value).toBe(mockUserData.lastName);
  });

  test("should reject invalid phone number", () => {
    const numberInput = document.getElementById("number");
    numberInput.value = "123";
    numberInput.dispatchEvent(new Event("input"));
    expect(numberInput.validationMessage).toBe("Phone number must be exactly 10 digits.");
  });

  test("should accept valid phone number", () => {
    const numberInput = document.getElementById("number");
    numberInput.value = "0123456789";
    numberInput.dispatchEvent(new Event("input"));
    expect(numberInput.validationMessage).toBe("");
  });

  test("should reject username starting with a number", () => {
    const usernameInput = document.getElementById("profileUsername");
    usernameInput.value = "123john";
    usernameInput.dispatchEvent(new Event("input"));
    expect(usernameInput.validationMessage).toContain("Username must start with a letter");
  });

  test("should auto-save changes to Firestore", async () => {
    const firstName = document.getElementById("firstName");
    firstName.value = "Jane";
    firstName.dataset.editable = "true";

    firstName.dispatchEvent(new Event("click"));
    firstName.dispatchEvent(new Event("blur"));

    await new Promise((r) => setTimeout(r, 50));
    expect(setDoc).toHaveBeenCalledWith(expect.anything(), { firstName: "Jane" }, { merge: true });
  });

  test("should redirect if not authenticated", async () => {
    onAuthStateChanged.mockImplementationOnce((auth, callback) => {
      callback(null);
    });

    delete window.location;
    window.location = { href: "" };

    await import("./my-profile-buyer.js");

    expect(window.location.href).toContain("login-buyer.html");
  });

  test("should alert if username already taken", async () => {
    const mockForEach = jest.fn(cb => cb({ id: "456" }));
    getDocs.mockResolvedValueOnce({ forEach: mockForEach });

    const usernameInput = document.getElementById("profileUsername");
    usernameInput.value = "takenname";
    usernameInput.dataset.editable = "true";

    window.alert = jest.fn();

    usernameInput.dispatchEvent(new Event("click"));
    await usernameInput.dispatchEvent(new Event("blur"));

    expect(window.alert).toHaveBeenCalledWith("This username is already taken by another buyer.");
  });
});
