describe('Node Welcome', function() {
  it('Visits the home page', function() {
    cy.visit('/');
    cy.contains('.subtitle', 'Welcome home.');
  });
});
