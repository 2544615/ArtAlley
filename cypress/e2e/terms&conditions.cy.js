describe('Terms and Conditions Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/SignUp Folder/TermsNConditions.html'); // Ensure the correct URL
  });

  it('displays the Terms and Conditions heading', () => {
    cy.contains('Terms and Conditions').should('be.visible');
  });

  it('contains key sections of the legal text', () => {
    cy.contains('Welcome to ArtAlley').should('exist');
    cy.contains('non-exclusive, non-transferable license').should('exist');
    cy.contains('Privacy Policy').should('exist');
    cy.contains('intellectual property rights').should('exist');
    cy.contains('third-party websites or services').should('exist');

    // Use regex or separate checks if exact matching fails
    cy.contains(/as\s+is.*as\s+available/i).should('exist'); // Flexible match

    cy.contains('indirect, incidental, special, or consequential damages').should('exist');
    cy.contains('To the fullest extent permitted by law, ArtAlley shall not be liable').should('exist');
    cy.contains('Johannesburg').should('exist');
  });
});
