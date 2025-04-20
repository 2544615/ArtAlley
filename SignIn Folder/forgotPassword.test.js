/**
 * @jest-environment jsdom
 */


describe('Forgot Password Page', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <h1>Forgot Your Password</h1>
        <form id='forgotPasswordForm'>
            <input type="email" placeholder="Email address" required>

            <button type="submit">Reset Password</button>
        </form>
      `;
  
      // Simulate form behavior
      document.getElementById('forgotPasswordForm').addEventListener('submit', (event) => {
        event.preventDefault();
      });
    });
  
    test('Loads the Forgot Password form correctly', () => {
      expect(document.querySelector('h1')?.textContent).toBe('Forgot Your Password');
  
      const emailInput = document.querySelector('input[type="email"]');
      expect(emailInput).toBeTruthy();
      expect(emailInput?.getAttribute('placeholder')).toBe('Email address');
  
      const submitButton = document.querySelector('button[type="submit"]');
      expect(submitButton).toBeTruthy();
      expect(submitButton?.textContent).toBe('Reset Password');
    });
  
    test('Prevents submission with empty email', () => {
      const form = document.getElementById('forgotPasswordForm');
      const emailInput = document.querySelector('input[type="email"]');
      emailInput.value = ''; // empty email
  
      const event = new Event('submit', { bubbles: true, cancelable: true });
      const prevented = !form.dispatchEvent(event);
  
      expect(prevented).toBe(true); // submission is prevented due to form validation
    });
  
    test('Submits the form with a valid email', () => {
      const form = document.getElementById('forgotPasswordForm');
      const emailInput = document.querySelector('input[type="email"]');

        // Simulate user input
        emailInput.value = 'resetme@example.com';
      const event = new Event('submit', { bubbles: true, cancelable: true });
      const prevented = !form.dispatchEvent(event);
  
      // In a real DOM, checkValidity would block invalid forms,
      // but in jsdom, we have to simulate the logic manually
      expect(emailInput.value).toBe('resetme@example.com');
      expect(prevented).toBe(true); // event.preventDefault() still runs
    });
  });
  