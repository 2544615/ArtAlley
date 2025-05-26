/**
 * @jest-environment jsdom
 */

import { jest } from "@jest/globals";

// Mock Firebase modules
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("firebase/auth", () => {
  return {
    getAuth: jest.fn(() => ({
      currentUser: { uid: "testUser" },
    })),
    onAuthStateChanged: (auth, callback) => callback({ uid: "testUser" }),
  };
});

jest.mock("firebase/firestore", () => {
  const mockData = {
    role: "buyer",
  };

  return {
    getFirestore: jest.fn(() => ({})),
    doc: jest.fn(() => ({})),
    getDoc: jest.fn(() =>
      Promise.resolve({
        exists: () => true,
        data: () => mockData,
      })
    ),
    collection: jest.fn(() => ({})),
    addDoc: jest.fn(() => Promise.resolve()),
    getDocs: jest.fn(() =>
      Promise.resolve({
        empty: false,
        forEach: (cb) =>
          cb({
            data: () => ({
              name: "Sample Item",
              quantity: 2,
              price: 50,
            }),
          }),
  })
    ),
    serverTimestamp: jest.fn(() => "mocked-timestamp"),
  };
});

// Setup DOM mocks
document.body.innerHTML = `
  <section id="cart-items"></section>
  <button id="deliver">Deliver</button>
  <button id="collect1">Collect</button>
`;

Object.defineProperty(window, "location", {
  writable: true,
  value: { href: "" },
});

describe("Checkout and Delivery Tests", () => {
  beforeAll(async () => {
    // Dynamically import your actual code file
    await import("./your-checkoutdelivery-file.js");
  });

  it("should redirect to checkoutdelivery.html when Delivery is clicked", async () => {
    document.getElementById("deliver").click();

    await new Promise((r) => setTimeout(r, 100)); // Wait for event loop

    expect(window.location.href).toBe("checkoutdelivery.html");
  });

  it("should redirect to paystack.html when Collection is clicked", async () => {
    document.getElementById("collect1").click();

    await new Promise((r) => setTimeout(r, 100)); // Wait for event loop

    expect(window.location.href).toBe("paystack.html");
  });

  it("should display cart items and total", async () => {
    const cartItems = document.getElementById("cart-items");
    expect(cartItems.innerHTML).toContain("Sample Item");
    expect(cartItems.innerHTML).toContain("R100.00"); // 2 * 50
  });
});