
import fs from 'fs';
import path from 'path';
import { attachFormListeners } from './signInBuyer.js'; // ✅ Import code under test

describe('Buyer Login Page', () => {
  let html;

  beforeAll(() => {
    const htmlPath = path.resolve(__dirname, 'login-buyer.html'); 
    html = fs.readFileSync(htmlPath, 'utf-8');
  });

  beforeEach(() => {
    document.documentElement.innerHTML = html;
    attachFormListeners(); 
  });

  test('Loads the login form correctly', () => {
    expect(document.querySelector('h2')?.textContent).toBe('Login as a buyer');
    expect(document.querySelector('p.welcome-msg')?.textContent).toBe('Welcome back');
  });

  test('Has email and password fields', () => {
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');

    expect(emailInput).toBeTruthy();
    expect(passwordInput).toBeTruthy();
  });

  test('Login form submits and triggers event', () => {
    const form = document.querySelector('form');
    const emailInput = document.querySelector('#email');
    const passwordInput = document.querySelector('#password');

    emailInput.value = 'user@example.com';
    passwordInput.value = 'password123';

    const submitEvent = new Event('submit', { bubbles: true });
    const preventDefaultMock = jest.fn();
    submitEvent.preventDefault = preventDefaultMock;

    form.dispatchEvent(submitEvent);
    expect(preventDefaultMock).toHaveBeenCalled(); 
  });

  test('Forgot Password link is correct', () => {
    const link = document.querySelector('nav.options a');
    expect(link.getAttribute('href')).toBe('ForgotPaswword.html');
  });

  test('Google Sign In button triggers event', () => {
    const googleBtn = document.querySelector('#google-btn');
    const clickEvent = new Event('click', { bubbles: true });
    const preventDefaultMock = jest.fn();
    clickEvent.preventDefault = preventDefaultMock;

    googleBtn.dispatchEvent(clickEvent);
    expect(preventDefaultMock).toHaveBeenCalled();
  });

  test('Signup link goes to correct page', () => {
    const signupLink = document.querySelector('p.signup a');
    expect(signupLink.getAttribute('href')).toBe('../SignUp Folder/buyer-signup.html');
  });
});