describe('Authentication Flow', () => {
  beforeEach(() => {
    // Visiter la page d'accueil avant chaque test
    cy.visit('/');
  });

  it('should redirect to login when not authenticated', () => {
    // Vérifier que l'utilisateur non authentifié est redirigé vers la page de connexion
    cy.url().should('include', '/login');
    cy.get('[data-testid="login-email"]').should('be.visible');
    cy.get('[data-testid="login-password"]').should('be.visible');
    cy.get('[data-testid="login-submit-button"]').should('be.visible');
  });

  it('should display login form correctly', () => {
    cy.visit('/login');
    
    // Vérifier que tous les éléments du formulaire sont présents
    cy.get('[data-testid="login-email"]').should('be.visible');
    cy.get('[data-testid="login-password"]').should('be.visible');
    cy.get('[data-testid="login-submit-button"]').should('be.visible');
    
    // Vérifier le lien d'inscription
    cy.contains('Pas encore de compte').should('be.visible');
    cy.get('a[href="/register"]').should('be.visible');
  });

  it('should show validation errors for empty form', () => {
    cy.visit('/login');
    
    // Cliquer sur le bouton de connexion sans remplir les champs
    cy.get('[data-testid="login-submit-button"]').click();
    
    // Vérifier que les champs sont marqués comme invalides
    cy.get('[data-testid="login-email"]').should('have.attr', 'aria-invalid', 'true');
    cy.get('[data-testid="login-password"]').should('have.attr', 'aria-invalid', 'true');
  });

  it('should validate email format', () => {
    cy.visit('/login');
    
    // Entrer un email invalide
    cy.get('[data-testid="login-email"]').type('invalid-email');
    cy.get('[data-testid="login-password"]').type('password123');
    cy.get('[data-testid="login-submit-button"]').click();
    
    // Vérifier que l'email est marqué comme invalide
    cy.get('[data-testid="login-email"]').should('have.attr', 'aria-invalid', 'true');
  });

  it('should navigate to register page', () => {
    cy.visit('/login');
    
    // Cliquer sur le lien d'inscription
    cy.get('a[href="/register"]').click();
    
    // Vérifier que nous sommes sur la page d'inscription
    cy.url().should('include', '/register');
    cy.get('[data-testid="register-email"]').should('be.visible');
  });
});

describe('Registration Flow', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('should display registration form correctly', () => {
    // Vérifier que tous les éléments du formulaire sont présents
    cy.get('[data-testid="register-email"]').should('be.visible');
    cy.get('[data-testid="register-password"]').should('be.visible');
    cy.get('[data-testid="register-confirm-password"]').should('be.visible');
    cy.get('[data-testid="register-submit-button"]').should('be.visible');
    
    // Vérifier le lien de connexion
    cy.contains('Déjà un compte').should('be.visible');
    cy.get('a[href="/login"]').should('be.visible');
  });

  it('should validate password confirmation', () => {
    // Remplir le formulaire avec des mots de passe différents
    cy.get('[data-testid="register-email"]').type('test@example.com');
    cy.get('[data-testid="register-password"]').type('password123');
    cy.get('[data-testid="register-confirm-password"]').type('differentpassword');
    cy.get('[data-testid="register-submit-button"]').click();
    
    // Vérifier qu'une erreur de confirmation de mot de passe est affichée
    cy.contains('Les mots de passe ne correspondent pas').should('be.visible');
  });
});

describe('Dashboard Access', () => {
  it('should access dashboard after successful login', () => {
    // Simuler une connexion réussie en stockant un token
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        isAdmin: false
      }));
    });
    
    // Visiter le dashboard
    cy.visit('/dashboard');
    
    // Vérifier que nous sommes sur le dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard').should('be.visible');
  });

  it('should display user information', () => {
    // Simuler une connexion réussie
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        isAdmin: false
      }));
    });
    
    cy.visit('/dashboard');
    
    // Vérifier que l'email de l'utilisateur est affiché
    cy.contains('test@example.com').should('be.visible');
  });

  it('should have logout functionality', () => {
    // Simuler une connexion réussie
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token');
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'test@example.com',
        isAdmin: false
      }));
    });
    
    cy.visit('/dashboard');
    
    // Cliquer sur le bouton de déconnexion
    cy.get('[data-testid="logout-button"]').click();
    
    // Vérifier que nous sommes redirigés vers la page de connexion
    cy.url().should('include', '/login');
    
    // Vérifier que le token a été supprimé
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });
});

describe('Responsive Design', () => {
  const viewports = [
    { width: 320, height: 568 }, // Mobile
    { width: 768, height: 1024 }, // Tablet
    { width: 1280, height: 720 }  // Desktop
  ];

  viewports.forEach((viewport) => {
    it(`should be responsive on ${viewport.width}x${viewport.height}`, () => {
      cy.viewport(viewport.width, viewport.height);
      cy.visit('/login');
      
      // Vérifier que les éléments sont visibles sur toutes les tailles d'écran
      cy.get('[data-testid="login-email"]').should('be.visible');
      cy.get('[data-testid="login-password"]').should('be.visible');
      cy.get('[data-testid="login-submit-button"]').should('be.visible');
    });
  });
});

describe('Error Handling', () => {
  it('should handle network errors gracefully', () => {
    cy.visit('/login');
    
    // Intercepter les requêtes API et simuler une erreur réseau
    cy.intercept('POST', '**/api/auth/login', { forceNetworkError: true }).as('loginRequest');
    
    // Remplir et soumettre le formulaire
    cy.get('[data-testid="login-email"]').type('test@example.com');
    cy.get('[data-testid="login-password"]').type('password123');
    cy.get('[data-testid="login-submit-button"]').click();
    
    // Vérifier qu'un message d'erreur est affiché
    cy.contains('Erreur lors de la connexion').should('be.visible');
  });

  it('should handle 404 routes correctly', () => {
    // Visiter une route qui n'existe pas
    cy.visit('/nonexistent-route');
    
    // Vérifier que nous sommes redirigés vers le dashboard (ou login si non authentifié)
    cy.url().should('match', /(login|dashboard)/);
  });
});