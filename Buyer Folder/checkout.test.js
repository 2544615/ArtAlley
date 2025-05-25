/**
 * @jest-environment jsdom
 */

import {
  initializeCheckout,
  handleCheckoutSubmit,
  loadCartItems,
  loadCountriesAndCities
} from './checkout.js';

// Import Jest globals
import { jest } from '@jest/globals';

// Mock Firebase modules
jest.mock('firebase/app', () => ({
  ...jest.requireActual('firebase/app'),
  initializeApp: jest.fn(),
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user' }
  })),
  onAuthStateChanged: jest.fn((auth, callback) => callback({ uid: 'test-user' }))
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  collection: jest.fn(),
  addDoc: jest.fn(() => Promise.resolve()),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(() => Promise.resolve({
    empty: false,
    docs: [{ 
      data: () => ({ 
        name: 'Test Product', 
        price: 100, 
        quantity: 2
      })
    }]
  })),
  serverTimestamp: jest.fn(),
  deleteDoc: jest.fn()
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ 
      data: [
        { name: 'South Africa' },
        { name: 'United States' }
      ] 
    }),
  })
);

describe("Checkout Page Functionality", () => {
  let originalWindowLocation;
  let originalLocalStorage;

  beforeAll(() => {
    // Mock window.location
    originalWindowLocation = window.location;
    delete window.location;
    window.location = { href: '' };

    // Mock localStorage
    originalLocalStorage = window.localStorage;
    window.localStorage = {
      setItem: jest.fn(),
      getItem: jest.fn()
    };

    // Mock alert
    window.alert = jest.fn();
  });

  afterAll(() => {
    window.location = originalWindowLocation;
    window.localStorage = originalLocalStorage;
    jest.clearAllMocks();
    localStorage.clear();
  });

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="form2">
        <input id="firstname" value="John">
        <input id="lastname" value="Doe">
        <select id="country"></select>
        <select id="city"></select>
        <textarea id="address">123 Main St</textarea>
        <input id="email" value="john@example.com">
        <input id="contact" value="1234567890">
        <textarea id="note">Test note</textarea>
      </form>
      <section id="cart-items"></section>
    `;
  });

  test("initializeCheckout sets up event listeners", () => {
    initializeCheckout();
    const firebase = require('firebase/app');
    expect(firebase.onAuthStateChanged).toHaveBeenCalled();
  });

  test("handleCheckoutSubmit processes form data correctly", async () => {
    const mockUser = { uid: 'test-user' };
    await handleCheckoutSubmit(mockUser, 200);

    const firestore = require('firebase/firestore');
    expect(firestore.addDoc).toHaveBeenCalled();
    expect(window.localStorage.setItem).toHaveBeenCalledWith("checkoutAmount", "200.00");
    expect(window.location.href).toBe("paystack.html");
  });

  test("loadCartItems displays cart items and calculates total", async () => {
    const mockUser = { uid: 'test-user' };
    const total = await loadCartItems(mockUser);

    expect(total).toBe(200);
    const cartItemsSection = document.getElementById("cart-items");
    expect(cartItemsSection.innerHTML).toContain("Test Product");
    expect(cartItemsSection.innerHTML).toContain("R200.00");
  });

  test("loadCountriesAndCities sets up country/city selection", async () => {
    loadCountriesAndCities();
    
    await Promise.resolve(); // Allow fetch to complete
    
    const countrySelect = document.getElementById("country");
    expect(countrySelect.innerHTML).toContain("option");
    expect(fetch).toHaveBeenCalledWith("https://countriesnow.space/api/v0.1/countries/positions ");
  });

  test("handles form submission with empty cart", async () => {
    const firestore = require('firebase/firestore');
    firestore.getDocs.mockResolvedValueOnce({ empty: true });
    
    const mockUser = { uid: 'test-user' };
    const total = await loadCartItems(mockUser);
    
    expect(total).toBe(0);
    const cartItemsSection = document.getElementById("cart-items");
    expect(cartItemsSection.innerHTML).toContain("Your cart is empty");
  });
});