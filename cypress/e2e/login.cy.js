describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/SignIn Folder/login.html'); // Change if your path differs
  });

  it('Loads the login form correctly', () => {
    cy.contains('Login').should('be.visible');
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
    cy.contains('Forgot Password')
      .should('have.attr', 'href')
      .and('include', 'ForgotPaswword.html'); // Make sure typo is fixed in HTML
  });

  it('Google sign-in section is visible', () => {
    cy.get('.google-btn')
      .should('exist')
      .and('contain', 'Sign in with Google');
    
    cy.get('.google-btn img')
      .should('have.attr', 'src')
      .and('include', 'google-logo.png');
  });

  it('Sign up link goes to seller signup', () => {
    cy.contains('Sign up')
      .should('have.attr', 'href', 'seller-signup.html');
  });
});
