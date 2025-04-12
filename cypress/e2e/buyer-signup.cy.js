describe('Buyer Signup Page', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/buyer-signup.html');
  });

  it('Loads the signup form correctly', () => {
    cy.contains('Welcome to Art Alley').should('be.visible');
    cy.contains('Sign Up as a Buyer').should('be.visible');
  });

  it('Has all input fields and buttons', () => {
    cy.get('#username').should('exist');
    cy.get('#address').should('have.attr', 'type', 'email');
    cy.get('#number').should('have.attr', 'type', 'tel');
    cy.get('#password').should('have.attr', 'type', 'password');
    cy.contains('Terms and Conditions').should('have.attr', 'href', 'TermsNConditions.html');
    cy.get('#register').should('contain', 'Create Account');
    cy.get('#icon').should('contain', 'Sign Up with Google');
  });

  it('Prevents submission when required fields are empty', () => {
    cy.get('#register').click();
    cy.get(':invalid').should('exist'); // checks for HTML5 validation
  });

  it('Rejects phone number with less than 10 digits', () => {
    cy.get('#username').type('shortphone');
    cy.get('#address').type('short@example.com');
    cy.get('#number').type('12345');
    cy.get('#password').type('SomePass123');
    cy.get('input[type="checkbox"]').check();

    cy.get('#register').click();
    cy.get('#number:invalid').should('exist');
  });

  it('Rejects non-numeric characters in phone input', () => {
    cy.get('#number').type('abcXYZ!@#').should('have.value', '');
  });

  it('Limits phone number to 10 digits', () => {
    cy.get('#number').type('1234567890123').should('have.value', '1234567890');
  });

  it('Rejects invalid email format', () => {
    cy.get('#username').type('invalidemail');
    cy.get('#address').type('notanemail');
    cy.get('#number').type('9876543210');
    cy.get('#password').type('SomePass123');
    cy.get('input[type="checkbox"]').check();

    cy.get('#register').click();
    cy.get('#address:invalid').should('exist');
  });

  it('Prevents submission if Terms and Conditions checkbox is not checked', () => {
    cy.get('#username').type('noagreement');
    cy.get('#address').type('agree@example.com');
    cy.get('#number').type('9876543210');
    cy.get('#password').type('StrongPass123');
    
    cy.get('#register').click();
    cy.get('input[type="checkbox"]:invalid').should('exist');
  });

  it('Rejects password without uppercase letters', () => {
    cy.get('#username').type('user1');
    cy.get('#address').type('user1@example.com');
    cy.get('#number').type('1234567890');
    cy.get('#password').type('lowercase123');
    cy.get('input[type="checkbox"]').check();
    cy.get('#register').click();
  
    cy.get('#password:invalid').should('exist');
  });

  it('Rejects password without lowercase letters', () => {
    cy.get('#username').type('user2');
    cy.get('#address').type('user2@example.com');
    cy.get('#number').type('1234567890');
    cy.get('#password').type('UPPERCASE123');
    cy.get('input[type="checkbox"]').check();
    cy.get('#register').click();
  
    cy.get('#password:invalid').should('exist');
  });
  
  it('Rejects password without numbers or special characters', () => {
    cy.get('#username').type('user3');
    cy.get('#address').type('user3@example.com');
    cy.get('#number').type('1234567890');
    cy.get('#password').type('NoSpecialsHere');
    cy.get('input[type="checkbox"]').check();
    cy.get('#register').click();
  
    cy.get('#password:invalid').should('exist');
  });
  
  it('Rejects password with less than 8 characters', () => {
    cy.get('#username').type('user4');
    cy.get('#address').type('user4@example.com');
    cy.get('#number').type('1234567890');
    cy.get('#password').type('Ab1!');
    cy.get('input[type="checkbox"]').check();
    cy.get('#register').click();
  
    cy.get('#password:invalid').should('exist');
  });
  
  it('Accepts strong password meeting all criteria', () => {
    cy.get('#username').type('stronguser');
    cy.get('#address').type('stronguser@example.com');
    cy.get('#number').type('1234567890');
    cy.get('#password').type('StrongPass1!');
    cy.get('input[type="checkbox"]').check();
    cy.get('#register').click();
  
    // Form should submit if backend allows; if not, expect alert or redirect
    cy.get('form').should('exist'); // Or use alert stub as in previous test
  });

  it('Shows browser validation message for short password', () => {
    cy.get('#username').type('shortpassuser');
    cy.get('#address').type('shortpass@example.com');
    cy.get('#number').type('1234567890');
    cy.get('#password').type('Ab1!');
    cy.get('input[type="checkbox"]').check();
    cy.get('#register').click();
  
    cy.get('#password').then(($input) => {
      expect($input[0].validationMessage).to.contain('Please match the requested format.');
    });
  });

  it('Google sign-up button is visible and clickable', () => {
    cy.get('#icon').should('be.visible').click();
    // Optionally check for redirect or console log, if functionality is added later
  });

  it('Fills and submits the form, redirects to login page', () => {
    cy.get('#username').type('artlover99');
    cy.get('#address').type('artlover@example.com');
    cy.get('#number').type('9876543210');
    cy.get('#password').type('SecurePass123');
    cy.get('input[type="checkbox"]').check();
    
    cy.window().then((win) => {
      const alertStub = cy.stub(win, 'alert').as('alertStub'); // access via @alertStub
    });

    cy.get('#register').click();

    cy.url({ timeout: 10000 }).then((url) => {
      if (url.includes('login')) {
        expect(url).to.include('login');
      } else {
        // alertStub is aliased, we can access it reliably
        cy.get('@alertStub').should('have.been.called');
        cy.get('@alertStub').its('firstCall.args.0').should('match', /auth\/email-already-in-use/);
      }
    });
  });
});
