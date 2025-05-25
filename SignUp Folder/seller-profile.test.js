/**
 * @jest-environment jsdom
 */
import { fireEvent, getByLabelText, getByRole } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { getDoc, getDocs, setDoc, doc, collection, query, where } from 'firebase/firestore';

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
}));

describe("Seller Profile Form", () => {
  let mockUser;
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
      <form id="profileForm">
        <input id="firstName" value="Jane" />
        <input id="lastName" value="Doe" />
        <input id="profileUsername" />
        <input id="number" value="1234567890" />
        <input id="address" value="123 Street" />
        <button type="submit">Submit</button>
      </form>
    `;

    container = document.body;

    mockUser = {
      uid: 'user123',
      email: 'jane@example.com',
    };

    // Simulate Firebase Auth callback
    onAuthStateChanged.mockImplementation((auth, cb) => cb(mockUser));
  });

  it("shows alert if username is only numbers", async () => {
    window.alert = jest.fn();
    require('../seller-profile.js');

    const usernameInput = document.getElementById("profileUsername");
    usernameInput.value = "12345";

    const form = document.getElementById("profileForm");
    fireEvent.submit(form);

    expect(window.alert).toHaveBeenCalledWith("Username cannot consist of numbers only.");
  });

  it("shows alert for invalid username pattern", async () => {
    window.alert = jest.fn();
    require('../seller-profile.js');

    const usernameInput = document.getElementById("profileUsername");
    usernameInput.value = "1abc";

    const form = document.getElementById("profileForm");
    fireEvent.submit(form);

    expect(window.alert).toHaveBeenCalledWith("Username must be at least 4 characters, start with a letter, and contain only letters and numbers.");
  });

  it("alerts if username is already taken", async () => {
    window.alert = jest.fn();
    const mockQuerySnapshot = {
      forEach: (cb) => cb({ id: 'anotherUser123' }), // simulate another user with same username
    };

    getDocs.mockResolvedValueOnce(mockQuerySnapshot);

    require('../seller-profile.js');
    document.getElementById("profileUsername").value = "validUser";

    const form = document.getElementById("profileForm");
    await fireEvent.submit(form);

    expect(window.alert).toHaveBeenCalledWith("This username is already taken by another seller. Please choose another one.");
  });

  it("submits valid form and updates Firestore", async () => {
    window.alert = jest.fn();
    delete window.location;
    window.location = { href: "" };

    const mockQuerySnapshot = { forEach: () => {} };
    getDocs.mockResolvedValueOnce(mockQuerySnapshot);

    setDoc.mockResolvedValueOnce(); // simulate success

    require('../seller-profile.js');
    document.getElementById("profileUsername").value = "validUsername";

    const form = document.getElementById("profileForm");
    await fireEvent.submit(form);

    expect(setDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        uid: mockUser.uid,
        email: mockUser.email,
        firstName: "Jane",
        lastName: "Doe",
        username: "validUsername",
        phone: "1234567890",
        address: "123 Street",
        role: "seller",
      }),
      { merge: true }
    );

    expect(window.alert).toHaveBeenCalledWith("Profile setup successful!");
    expect(window.location.href).toBe("../SignIn Folder/seller-dashboard.html");
  });

  it("redirects if user not logged in", async () => {
    onAuthStateChanged.mockImplementationOnce((auth, cb) => cb(null));
    delete window.location;
    window.location = { href: "" };
    window.alert = jest.fn();

    require('../seller-profile.js');
    expect(window.alert).toHaveBeenCalledWith("User not logged in. Redirecting to login page.");
    expect(window.location.href).toBe("../SignIn Folder/login-seller.html");
  });
});
