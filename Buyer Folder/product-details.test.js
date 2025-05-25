/**
 * @jest-environment jsdom
 */

// Import modules using ESM syntax
import { loadProductDetails } from './productDetails.js';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addToCart } from './Carts.js';

// Mock Firebase modules
jest.mock("firebase/app", () => ({
  initializeApp: jest.fn()
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn()
}));

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
  signInAnonymously: jest.fn()
}));

jest.mock('./Carts.js', () => ({
  addToCart: jest.fn()
}));

describe("Product Details Page", () => {
  let mockDocSnap;

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="productName"></div>
      <div id="productPrice"></div>
      <div id="productDescription"></div>
      <div id="imageGallery"></div>
      <button id="addToCartBtn">Add to Cart</button>
    `;

    localStorage.setItem("selectedProductId", "mockProductId");

    mockDocSnap = {
      exists: () => true,
      data: () => ({
        name: "Mock Product",
        price: 99.99,
        description: "A great product",
        imageUrls: ["https://example.com/image1.jpg "]
      })
    };

    doc.mockReturnValue("mockDocRef");
    getDoc.mockResolvedValue(mockDocSnap);
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("loads and renders product details", async () => {
    await loadProductDetails();

    expect(doc).toHaveBeenCalledWith(expect.anything(), "products", "mockProductId");
    expect(getDoc).toHaveBeenCalledWith("mockDocRef");

    expect(document.getElementById("productName").textContent).toBe("Mock Product");
    expect(document.getElementById("productPrice").textContent).toBe("Price: R99.99");
    expect(document.getElementById("productDescription").textContent).toBe("A great product");

    const gallery = document.getElementById("imageGallery");
    expect(gallery.children.length).toBe(1);
    expect(gallery.querySelector("img").src).toBe("https://example.com/image1.jpg ");
  });

  it("handles missing productId in localStorage", async () => {
    localStorage.removeItem("selectedProductId");

    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    await loadProductDetails();

    expect(alertMock).toHaveBeenCalledWith("No product selected.");
    alertMock.mockRestore();
  });

  it("handles missing document in Firestore", async () => {
    mockDocSnap.exists = () => false;
    getDoc.mockResolvedValue(mockDocSnap);

    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    await loadProductDetails();

    expect(alertMock).toHaveBeenCalledWith("Product not found.");
    alertMock.mockRestore();
  });

  it("calls addToCart when 'Add to Cart' is clicked", async () => {
    await loadProductDetails();

    const button = document.getElementById("addToCartBtn");
    button.click();

    expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({
      name: "Mock Product",
      price: 99.99
    }));
  });

  it("handles Firestore fetch error", async () => {
    getDoc.mockRejectedValue(new Error("Firestore error"));

    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
    await loadProductDetails();

    expect(alertMock).toHaveBeenCalledWith("Failed to load product details.");
    alertMock.mockRestore();
  });
});