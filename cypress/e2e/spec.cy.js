describe('Page de Connexion', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('affiche correctement le formulaire de connexion', () => {
    cy.get('[data-testid="login-email"]').should('be.visible');
    cy.get('[data-testid="login-password"]').should('be.visible');
    cy.get('[data-testid="login-submit-button"]').should('be.visible');
    
    cy.contains('Pas encore de compte').should('be.visible');
    cy.get('a[href="/register"]').should('be.visible');
  });

  it('permet de saisir email et mot de passe', () => {
    cy.get('[data-testid="login-email"]').type('test@example.com');
    cy.get('[data-testid="login-email"]').should('have.value', 'test@example.com');
    
    cy.get('[data-testid="login-password"]').type('password123');
    cy.get('[data-testid="login-password"]').should('have.value', 'password123');
  });

  it('navigue vers la page d\'inscription', () => {
    cy.get('a[href="/register"]').click();
    cy.url().should('include', '/register');
  });

  it('affiche une erreur avec des identifiants incorrects', () => {
    // Simuler une réponse d'erreur
    cy.intercept('POST', '**/v1/login', {
      statusCode: 401,
      body: { detail: 'Identifiants invalides' }
    }).as('loginError');

    cy.get('[data-testid="login-email"]').type('wrong@example.com');
    cy.get('[data-testid="login-password"]').type('wrongpassword');
    cy.get('[data-testid="login-submit-button"]').click();

    cy.wait('@loginError');
    cy.get('.error-message').should('contain.text', 'Identifiants invalides');
  });

  it('redirige vers le dashboard après connexion réussie', () => {
    // Simuler une connexion réussie
    cy.intercept('POST', '**/v1/login', {
      statusCode: 200,
      body: {
        token: 'fake-jwt-token',
        user: {
          id: 1,
          username: 'test@example.com',
          is_admin: false
        }
      }
    }).as('loginSuccess');

    cy.get('[data-testid="login-email"]').type('test@example.com');
    cy.get('[data-testid="login-password"]').type('password123');
    cy.get('[data-testid="login-submit-button"]').click();

    cy.wait('@loginSuccess');
    cy.url().should('include', '/dashboard');
  });
});

describe('Page d\'Inscription', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('affiche correctement le formulaire d\'inscription', () => {
    cy.get('[data-testid="register-email"]').should('be.visible');
    cy.get('[data-testid="register-password"]').should('be.visible');
    cy.get('[data-testid="register-confirm-password"]').should('be.visible');
    cy.get('[data-testid="register-first-name"]').should('be.visible');
    cy.get('[data-testid="register-last-name"]').should('be.visible');
    cy.get('[data-testid="register-submit-button"]').should('be.visible');
    
    cy.contains('Déjà un compte').should('be.visible');
    cy.get('a[href="/login"]').should('be.visible');
  });

  it('permet de remplir tous les champs', () => {
    cy.get('[data-testid="register-email"]').type('nouveau@example.com');
    cy.get('[data-testid="register-password"]').type('motdepasse123');
    cy.get('[data-testid="register-confirm-password"]').type('motdepasse123');
    cy.get('[data-testid="register-first-name"]').type('Jean');
    cy.get('[data-testid="register-last-name"]').type('Dupont');

    cy.get('[data-testid="register-email"]').should('have.value', 'nouveau@example.com');
    cy.get('[data-testid="register-first-name"]').should('have.value', 'Jean');
    cy.get('[data-testid="register-last-name"]').should('have.value', 'Dupont');
  });

  it('navigue vers la page de connexion', () => {
    cy.get('a[href="/login"]').click();
    cy.url().should('include', '/login');
  });

  it('affiche une erreur si les mots de passe ne correspondent pas', () => {
    cy.get('[data-testid="register-email"]').type('test@example.com');
    cy.get('[data-testid="register-password"]').type('motdepasse123');
    cy.get('[data-testid="register-confirm-password"]').type('motdepassedifferent');
    cy.get('[data-testid="register-first-name"]').type('Jean');
    cy.get('[data-testid="register-last-name"]').type('Dupont');
    
    cy.get('[data-testid="register-submit-button"]').click(); 
    cy.contains('Les mots de passe ne correspondent pas').should('be.visible');
  });

  it('affiche une erreur si le mot de passe est trop court', () => {
    cy.get('[data-testid="register-email"]').type('test@example.com');
    cy.get('[data-testid="register-password"]').type('123');
    cy.get('[data-testid="register-confirm-password"]').type('123');
    cy.get('[data-testid="register-first-name"]').type('Jean');
    cy.get('[data-testid="register-last-name"]').type('Dupont');
    
    cy.get('[data-testid="register-submit-button"]').click();
    cy.contains('Le mot de passe doit contenir au moins 6 caractères').should('be.visible');
  });

  it('réussit l\'inscription et redirige vers la connexion', () => {
    // Simuler une inscription réussie
    cy.intercept('POST', '**/v1/users', {
      statusCode: 201,
      body: { message: 'User created successfully' }
    }).as('registerSuccess');

    cy.get('[data-testid="register-email"]').type('nouveau@example.com');
    cy.get('[data-testid="register-password"]').type('motdepasse123');
    cy.get('[data-testid="register-confirm-password"]').type('motdepasse123');
    cy.get('[data-testid="register-first-name"]').type('Jean');
    cy.get('[data-testid="register-last-name"]').type('Dupont');
    
    cy.get('[data-testid="register-submit-button"]').click();
    
    cy.wait('@registerSuccess');
    cy.contains('Inscription réussie').should('be.visible');
    
    // Attendre la redirection vers la page de connexion
    cy.url().should('include', '/login', { timeout: 5000 });
  });

  it('affiche une erreur si l\'email existe déjà', () => {
    // Simuler une erreur d'email existant
    cy.intercept('POST', '**/v1/users', {
      statusCode: 400,
      body: { detail: 'Ce nom d\'utilisateur existe déjà' }
    }).as('registerError');

    cy.get('[data-testid="register-email"]').type('existant@example.com');
    cy.get('[data-testid="register-password"]').type('motdepasse123');
    cy.get('[data-testid="register-confirm-password"]').type('motdepasse123');
    cy.get('[data-testid="register-first-name"]').type('Jean');
    cy.get('[data-testid="register-last-name"]').type('Dupont');
    
    cy.get('[data-testid="register-submit-button"]').click();
    
    cy.wait('@registerError');
    cy.get('.error-message').should('contain.text', 'Ce nom d\'utilisateur existe déjà');
  });
});