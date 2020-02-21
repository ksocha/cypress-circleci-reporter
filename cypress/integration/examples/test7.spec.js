/// <reference types="cypress" />

context('test7', () => {
  it('waits for 7s', () => {
    cy.wait(7000);
  });
});
