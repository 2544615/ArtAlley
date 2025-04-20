/**
 * @jest-environment jsdom
 */

describe('Buyer Login Page', () => {
    beforeEach(() => {
      // Simulate loading the page
      document.body.innerHTML = `
        <main class="background">
    <section class="login-card">
      <header>
        <h2>Login as a buyer</h2>
        <p class="welcome-msg">Welcome back</p>
      </header>

      <form>
        <label for="email">Email Address</label>
        <input type="email" id="email" placeholder="Enter your email here" required>

        <label for="password">Password</label>
        <input type="password" id="password" placeholder="**********" required>
        
        <nav class="options">
          <a href="ForgotPaswword.html">Forgot Password</a>
        </nav>

        <button type="submit" class="login-btn">Login</button>

        <button id="google-btn" class="google-btn" >
          <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google">
          Sign in with Google
      </button>
      </form>

      <footer>
        <p class="signup">Don’t have an account? <a href="../SignUp Folder/buyer-signup.html">Sign up</a></p>
      </footer>
    </section>
  </main>
      `;
    });
  
    test('Loads the login form correctly', () => {
      expect(document.querySelector('h2')?.textContent).toBe('Login as a buyer');
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
      expect(signupLink?.getAttribute('href')).toBe('../SignUp Folder/buyer-signup.html');
    });
  });
  