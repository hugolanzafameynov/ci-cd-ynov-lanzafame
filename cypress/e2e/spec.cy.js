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
    cy.get('[data-testid="register-birthdate"]').type('2000-01-01');
    cy.get('[data-testid="register-city"]').type('Paris');
    cy.get('[data-testid="register-postal-code"]').type('75000');
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
    cy.get('[data-testid="register-birthdate"]').type('2000-01-01');
    cy.get('[data-testid="register-city"]').type('Paris');
    cy.get('[data-testid="register-postal-code"]').type('75000');
    cy.get('[data-testid="register-submit-button"]').click(); 
    cy.contains('Les mots de passe ne correspondent pas').should('be.visible');
  });

  it('affiche une erreur si le mot de passe est trop court', () => {
    cy.get('[data-testid="register-email"]').type('test@example.com');
    cy.get('[data-testid="register-password"]').type('123');
    cy.get('[data-testid="register-confirm-password"]').type('123');
    cy.get('[data-testid="register-first-name"]').type('Jean');
    cy.get('[data-testid="register-last-name"]').type('Dupont');
    cy.get('[data-testid="register-birthdate"]').type('2000-01-01');
    cy.get('[data-testid="register-city"]').type('Paris');
    cy.get('[data-testid="register-postal-code"]').type('75000');
    cy.get('[data-testid="register-submit-button"]').click();
    cy.contains('Le mot de passe doit contenir au moins 6 caractères').should('be.visible');
  });

  it('réussit l\'inscription et redirige vers la connexion', () => {
    const uniqueEmail = `nouveau_${Date.now()}@example.com`;
    cy.intercept('POST', '**/v1/users', (req) => {
      expect(req.body).to.deep.equal({
        username: uniqueEmail,
        password: 'motdepasse123',
        name: 'Jean',
        lastName: 'Dupont',
        birthdate: '2000-01-01',
        city: 'Paris',
        postalCode: '75000'
      });
      req.reply({ statusCode: 201, body: { message: 'User created successfully' } });
    }).as('registerSuccess');

    cy.get('[data-testid="register-email"]').type(uniqueEmail);
    cy.get('[data-testid="register-password"]').type('motdepasse123');
    cy.get('[data-testid="register-confirm-password"]').type('motdepasse123');
    cy.get('[data-testid="register-first-name"]').type('Jean');
    cy.get('[data-testid="register-last-name"]').type('Dupont');
    cy.get('[data-testid="register-birthdate"]').type('2000-01-01');
    cy.get('[data-testid="register-city"]').type('Paris');
    cy.get('[data-testid="register-postal-code"]').type('75000');
    cy.get('[data-testid="register-submit-button"]').click();
    cy.wait('@registerSuccess');
    cy.contains('Inscription réussie').should('be.visible');
    cy.url().should('include', '/login', { timeout: 5000 });
  });

  it('affiche une erreur si l\'email existe déjà', () => {
    cy.intercept('POST', '**/v1/users', {
      statusCode: 400,
      body: { detail: 'Ce nom d\'utilisateur existe déjà' }
    }).as('registerError');

    cy.get('[data-testid="register-email"]').type('existant@example.com');
    cy.get('[data-testid="register-password"]').type('motdepasse123');
    cy.get('[data-testid="register-confirm-password"]').type('motdepasse123');
    cy.get('[data-testid="register-first-name"]').type('Jean');
    cy.get('[data-testid="register-last-name"]').type('Dupont');
    cy.get('[data-testid="register-birthdate"]').type('2000-01-01');
    cy.get('[data-testid="register-city"]').type('Paris');
    cy.get('[data-testid="register-postal-code"]').type('75000');
    cy.get('[data-testid="register-submit-button"]').click();
    cy.wait('@registerError');
    cy.get('.error-message').should('contain.text', 'Ce nom d\'utilisateur existe déjà');
  });

  it('affiche une erreur si la date de naissance indique moins de 18 ans', () => {
    cy.get('[data-testid="register-email"]').type('mineur@example.com');
    cy.get('[data-testid="register-password"]').type('motdepasse123');
    cy.get('[data-testid="register-confirm-password"]').type('motdepasse123');
    cy.get('[data-testid="register-first-name"]').type('Jean');
    cy.get('[data-testid="register-last-name"]').type('Dupont');
    // Date de naissance < 18 ans
    const minorDate = `${new Date().getFullYear() - 10}-01-01`;
    cy.get('[data-testid="register-birthdate"]').type(minorDate);
    cy.get('[data-testid="register-city"]').type('Paris');
    cy.get('[data-testid="register-postal-code"]').type('75000');
    cy.get('[data-testid="register-submit-button"]').click();
    cy.contains('Vous devez avoir au moins 18 ans pour vous inscrire').should('be.visible');
  });

  it('affiche une erreur si le code postal est invalide', () => {
    cy.get('[data-testid="register-email"]').type('test@example.com');
    cy.get('[data-testid="register-password"]').type('motdepasse123');
    cy.get('[data-testid="register-confirm-password"]').type('motdepasse123');
    cy.get('[data-testid="register-first-name"]').type('Jean');
    cy.get('[data-testid="register-last-name"]').type('Dupont');
    cy.get('[data-testid="register-birthdate"]').type('2000-01-01');
    cy.get('[data-testid="register-city"]').type('Paris');
    cy.get('[data-testid="register-postal-code"]').type('ABCDE');
    cy.get('[data-testid="register-submit-button"]').click();
    cy.contains('Le code postal doit être composé de 5 chiffres').should('be.visible');
  });

  it('affiche une erreur si le prénom ou le nom est invalide', () => {
    cy.get('[data-testid="register-email"]').type('test@example.com');
    cy.get('[data-testid="register-password"]').type('motdepasse123');
    cy.get('[data-testid="register-confirm-password"]').type('motdepasse123');
    cy.get('[data-testid="register-first-name"]').type('1');
    cy.get('[data-testid="register-last-name"]').type('Dupont');
    cy.get('[data-testid="register-birthdate"]').type('2000-01-01');
    cy.get('[data-testid="register-city"]').type('Paris');
    cy.get('[data-testid="register-postal-code"]').type('75000');
    cy.get('[data-testid="register-submit-button"]').click();
    cy.contains('Le prénom est invalide').should('be.visible');
    cy.get('[data-testid="register-first-name"]').clear().type('Jean');
    cy.get('[data-testid="register-last-name"]').clear().type('2');
    cy.get('[data-testid="register-submit-button"]').click();
    cy.contains('Le nom est invalide').should('be.visible');
  });
});
