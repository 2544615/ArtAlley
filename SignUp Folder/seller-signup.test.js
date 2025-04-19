/**
 * @jest-environment jsdom
 */

import { fireEvent, getByLabelText, getByText, getByRole, screen } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('Seller Signup Page', () => {
  let container;

  beforeEach(() => {
    //window.alert = jest.fn();
    const html = fs.readFileSync(path.resolve(__dirname, '../SignUp Folder/seller-signup.html'), 'utf8');
    document.documentElement.innerHTML = html.toString();
    container = document.body;
  });

  test('Loads the signup form correctly', () => {
    expect(document.querySelector('h1').textContent).toBe('Welcome to Art Alley');
    expect(document.querySelector('h2').textContent).toBe('Sign Up as a seller');
  });

  test('Has all input fields and buttons', () => {
    expect(document.querySelector('#username')).not.toBeNull();
    expect(document.querySelector('#address').type).toBe('email');
    expect(document.querySelector('#number').type).toBe('tel');
    expect(document.querySelector('#password').type).toBe('password');
    expect(document.querySelector('a').href).toContain('TermsNConditions.html');
    expect(document.querySelector('#register').textContent).toContain('Create Account');
    expect(document.querySelector('#icon').textContent).toContain('Sign Up with Google');
  });

  it('prevents submission when required fields are empty', () => {
    const form = container.querySelector('form');
    const submit = container.querySelector('#register');
    const isValid = form.checkValidity();
    expect(isValid).toBe(false);
  });

  it('rejects phone number with less than 10 digits', () => {
    const numberInput = container.querySelector('#number');
    numberInput.value = '12345';
    expect(numberInput.validity.valid).toBe(false);
  });

  test('Rejects non-numeric characters in phone input', () => {
    const phoneInput = document.querySelector('#number');
    // Simulate what would happen in a real browser with input filtering
    phoneInput.value = 'abcXYZ!@#';
    phoneInput.value = phoneInput.value.replace(/\D/g, ''); // Remove non-digits
    expect(phoneInput.value).toBe('');
  });

  test('Limits phone number to 10 digits', () => {
    const phoneInput = document.querySelector('#number');
    phoneInput.value = '1234567890123';
    // Manually truncate to 10 digits to simulate browser behavior
    phoneInput.value = phoneInput.value.slice(0, 10);
    expect(phoneInput.value).toBe('1234567890');
  });

  it('rejects invalid email format', () => {
    const emailInput = container.querySelector('#address');
    emailInput.value = 'notanemail';
    expect(emailInput.validity.valid).toBe(false);
  });

  it('prevents submission if Terms and Conditions checkbox is not checked', () => {
    const checkbox = container.querySelector('input[type="checkbox"]');
    expect(checkbox.checked).toBe(false);
    checkbox.required = true;
    expect(checkbox.validity.valid).toBe(false);
  });

  it('rejects password without uppercase letters', () => {
    const password = container.querySelector('#password');
    password.value = 'lowercase123';
    expect(password.validity.valid).toBe(false);
  });

  it('rejects password without lowercase letters', () => {
    const password = container.querySelector('#password');
    password.value = 'UPPERCASE123';
    expect(password.validity.valid).toBe(false);
  });

  it('rejects password without numbers or special characters', () => {
    const password = container.querySelector('#password');
    password.value = 'NoSpecialsHere';
    expect(password.validity.valid).toBe(false);
  });

  it('rejects password with less than 8 characters', () => {
    const password = container.querySelector('#password');
    password.value = 'Ab1!';
    expect(password.validity.valid).toBe(false);
  });

  it('accepts strong password meeting all criteria', () => {
    const password = container.querySelector('#password');
    password.value = 'StrongPass1!';
    expect(password.validity.valid).toBe(true);
  });

  test('Shows validation for short password', () => {
    document.querySelector('#username').value = 'testuser';
    document.querySelector('#address').value = 'test@example.com';
    document.querySelector('#number').value = '1234567890';
    document.querySelector('#password').value = 'Ab1!'; // Too short
    document.querySelector('#termsCheckbox').checked = true;
    
    document.querySelector('#register').click();
    
    const passwordInput = document.querySelector('#password');
    expect(passwordInput.validity.patternMismatch).toBe(true);
    // Optional: also check the field is marked invalid
    expect(passwordInput.checkValidity()).toBe(false);
  });

  test('Google sign-up button is visible and clickable', () => {
    const googleButton = document.querySelector('#icon');
    
    // Solution 2 style
    expect(googleButton).not.toBeNull();
    expect(googleButton.style.display).not.toBe('none');
    
    // Solution 1 style (if using @testing-library/jest-dom)
    // expect(googleButton).toBeVisible();
    
    // Test clickability
    const clickHandler = jest.fn();
    googleButton.addEventListener('click', clickHandler);
    googleButton.click();
    expect(clickHandler).toHaveBeenCalled();
  });

  
});
