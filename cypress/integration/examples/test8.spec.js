/// <reference types="cypress" />

context('test8', () => {
  it('waits for 8s', () => {
    cy.wait(8000);
  });
});
