describe('Forgot Password Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/ForgotPaswword.html');
  });

  it('Loads the Forgot Password form correctly', () => {
    cy.contains('Forgot Your Password').should('be.visible');
    cy.get('input[type="email"]').should('have.attr', 'placeholder', 'Email address');
    cy.get('button[type="submit"]').should('contain', 'Reset Password');
  });

  it('Prevents submission with empty email', () => {
    cy.get('button[type="submit"]').click();
    cy.get(':invalid').should('exist');
  });

  it('Submits the form with a valid email', () => {
    cy.get('input[type="email"]').type('resetme@example.com');
    cy.get('button[type="submit"]').click();
    // Optionally add an assertion here for a success message or redirect
  });
});
