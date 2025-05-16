/**
 * @jest-environment jsdom
 */

//const fs = require('fs');
//const path = require('path');
const { handleLogin, handleGoogleLogin, initAuth } = require('./admin-signin.js');

// jest.setup.js or top of your test file


// Mock Firebase/auth and other external dependencies
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { email: 'admin@example.com' } })
  ),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(() =>
    Promise.resolve({ user: { email: 'admin@example.com' } })
  ),
  onAuthStateChanged: jest.fn(),
}));

describe('Admin Login Page', () => {
  let auth;
  let originalWindowLocation;

  beforeAll(() => {
    // Load HTML
    const htmlPath = path.resolve(__dirname, 'admin-signin.html');
    document.body.innerHTML = fs.readFileSync(htmlPath, 'utf-8');

    // Initialize auth
    auth = initAuth();

    // Mock window.location
    originalWindowLocation = window.location;
    delete window.location;
    window.location = { href: '' };
  });

  afterAll(() => {
    window.location = originalWindowLocation;
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    window.location.href = '';
  });

  // DOM Structure Tests
  describe('DOM Structure', () => {
    test('Loads the login form correctly', () => {
      expect(document.querySelector('h2')?.textContent).toBe('Admin SignIn');
      expect(document.querySelector('p.welcome-msg')?.textContent).toBe('Welcome back');
    });

    test('Has email and password fields', () => {
      const emailInput = document.querySelector('input#email');
      const passwordInput = document.querySelector('input#password');

      expect(emailInput).toBeTruthy();
      expect(emailInput?.getAttribute('type')).toBe('email');
      expect(emailInput?.getAttribute('placeholder')).toBe('Enter your email here');

      expect(passwordInput).toBeTruthy();
      expect(passwordInput?.getAttribute('type')).toBe('password');
      expect(passwordInput?.getAttribute('placeholder')).toBe('**********');
    });

    test('Login button is present', () => {
      const loginBtn = document.querySelector('button.login-btn');
      expect(loginBtn).toBeTruthy();
      expect(loginBtn?.textContent).toContain('Login');
    });

    test('Forgot Password link is correct', () => {
      const forgotLink = document.querySelector('nav.options a');
      expect(forgotLink).toBeTruthy();
      expect(forgotLink?.getAttribute('href')).toBe('ForgotPaswword.html');
    });

    test('Google sign-in button is visible', () => {
      const googleBtn = document.querySelector('#google-btn');
      const googleImg = document.querySelector('#google-btn img');

      expect(googleBtn).toBeTruthy();
      expect(googleBtn?.textContent).toContain('Sign in with Google');
      expect(googleImg?.getAttribute('src')).toContain('google-logo.png');
    });
  });

  // Functionality Tests
  describe('Login Functionality', () => {
    test('Successful email/password login redirects to dashboard', async () => {
      const emailInput = document.querySelector('#email');
      const passwordInput = document.querySelector('#password');
      const loginButton = document.querySelector('.login-btn');

      emailInput.value = 'admin@example.com';
      passwordInput.value = 'password123';

      // Simulate button click
      const clickEvent = new Event('click');
      loginButton.dispatchEvent(clickEvent);

      // Wait for async operations
      await Promise.resolve();

      expect(window.location.href).toBe('admin-dashboard.html');
    });

    test('Failed login shows error message', async () => {
      // Mock failed login
      require('firebase/auth').signInWithEmailAndPassword.mockImplementationOnce(() =>
        Promise.reject(new Error('Invalid credentials'))
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const emailInput = document.querySelector('#email');
      const passwordInput = document.querySelector('#password');
      const loginButton = document.querySelector('.login-btn');

      emailInput.value = 'wrong@example.com';
      passwordInput.value = 'wrongpass';

      const clickEvent = new Event('click');
      loginButton.dispatchEvent(clickEvent);

      await Promise.resolve();

      expect(consoleSpy).toHaveBeenCalledWith('Login error:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    test('Empty fields prevent login', () => {
      const emailInput = document.querySelector('#email');
      const passwordInput = document.querySelector('#password');
      const loginButton = document.querySelector('.login-btn');

      emailInput.value = '';
      passwordInput.value = '';

      const clickEvent = new Event('click');
      loginButton.dispatchEvent(clickEvent);

      expect(require('firebase/auth').signInWithEmailAndPassword).not.toHaveBeenCalled();
    });
  });

  describe('Google Sign-In', () => {
    test('Successful Google sign-in redirects to dashboard', async () => {
      const googleButton = document.querySelector('#google-btn');

      const clickEvent = new Event('click');
      googleButton.dispatchEvent(clickEvent);

      await Promise.resolve();

      expect(require('firebase/auth').signInWithPopup).toHaveBeenCalled();
      expect(window.location.href).toBe('admin-dashboard.html');
    });

    test('Failed Google sign-in shows error', async () => {
      require('firebase/auth').signInWithPopup.mockImplementationOnce(() =>
        Promise.reject(new Error('Popup closed'))
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const googleButton = document.querySelector('#google-btn');

      const clickEvent = new Event('click');
      googleButton.dispatchEvent(clickEvent);

      await Promise.resolve();

      expect(consoleSpy).toHaveBeenCalledWith('Google sign-in error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Access Control', () => {
    test('Non-admin users are redirected to access-denied', async () => {
      // Mock non-admin user
      require('firebase/auth').signInWithEmailAndPassword.mockImplementationOnce(() =>
        Promise.resolve({ user: { email: 'user@example.com' } })
      );

      const emailInput = document.querySelector('#email');
      const passwordInput = document.querySelector('#password');
      const loginButton = document.querySelector('.login-btn');

      emailInput.value = 'user@example.com';
      passwordInput.value = 'password123';

      const clickEvent = new Event('click');
      loginButton.dispatchEvent(clickEvent);

      await Promise.resolve();

      expect(window.location.href).toBe('access-denied.html');
    });
  });
});
