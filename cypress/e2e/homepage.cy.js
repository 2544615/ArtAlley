describe('Art Alley Homepage', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/Homepage Folder/homepage.html'); // Adjust path if needed
  });

  it('Displays header icons correctly', () => {
    cy.get('.icons button').should('have.length', 3);
    cy.get('.fas.fa-search').should('exist');
    cy.get('.fas.fa-shopping-cart').should('exist');
    cy.get('.fas.fa-user').should('exist');
  });

  it('Displays title section correctly', () => {
    cy.contains('Art Alley').should('be.visible');
    cy.contains('Where Culture Meets Craft').should('be.visible');
  });

  it('Shows all 3 artisan images', () => {
    cy.get('.artisan-gallery figure img').should('have.length', 3);
  });

  it('Validates role selection form', () => {
    cy.get('#roleSelect').should('exist');
    cy.get('form#roleForm button[type="submit"]').should('contain', 'Submit');
  });

  it('Redirects user to selected signup page', () => {
    cy.get('#roleSelect').select('Buyer');
    cy.get('form#roleForm').submit();
    cy.url().should('include', 'buyer-signup');
  });

  it('Displays footer sections and links', () => {
    cy.contains('Help').should('be.visible');
    cy.contains('Account').should('be.visible');
    cy.contains('Art Alley').should('be.visible');

    cy.get('footer a').should('have.length.at.least', 6);
  });
});
