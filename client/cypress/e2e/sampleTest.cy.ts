/// <reference types="cypress" />

describe('My First Test', () => {
  it('Visits the app URL', () => {
    cy.intercept('POST', '/login', { token: 'fakeToken' }).as('loginRequest');
    cy.visit('/login');
    cy.contains('Welcome to Mini-Meco').should('be.visible');
  });
});
