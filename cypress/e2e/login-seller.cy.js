describe('Login Page', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/SignIn Folder/login-seller.html'); 
    });
  
    it('Loads the login form correctly', () => {
      cy.contains('Login as a buyer').should('be.visible');
      cy.contains('Welcome back').should('be.visible');
    });
  
    it('Has email and password fields', () => {
      cy.get('input#email')
        .should('exist')
        .and('have.attr', 'type', 'email')
        .and('have.attr', 'placeholder', 'Enter your email here');
  
      cy.get('input#password')
        .should('exist')
        .and('have.attr', 'type', 'password')
        .and('have.attr', 'placeholder', '**********');
    });
  
    it('Login button is present and functional', () => {
      cy.get('button.login-btn')
        .should('exist')
        .and('contain', 'Login');
    });
  
    it('Forgot Password link is correct', () => {
      cy.get('nav.options a')
        .should('exist')
        .and('have.attr', 'href', 'ForgotPaswword.html'); 
    });
  
    it('Google sign-in section is visible', () => {
      cy.get('#google-btn')
        .should('exist')
        .and('contain', 'Sign in with Google');
  
      cy.get('#google-btn img')
        .should('have.attr', 'src')
        .and('include', 'google-logo.png');
    });
  
    it('Sign up link goes to seller signup', () => {
      cy.get('footer .signup a')
        .should('exist')
        .and('have.attr', 'href', '../SignUp Folder/seller-signup.html');
    });
  });
  
