/// <reference types="cypress" />

describe('My First Test', () => {
  it('Visits the app URL', () => {
    cy.intercept('POST', '/session', { token: 'fakeToken' }).as('loginRequest');
    cy.visit('/login');
    cy.contains('Welcome to Mini-Meco').should('be.visible');
  });
});
