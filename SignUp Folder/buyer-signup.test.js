/**
 * @jest-environment jsdom
 */
import '../../SignUp Folder/signUpBuyer';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

jest.mock("firebase/auth");
jest.mock("firebase/firestore");

// Helper to setup DOM elements
function setupDOM({
  email = "test@example.com",
  password = "Test@1234",
  confirmPassword = "Test@1234",
  termsChecked = true
} = {}) {
  document.body.innerHTML = `
    <input id="address" value="${email}" />
    <input id="password" type="password" value="${password}" />
    <input id="confirmPassword" type="password" value="${confirmPassword}" />
    <button id="register">Register</button>
    <button id="icon">Google Sign In</button>
    <input type="checkbox" id="termsCheckbox" ${termsChecked ? "checked" : ""} />
    <span id="eyeIcon" class="fa-eye"></span>
    <button id="togglePassword"></button>
  `;
}

beforeEach(() => {
  setupDOM(); // default
  jest.clearAllMocks();
});

test("should alert if terms are not accepted", () => {
  setupDOM({ termsChecked: false });
  const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
  document.getElementById("register").click();
  expect(alertMock).toHaveBeenCalledWith("Please accept the terms and conditions first.");
});

test("should alert if Firebase signup fails", async () => {
  createUserWithEmailAndPassword.mockRejectedValue(new Error("Email already in use"));
  const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
  await document.getElementById("register").click();
  expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Email already in use"));
});

test("should handle email verification wait", async () => {
  const reloadMock = jest.fn();
  const fakeUser = {
    uid: "123",
    email: "test@example.com",
    reload: reloadMock,
    emailVerified: false,
  };

  createUserWithEmailAndPassword.mockResolvedValue({ user: fakeUser });
  sendEmailVerification.mockResolvedValue();
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: "buyer" }) });
  setDoc.mockResolvedValue();

  jest.useFakeTimers(); // for setInterval

  const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
  await document.getElementById("register").click();

  // Simulate passage of time
  jest.advanceTimersByTime(10000);
  jest.useRealTimers();
  expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("verification email has been sent"));
});

test("should sign out if role is not buyer", async () => {
  const fakeUser = { uid: "123", email: "test@example.com", reload: jest.fn(), emailVerified: true };
  createUserWithEmailAndPassword.mockResolvedValue({ user: fakeUser });
  sendEmailVerification.mockResolvedValue();
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: "admin" }) });
  setDoc.mockResolvedValue();

  const signOutMock = jest.fn();
  getAuth.mockReturnValue({ signOut: signOutMock });

  const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
  await document.getElementById("register").click();

  expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Role verification failed"));
});

test("should handle Google login for existing buyer", async () => {
  const mockUser = { uid: "google123", email: "google@example.com" };
  signInWithPopup.mockResolvedValue({ user: mockUser });
  getDoc.mockResolvedValue({ exists: () => true, data: () => ({ role: "buyer" }) });

  const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
  const locationMock = jest.spyOn(window.location, "href", "set");

  await document.getElementById("icon").click();

  expect(alertMock).toHaveBeenCalledWith("Successfully signed up as a buyer!");
  expect(locationMock).toHaveBeenCalledWith(expect.stringContaining("buyer-username.html"));
});

test("should alert on Google sign-in failure", async () => {
  signInWithPopup.mockRejectedValue(new Error("Popup closed by user"));
  const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});
  await document.getElementById("icon").click();
  expect(alertMock).toHaveBeenCalledWith(expect.stringContaining("Popup closed by user"));
});

test("should toggle password visibility", () => {
  const toggleBtn = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");
  const eyeIcon = document.getElementById("eyeIcon");

  passwordInput.type = "password";
  toggleBtn.click(); // should toggle to text
  expect(passwordInput.type).toBe("text");
});
