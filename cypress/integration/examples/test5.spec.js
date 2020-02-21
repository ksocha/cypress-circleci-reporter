/// <reference types="cypress" />

context('test5', () => {
  it('waits for 5s', () => {
    cy.wait(5000);
  });
});
