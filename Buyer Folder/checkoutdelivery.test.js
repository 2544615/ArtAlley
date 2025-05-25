/**
 * @jest-environment jsdom
 */

// Import testing utilities
import { fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom/extend-expect";

// Import module under test
import './checkoutdelivery.js';

// Mock Firebase modules
jest.mock("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js ", () => ({
  initializeApp: jest.fn(() => ({})),
}));

jest.mock("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js ", () => ({
  getFirestore: jest.fn(() => ({})),
  doc: jest.fn(),
  getDoc: jest.fn(() => Promise.resolve({ exists: () => true, data: () => ({ role: "buyer" }) })),
  collection: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({
    empty: false,
    forEach: (cb) => {
      cb({ data: () => ({ name: "Painting", price: 100, quantity: 2 }) });
    },
  })),
  addDoc: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(() => "MOCK_TIMESTAMP"),
}));

jest.mock("https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js ", () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn((auth, cb) => {
    cb({ uid: "test-user-id" }); // simulate logged-in user
  }),
}));

describe("Checkout Delivery Page", () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="form2">
        <input id="firstname" value="John" />
        <input id="contact" value="1234567890" />
        <input id="email" value="john@example.com" />
        <input id="address" value="123 Street" />
        <input id="complex" value="Complex A" />
        <input id="suburb" value="Suburb B" />
        <input id="city" value="City C" />
        <input id="code" value="1000" />
        <input id="province" />
        <input id="note" value="Leave at gate" />
        <button type="submit">Submit</button>
      </form>
      <section id="cart-items"></section>
    `;
    localStorage.clear();
    jest.resetModules(); // ensure fresh execution
  });

  test("Cart items and total are rendered correctly", async () => {
    const cartItems = document.getElementById("cart-items");
    expect(cartItems).toBeInTheDocument();
    expect(cartItems.textContent).toContain("2x Painting");
    expect(cartItems.textContent).toContain("R200.00");
  });

  test("Form submission saves delivery info and redirects", async () => {
    delete window.location;
    window.location = { href: "" };

    const form = document.getElementById("form2");
    fireEvent.submit(form);

    // Wait for promises
    await new Promise(process.nextTick);

    expect(localStorage.getItem("checkoutAmount")).toBe("200.00");
    expect(localStorage.getItem("checkoutEmail")).toBe("john@example.com");
    expect(window.location.href).toBe("paystack.html");
  });
});