/// <reference types="cypress" />

context('test1', () => {
  it('waits for 1s', () => {
    cy.wait(1000);
  });

  it.skip('should be skipped', () => {
    cy.wait(1000);
  });

  it('should fail', () => {
    cy.click();
  });
});
