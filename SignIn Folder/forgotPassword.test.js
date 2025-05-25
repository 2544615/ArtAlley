
if (typeof setImmediate === 'undefined') {
  global.setImmediate = (fn) => setTimeout(fn, 0);
}

jest.mock('firebase/app', () => ({
  auth: () => ({
    sendPasswordResetEmail: jest.fn(),
  }),
}));


global.firebase = {
  initializeApp: jest.fn(),
  auth: jest.fn(() => ({
    sendPasswordResetEmail: jest.fn((email) => {
      if (email === "error@example.com") {
        return Promise.reject(new Error("Firebase error"));
      }
      return Promise.resolve();
    }),
  })),
};

describe('Forgot Password Page', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <h1>Forgot Your Password?</h1>
        <form id="resetForm">
          <input type="email" id="email" placeholder="Email address" required>
          <button type="submit">Reset Password</button>
        </form>
        <p id="message"></p>
      </main>
    `;

    jest.resetModules();
    require('./ForgotPassword.js');
  });

  test('Loads the Forgot Password form correctly', () => {
    expect(document.querySelector('h1')?.textContent).toBe('Forgot Your Password?');

    const emailInput = document.querySelector('input[type="email"]');
    expect(emailInput).toBeTruthy();
    expect(emailInput?.getAttribute('placeholder')).toBe('Email address');

    const submitButton = document.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();
    expect(submitButton?.textContent).toBe('Reset Password');
  });

  test('Prevents submission with empty email', () => {
    const form = document.getElementById('resetForm');
    const emailInput = document.getElementById('email');
    emailInput.value = '';

    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const prevented = !form.dispatchEvent(submitEvent);

    expect(prevented).toBe(true);
  });

  test('Submits the form with a valid email and shows success message', async () => {
    const emailInput = document.getElementById('email');
    emailInput.value = 'resetme@example.com';

    const form = document.getElementById('resetForm');
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async to complete

    expect(global.firebase.auth().sendPasswordResetEmail).toHaveBeenCalledWith('resetme@example.com');
    expect(document.getElementById('message').textContent).toBe(
      'A password reset link has been sent to your email.'
    );
  });

  test('Handles error if password reset fails', async () => {
    const emailInput = document.getElementById('email');
    emailInput.value = 'error@example.com';

    const form = document.getElementById('resetForm');
    form.dispatchEvent(new Event('submit', { bubbles: true }));

    await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for async to complete

    expect(global.firebase.auth().sendPasswordResetEmail).toHaveBeenCalledWith('error@example.com');
    expect(document.getElementById('message').textContent).toBe('Firebase error');
  });
});