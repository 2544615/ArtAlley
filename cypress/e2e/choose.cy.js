describe('Choose Role Page - ArtAlley', () => {
    beforeEach(() => {
      cy.visit('http://localhost:3000/Homepage Folder/choose.html'); // Update path if needed
    });
  
    it('Displays the role selection form', () => {
      cy.get('form#roleForm').should('exist');
      cy.contains('Choose a role').should('be.visible');
      cy.get('#roleSelect').should('exist');
      cy.get('#roleSelect option').should('have.length', 3); // includes the default disabled option
    });
  
    it('Redirects to buyer login when Buyer is selected', () => {
      cy.get('#roleSelect').select('buyer');
      cy.get('form#roleForm').submit();
      cy.url().should('include', '../SignIn Folder/login-buyer.html');
    });
  
    it('Redirects to seller login when Seller is selected', () => {
      cy.get('#roleSelect').select('seller');
      cy.get('form#roleForm').submit();
      cy.url().should('include', '../SignIn Folder/login-seller.html');
    });
  
    it('Does not submit form if no role is selected', () => {
      cy.get('#roleSelect').should('have.value', '');
      cy.get('form#roleForm').submit();
      cy.url().should('include', 'choose.html'); // URL should not change
    });
  });
  
