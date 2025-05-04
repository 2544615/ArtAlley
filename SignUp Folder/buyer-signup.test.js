/**
 * @jest-environment jsdom
 */

describe('Buyer Signup Page', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `
        <h1>Welcome to ArtAlley</h1>
        <h2>Sign Up as a Buyer</h2>
        <form>
          <input id="address" type="email" required>
          <input id="password" type="password" 
                 pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[\\d\\W]).{8,}$" 
                 required>
          <input id="confirmPassword" type="password" required>
          <input type="checkbox" id="termsCheckbox" required>
          <button id="register" type="submit">Create Account</button>
          <a href="TermsNConditions.html">Terms & Conditions</a>
          <div id="icon">Sign Up with Google</div>
        </form>
    `;
    container = document.body;
  });

  test('Loads the signup form correctly', () => {
    expect(document.querySelector('h1').textContent).toBe('Welcome to ArtAlley');
    expect(document.querySelector('h2').textContent).toBe('Sign Up as a Buyer');
  });

  test('Has all input fields and buttons', () => {
    expect(document.querySelector('#address')).not.toBeNull();
    expect(document.querySelector('#password')).not.toBeNull();
    expect(document.querySelector('#confirmPassword')).not.toBeNull();
    expect(document.querySelector('#address').type).toBe('email');
    expect(document.querySelector('#password').type).toBe('password');
    expect(document.querySelector('a').href).toContain('TermsNConditions.html');
    expect(document.querySelector('#register').textContent).toContain('Create Account');
    expect(document.querySelector('#icon').textContent).toContain('Sign Up with Google');
  });

  test('prevents submission when required fields are empty', () => {
    const form = container.querySelector('form');
    expect(form.checkValidity()).toBe(false);
  });

  test('rejects invalid email format', () => {
    const emailInput = container.querySelector('#address');
    emailInput.value = 'notanemail';
    expect(emailInput.validity.valid).toBe(false);
  });

  test('prevents submission if Terms and Conditions checkbox is not checked', () => {
    const checkbox = container.querySelector('#termsCheckbox');
    expect(checkbox.checked).toBe(false);
    expect(checkbox.validity.valid).toBe(false);
  });

  test('rejects password without uppercase letters', () => {
    const password = container.querySelector('#password');
    password.value = 'lowercase123';
    expect(password.validity.valid).toBe(false);
  });

  test('rejects password without lowercase letters', () => {
    const password = container.querySelector('#password');
    password.value = 'UPPERCASE123';
    expect(password.validity.valid).toBe(false);
  });

  test('rejects password without numbers or special characters', () => {
    const password = container.querySelector('#password');
    password.value = 'NoSpecialsHere';
    expect(password.validity.valid).toBe(false);
  });

  test('rejects password with less than 8 characters', () => {
    const password = container.querySelector('#password');
    password.value = 'Ab1!';
    expect(password.validity.valid).toBe(false);
  });

  test('accepts strong password meeting all criteria', () => {
    const password = container.querySelector('#password');
    password.value = 'StrongPass1!';
    expect(password.validity.valid).toBe(true);
  });

  test('Shows validation for short password', () => {
    document.querySelector('#address').value = 'test@example.com';
    document.querySelector('#password').value = 'Ab1!';
    document.querySelector('#confirmPassword').value = 'Ab1!';
    document.querySelector('#termsCheckbox').checked = true;
    
    const passwordInput = document.querySelector('#password');
    expect(passwordInput.validity.patternMismatch).toBe(true);
    expect(passwordInput.checkValidity()).toBe(false);
  });

  test('Google sign-up button is visible and clickable', () => {
    const googleButton = document.querySelector('#icon');
    expect(googleButton).not.toBeNull();
    expect(googleButton.style.display).not.toBe('none');
    
    const clickHandler = jest.fn();
    googleButton.addEventListener('click', clickHandler);
    googleButton.click();
    expect(clickHandler).toHaveBeenCalled();
  });
});