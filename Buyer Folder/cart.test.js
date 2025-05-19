/**
 * @jest-environment jsdom
 */

import {
  addToCart,
  getCart,
  updateCartUI,
} from "./Carts.js";

jest.mock("https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js", () => ({
  initializeApp: jest.fn(),
}));

jest.mock("https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js", () => {
  const user = { uid: "testUser" };
  return {
    getAuth: jest.fn(() => ({
      currentUser: user,
    })),
    onAuthStateChanged: jest.fn((auth, callback) => callback(user)),
  };
});

jest.mock("https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js", () => {
  let mockCart = [];

  return {
    getFirestore: jest.fn(),
    doc: jest.fn(() => ({})),
    getDoc: jest.fn(() => Promise.resolve({ exists: () => false })),
    setDoc: jest.fn(() => Promise.resolve()),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
    addDoc: jest.fn((_, item) => {
      mockCart.push(item);
      return Promise.resolve();
    }),
    collection: jest.fn(() => ({})),
    query: jest.fn(() => ({})),
    where: jest.fn(() => ({})),
    getDocs: jest.fn(() => Promise.resolve({
      empty: true,
      docs: [],
      forEach: (cb) => mockCart.forEach((doc) => cb({ data: () => doc })),
    })),
  };
});

describe("Cart functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("addToCart adds item to cart", async () => {
    const testProduct = {
      name: "Test Painting",
      price: 100,
      quantity: 5,
      imageUrls: ["https://example.com/image.jpg"],
    };

    await addToCart(testProduct);

    const cart = getCart();
    expect(cart.length).toBeGreaterThan(0);
    expect(cart[0].name).toBe("Test Painting");
    expect(cart[0].quantity).toBe(1);
  });
});