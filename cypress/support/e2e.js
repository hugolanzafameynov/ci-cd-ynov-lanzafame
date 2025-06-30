Cypress.config('defaultCommandTimeout', 10000);

Cypress.Commands.add('getByTestId', (testId) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Ignorer certaines erreurs courantes en développement
Cypress.on('uncaught:exception', (err, runnable) => {
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }

  if (err.message.includes('WebSocket connection')) {
    return false;
  }
  
  return true;
});
