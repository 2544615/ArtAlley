
import { fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";

jest.mock("firebase/auth", () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));
jest.mock("firebase/firestore", () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(() => ({ path: "products" })),
  doc: jest.fn(() => ({ id: "mockProductId" })),
  setDoc: jest.fn(),
  serverTimestamp: jest.fn(() => "mockTimestamp"),
}));
jest.mock("axios", () => ({
  post: jest.fn(() =>
    Promise.resolve({
      data: { secure_url: "https://example.com/image.jpg" },
    })
  ),
}));

import { onAuthStateChanged } from "firebase/auth";
import { setDoc } from "firebase/firestore";
import axios from "axios";

describe("Add Product Page", () => {
  let userMock;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="product-form">
        <input id="productName" value="Test Product" />
        <input id="price" value="99.99" />
        <input id="quantity" value="5" />
        <textarea id="description">A test product</textarea>
        <input id="image" type="file" multiple />
        <input type="hidden" id="mainImageIndex" />
        <div id="preview-images"></div>
        <div id="select-main-text"></div>
        <button type="submit">Submit</button>
      </form>
      <button id="back-btn">Back</button>
    `;

    userMock = { uid: "user123" };
    jest.clearAllMocks();
  });

  it("redirects unauthenticated user to login", () => {
    window.alert = jest.fn();
    delete window.location;
    window.location = { href: "" };

    onAuthStateChanged.mockImplementationOnce((auth, cb) => cb(null));
    require("../add-products.js");

    expect(window.alert).toHaveBeenCalledWith("Please log in first.");
    expect(window.location.href).toBe("login-seller.html");
  });

  it("prevents submission if no image is selected", async () => {
    window.alert = jest.fn();
    onAuthStateChanged.mockImplementation((auth, cb) => cb(userMock));
    require("../add-products.js");

    const form = document.getElementById("product-form");
    const imageInput = document.getElementById("image");
    imageInput.files = [];

    await fireEvent.submit(form);

    expect(window.alert).toHaveBeenCalledWith("Please select an image.");
  });

  it("prevents submission if main image is not selected", async () => {
    window.alert = jest.fn();
    onAuthStateChanged.mockImplementation((auth, cb) => cb(userMock));
    require("../add-products.js");

    const file = new File(["dummy"], "dummy.png", { type: "image/png" });
    const imageInput = document.getElementById("image");
    Object.defineProperty(imageInput, "files", {
      value: [file],
    });

    const form = document.getElementById("product-form");
    await fireEvent.submit(form);

    expect(window.alert).toHaveBeenCalledWith("Please select a main image.");
  });

  it("uploads image and adds product to Firestore", async () => {
    window.alert = jest.fn();
    delete window.location;
    window.location = { href: "" };

    onAuthStateChanged.mockImplementation((auth, cb) => cb(userMock));
    require("../add-products.js");

    const file = new File(["dummy"], "dummy.png", { type: "image/png" });
    const imageInput = document.getElementById("image");
    Object.defineProperty(imageInput, "files", { value: [file] });

    const mainImageInput = document.getElementById("mainImageIndex");
    mainImageInput.value = 0;

    const form = document.getElementById("product-form");
    const imageChange = new Event("change");
    imageInput.dispatchEvent(imageChange);

    const module = await import("../add-products.js");
    const preview = document.getElementById("preview-images");
    preview.innerHTML = `<img src="#" style="border: 3px solid green;" />`;
    module.selectedMainImageIndex = 0;

    await fireEvent.submit(form);

    expect(axios.post).toHaveBeenCalled();
    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: "Test Product",
        price: 99.99,
        quantity: 5,
        description: "A test product",
        imageUrls: ["https://example.com/image.jpg"],
        mainImageUrl: "https://example.com/image.jpg",
        sellerUID: "user123",
        timestamp: "mockTimestamp",
      }),
      undefined
    );

    expect(window.alert).toHaveBeenCalledWith("Product added successfully!");
    expect(window.location.href).toBe("seller-dashboard.html");
  });
});
