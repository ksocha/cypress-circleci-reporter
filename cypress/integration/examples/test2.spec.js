/// <reference types="cypress" />

context('test2', () => {
  it('waits for 2s', () => {
    cy.wait(2000);
  });
});
