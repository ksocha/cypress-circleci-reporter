/// <reference types="cypress" />

context('test9', () => {
  it('waits for 9s', () => {
    cy.wait(9000);
  });
});
