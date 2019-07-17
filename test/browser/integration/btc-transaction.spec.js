describe('Making Bitcoin transactions', function() {
  beforeEach(function() {
    cy.server();
    cy.route('POST', '/v1/accounts/login').as('login');
    cy.route('GET', '/v1/bitcoind/info/sync').as('btc-sync');
    cy.route('GET', '/v1/lnd/info/sync').as('lnd-sync');
    cy.route('GET', '/v1/lnd/transaction').as('transactions');

    // Login
    cy.visit('/');

    // TODO: Figure out how to log in by directly sending data to the API
    cy.get('.login-form input[type=password]').type(Cypress.env('password'));
    cy.get('.login-form form').trigger('submit');

    // Wait until we are logged in and synced
    cy.wait('@login').its('status').should('be', 200);
    cy.wait('@btc-sync').then((xhr) => {
      assert.equal(xhr.response.body.percent, '1.0000');
    });

    cy.wait('@lnd-sync').then((xhr) => {
      assert.equal(xhr.response.body.percent, '1.0000');
    });

    cy.get('.card .card-footer-title').contains('Transactions').click();
    cy.wait('@transactions');
  });

  it('generates QR code', function() {
    // Open deposit modal
    cy.get('.tx-actions span').contains('Deposit').click();

    // Check for QR code
    cy.get('.deposit img').should('be.visible');
  });

  it('requires address and amount', function() {
    // Open withdraw modal
    cy.get('.tx-actions span').contains('Withdraw').click();

    cy.get('.toast.is-danger').should('not.exist');

    // Try to submit without any information
    cy.get('form.withdraw .button.is-casa').click();
    cy.get('.toast.is-danger').should('exist');
  });

  it('displays confirmation', function() {
    cy.route('GET', '/v1/lnd/transaction/estimateFee?*').as('estimates');

    // Open withdraw modal
    cy.get('.tx-actions span').contains('Withdraw').click();

    // Use sample data from cypress environment file
    cy.get('.field input').first().type(Cypress.env('btc_address'));

    // TODO: This test depends on 'sats' being selected as the display unit
    cy.get('.withdrawal-amount input').first().type('100000');

    // Select cheapest withdrawal fee as it's less likely to change dramatically
    cy.get('.fee-option').last().click();
    cy.wait('@estimates');

    cy.get('form.withdraw .button.is-casa').click();
    cy.get('.modal-card-title span').contains('Review Bitcoin Withdrawal').should('exist');
  });

  it('calculates maximum amount to send', function() {
    cy.route('GET', '/v1/lnd/transaction/estimateFee?*').as('estimates');

    // Open withdraw modal
    cy.get('.tx-actions span').contains('Withdraw').click();

    // Use sample data from cypress environment file
    cy.get('.field input').first().type(Cypress.env('btc_address'));
    cy.get('.send-max').click();

    cy.wait('@estimates');

    cy.get('.withdrawal-amount input').first().should(($input) => {
      const value = $input.val()

      expect(value).to.exist;

      // TODO: We should use mock data for the estimate and total amount of BTC so this test can be more accurate
      expect(value).to.be.above(1000);
    });
  });
});
