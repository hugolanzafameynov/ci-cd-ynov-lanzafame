describe('Admin Dashboard', () => {
  beforeEach(() => {
    // Simuler une connexion admin
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-admin-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@example.com',
        isAdmin: true
      }));
    });
    
    cy.visit('/dashboard');
  });

  it('should display admin-specific features', () => {
    // Vérifier que les fonctionnalités admin sont visibles
    cy.get('[data-testid="admin-panel"]').should('be.visible');
    cy.contains('Gestion des utilisateurs').should('be.visible');
  });

  it('should allow access to user management', () => {
    // Cliquer sur la gestion des utilisateurs
    cy.get('[data-testid="user-management-link"]').click();
    
    // Vérifier que nous sommes sur la page de gestion des utilisateurs
    cy.url().should('include', '/users');
    cy.get('[data-testid="user-list"]').should('be.visible');
  });

  it('should display user statistics', () => {
    // Vérifier que les statistiques utilisateur sont affichées
    cy.get('[data-testid="user-stats"]').should('be.visible');
    cy.get('[data-testid="total-users"]').should('contain.text', 'Total');
  });
});

describe('User Management', () => {
  beforeEach(() => {
    // Simuler une connexion admin
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-admin-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@example.com',
        isAdmin: true
      }));
    });
    
    // Intercepter les requêtes API pour la liste des utilisateurs
    cy.intercept('GET', '**/api/users', {
      statusCode: 200,
      body: {
        users: [
          { id: 1, email: 'user1@example.com', isAdmin: false, createdAt: '2024-01-01' },
          { id: 2, email: 'user2@example.com', isAdmin: false, createdAt: '2024-01-02' },
          { id: 3, email: 'admin@example.com', isAdmin: true, createdAt: '2024-01-03' }
        ]
      }
    }).as('getUsersList');
    
    cy.visit('/dashboard');
  });

  it('should load and display users list', () => {
    // Naviguer vers la gestion des utilisateurs
    cy.get('[data-testid="user-management-link"]').click();
    
    // Attendre que la requête soit terminée
    cy.wait('@getUsersList');
    
    // Vérifier que la liste des utilisateurs est affichée
    cy.get('[data-testid="user-list"]').should('be.visible');
    cy.get('[data-testid="user-item"]').should('have.length', 3);
    
    // Vérifier que les informations utilisateur sont affichées
    cy.contains('user1@example.com').should('be.visible');
    cy.contains('user2@example.com').should('be.visible');
    cy.contains('admin@example.com').should('be.visible');
  });

  it('should filter users by search', () => {
    cy.get('[data-testid="user-management-link"]').click();
    cy.wait('@getUsersList');
    
    // Utiliser le champ de recherche
    cy.get('[data-testid="user-search"]').type('user1');
    
    // Vérifier que seul user1 est affiché
    cy.get('[data-testid="user-item"]').should('have.length', 1);
    cy.contains('user1@example.com').should('be.visible');
    cy.contains('user2@example.com').should('not.exist');
  });

  it('should handle user deletion', () => {
    // Intercepter la requête de suppression
    cy.intercept('DELETE', '**/api/users/2', {
      statusCode: 200,
      body: { message: 'User deleted successfully' }
    }).as('deleteUser');
    
    cy.get('[data-testid="user-management-link"]').click();
    cy.wait('@getUsersList');
    
    // Cliquer sur le bouton de suppression pour user2
    cy.get('[data-testid="delete-user-2"]').click();
    
    // Confirmer la suppression
    cy.get('[data-testid="confirm-delete"]').click();
    
    // Vérifier que la requête de suppression a été envoyée
    cy.wait('@deleteUser');
    
    // Vérifier qu'un message de succès est affiché
    cy.contains('Utilisateur supprimé avec succès').should('be.visible');
  });

  it('should handle API errors gracefully', () => {
    // Intercepter avec une erreur
    cy.intercept('GET', '**/api/users', {
      statusCode: 500,
      body: { error: 'Internal server error' }
    }).as('getUsersError');
    
    cy.get('[data-testid="user-management-link"]').click();
    cy.wait('@getUsersError');
    
    // Vérifier qu'un message d'erreur est affiché
    cy.contains('Erreur lors du chargement des utilisateurs').should('be.visible');
  });
});

describe('User Permissions', () => {
  it('should restrict admin features for regular users', () => {
    // Simuler une connexion utilisateur normal
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-user-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 2,
        email: 'user@example.com',
        isAdmin: false
      }));
    });
    
    cy.visit('/dashboard');
    
    // Vérifier que les fonctionnalités admin ne sont pas visibles
    cy.get('[data-testid="admin-panel"]').should('not.exist');
    cy.get('[data-testid="user-management-link"]').should('not.exist');
  });

  it('should prevent direct access to admin routes for regular users', () => {
    // Simuler une connexion utilisateur normal
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-user-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 2,
        email: 'user@example.com',
        isAdmin: false
      }));
    });
    
    // Essayer d'accéder directement à la gestion des utilisateurs
    cy.visit('/users');
    
    // Vérifier que nous sommes redirigés ou que l'accès est refusé
    cy.url().should('not.include', '/users');
    cy.contains('Accès non autorisé').should('be.visible');
  });
});
