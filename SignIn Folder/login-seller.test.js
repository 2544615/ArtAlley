
const fs = require('fs');
const path = require('path');

describe('Buyer Login Page', () => {
     let htmlContent;
    
      beforeAll(() => {
        // Read the HTML file content
        const htmlPath = path.resolve(__dirname, 'login-seller.html'); // Adjust the path
        htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      });
    
      beforeEach(() => {
        // Set the document's innerHTML to the HTML content read from the file
        document.body.innerHTML = htmlContent;
      });

    test('Loads the login form correctly', () => {
      expect(document.querySelector('h2')?.textContent).toBe('Login as a seller');
      expect(document.querySelector('p')?.textContent).toBe('Welcome back');
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
  
    test('Login button is present and functional', () => {
      const loginBtn = document.querySelector('button.login-btn');
      expect(loginBtn).toBeTruthy();
      expect(loginBtn?.textContent).toContain('Login');
    });
  
    test('Forgot Password link is correct', () => {
      const forgotLink = document.querySelector('nav.options a');
      expect(forgotLink).toBeTruthy();
      expect(forgotLink?.getAttribute('href')).toBe('ForgotPaswword.html');
    });
  
    test('Google sign-in section is visible', () => {
      const googleBtn = document.querySelector('#google-btn');
      const googleImg = document.querySelector('#google-btn img');
  
      expect(googleBtn).toBeTruthy();
      expect(googleBtn?.textContent).toContain('Sign in with Google');
  
      expect(googleImg?.getAttribute('src')).toContain('google-logo.png');
    });
  
    test('Sign up link goes to buyer signup', () => {
      const signupLink = document.querySelector('p.signup a');
      expect(signupLink).toBeTruthy();
      expect(signupLink?.getAttribute('href')).toBe('../SignUp Folder/seller-signup.html');
    });
  });
  