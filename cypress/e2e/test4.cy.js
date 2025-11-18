/// <reference types="cypress" />

context('test4', () => {
  it('waits for 4s', () => {
    cy.wait(4000);
  });
});
