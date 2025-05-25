/**
 * @jest-environment jsdom
 */

// Import Jest globals
import { jest } from "@jest/globals";

// Mocks for PaystackPop global
global.PaystackPop = {
  setup: jest.fn(() => ({
    openIframe: jest.fn(),
  })),
};

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => (store[key] = value)),
    clear: jest.fn(() => (store = {})),
  };
})();
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock window.location
Object.defineProperty(window, "location", {
  writable: true,
  value: { href: "" },
});

// DOM Setup
beforeEach(() => {
  document.body.innerHTML = `
    <form id="paymentForm">
      <input type="text" id="email-address" />
      <input type="text" id="amount" />
      <input type="text" id="cardHolder" />
      <button type="submit">Pay</button>
    </form>
  `;
});

// Firebase mocks
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(() => ({
    currentUser: { uid: "testUser" },
  })),
  onAuthStateChanged: jest.fn((auth, callback) =>
    callback({ uid: "testUser" })
  ),
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(() => ({})),
  collection: jest.fn(() => ({})),
  getDocs: jest.fn(() =>
    Promise.resolve({
      empty: false,
      forEach: (cb) =>
        cb({
          data: () => ({
            name: "Sample Product",
            price: 50,
            quantity: 2,
          }),
        }),
    })
  ),
  serverTimestamp: jest.fn(() => "mocked-timestamp"),
  addDoc: jest.fn(() => Promise.resolve()),
  setDoc: jest.fn(() => Promise.resolve()),
  updateDoc: jest.fn(() => Promise.resolve()),
  getDoc: jest.fn(() =>
    Promise.resolve({
      exists: () => true,
      data: () => ({
        sellerUID: "seller123",
        quantity: 10,
      }),
    })
  ),
  increment: jest.fn(() => -2),
  writeBatch: jest.fn(() => ({
    delete: jest.fn(),
    commit: jest.fn(() => Promise.resolve()),
  })),
}));

describe("Paystack Payment Flow", () => {
  let openIframeMock;

  beforeEach(async () => {
    openIframeMock = jest.fn();

    PaystackPop.setup.mockReturnValueOnce({
      openIframe: openIframeMock,
    });

    localStorage.getItem.mockImplementation((key) => {
      if (key === "checkoutEmail") return "test@example.com";
      if (key === "checkoutAmount") return "100";
      return null;
    });

    // Dynamically import the actual JS file
    await import("./paystack.js");
  });

  it("should populate inputs from localStorage on DOMContentLoaded", () => {
    expect(document.getElementById("email-address").value).toBe("test@example.com");
    expect(document.getElementById("amount").value).toBe("100");
  });

  it("should sanitize cardHolder input to only letters and spaces", () => {
    const input = document.getElementById("cardHolder");
    input.value = "John123 Doe!";
    input.dispatchEvent(new Event("input"));
    expect(input.value).toBe("John Doe");
  });

  it("should call PaystackPop.setup and open the payment iframe on form submit", () => {
    const form = document.getElementById("paymentForm");
    form.dispatchEvent(new Event("submit"));
    expect(PaystackPop.setup).toHaveBeenCalled();
    expect(openIframeMock).toHaveBeenCalled();
  });

  it("should attach event listener to form submit", () => {
    const form = document.getElementById("paymentForm");

    // Helper to access event listeners (requires jsdom)
    const eventListeners = form._events; // This may vary depending on how events are attached
    expect(eventListeners).toBeDefined();
  });
});