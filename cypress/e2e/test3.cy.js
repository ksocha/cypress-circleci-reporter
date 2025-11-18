/// <reference types="cypress" />

context('test3', () => {
  it('waits for 3s', () => {
    cy.wait(3000);
  });
});
