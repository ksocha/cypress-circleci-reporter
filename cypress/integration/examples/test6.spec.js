/// <reference types="cypress" />

context('test6', () => {
  it('waits for 6s', () => {
    cy.wait(6000);
  });
});
