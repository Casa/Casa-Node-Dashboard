describe('Logging in to the node', function() {
  it('has login form', function() {
    cy.visit('/');
    cy.get('.login-form input[type=password]').should('exist');
  });

  it('requires password', function() {
    cy.visit('/');

    cy.get('.login-form form').trigger('submit');
    cy.wait(1000);

    cy.get('.auth-error').should('be.visible');
  });

  it('denies invalid password', function() {
    cy.visit('/');

    cy.get('.login-form input[type=password]').type('abc123'); // Invalid password. Minimum length is 12 characters.
    cy.get('.login-form form').trigger('submit');
    cy.wait(1000);

    cy.get('.auth-error').should('be.visible');
  });

  it('allows valid password', function() {
    cy.visit('/');

    cy.get('.login-form input[type=password]').type(Cypress.env('password')); // This password needs to be the real password for the node you're testing on
    cy.get('.login-form form').trigger('submit');
    cy.wait(1000);

    cy.get('.card-header span').first().contains('Bitcoin').should('exist');
  });
});
