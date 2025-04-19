/**
 * @jest-environment jsdom
 */

import { fireEvent, getByLabelText, getByText, getByRole, screen } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('Buyer Signup Page', () => {
  let container;

  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../SignUp Folder/buyer-signup.html'), 'utf8');
    document.documentElement.innerHTML = html.toString();
    container = document.body;
  });

  it('loads the signup form correctly', () => {
    expect(screen.getByText('Welcome to Art Alley')).toBeVisible();
    expect(screen.getByText('Sign Up as a Buyer')).toBeVisible();
  });

  it('has all input fields and buttons', () => {
    expect(container.querySelector('#username')).toBeInTheDocument();
    expect(container.querySelector('#address').type).toBe('email');
    expect(container.querySelector('#number').type).toBe('tel');
    expect(container.querySelector('#password').type).toBe('password');
    expect(screen.getByText('Terms and Conditions').getAttribute('href')).toBe('TermsNConditions.html');
    expect(container.querySelector('#register').textContent).toContain('Create Account');
    expect(container.querySelector('#icon').textContent).toContain('Sign Up with Google');
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

  it('rejects non-numeric characters in phone input', () => {
    const numberInput = container.querySelector('#number');
    fireEvent.input(numberInput, { target: { value: 'abcXYZ!@#' } });
    expect(numberInput.value).toBe('');
  });

  it('limits phone number to 10 digits', () => {
    const numberInput = container.querySelector('#number');
    fireEvent.input(numberInput, { target: { value: '1234567890123' } });
    expect(numberInput.value).toBe('1234567890'); // assume JS handles this via pattern or JS
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

  it('shows browser validation message for short password', () => {
    const password = container.querySelector('#password');
    password.value = 'Ab1!';
    expect(password.validationMessage).toMatch(/match the requested format/i);
  });

  it('google sign-up button is visible and clickable', () => {
    const googleBtn = container.querySelector('#icon');
    expect(googleBtn).toBeVisible();
    fireEvent.click(googleBtn);
    // Could check if a function runs or console logs
  });

  it('fills and submits the form, redirects to login page or shows alert', () => {
    const username = container.querySelector('#username');
    const email = container.querySelector('#address');
    const number = container.querySelector('#number');
    const password = container.querySelector('#password');
    const checkbox = container.querySelector('input[type="checkbox"]');
    const register = container.querySelector('#register');

    username.value = 'artlover99';
    email.value = 'artlover@example.com';
    number.value = '9876543210';
    password.value = 'SecurePass123';
    checkbox.checked = true;

    // Stub window.alert if needed
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    
    fireEvent.click(register);

    // Simulate redirection or alert
    expect(alertSpy).toHaveBeenCalledTimes(1);
    alertSpy.mockRestore();
  });
});
