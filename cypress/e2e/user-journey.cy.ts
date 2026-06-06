describe('AI Persona Social Network - User Journey', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });

  describe('Authentication Flow', () => {
    it('should complete full user login and chat flow', () => {
      // Test login page loads
      cy.contains('Welcome Back').should('be.visible');
      cy.get('input#email').should('be.visible');
      cy.get('input#password').should('be.visible');

      // Fill demo user credentials
      cy.get('input#email').type('demo@example.com');
      cy.get('input#password').type('password123');

      // Submit login
      cy.contains('Sign In').click();

      // Should redirect to onboarding or chat
      cy.url({ timeout: 10000 }).should('match', /\/(onboarding|chat)/);
    });

    it('should redirect admin to analytics dashboard', () => {
      // Login as admin
      cy.get('input#email').type('admin@titantalk.com');
      cy.get('input#password').type('admin123');
      cy.contains('Sign In').click();

      // Should redirect to analytics
      cy.url({ timeout: 10000 }).should('include', '/analytics');
      
      // Verify dashboard has charts
      cy.get('canvas', { timeout: 10000 }).should('exist');
    });

    it('should use demo account quick fill', () => {
      // Click demo account
      cy.contains('demo@example.com').parent('.demo-account').click();
      
      // Verify fields populated
      cy.get('input#email').should('have.value', 'demo@example.com');
      cy.get('input#password').should('have.value', 'password123');
    });
  });

  describe('Registration Flow', () => {
    it('should navigate to register page', () => {
      // Click create account link
      cy.contains('Create one').click();
      
      // Should navigate to register
      cy.url().should('include', '/register');
    });
  });

  describe('Error Handling', () => {
    it('should show error for invalid login', () => {
      cy.get('input#email').type('invalid@example.com');
      cy.get('input#password').type('wrongpassword');
      cy.contains('Sign In').click();

      // Should show error message
      cy.get('.error-message', { timeout: 10000 }).should('be.visible');
    });

    it('should disable button when form is invalid', () => {
      // Empty form should have disabled button
      cy.contains('Sign In').parent('button').should('be.disabled');
      
      // Fill only email
      cy.get('input#email').type('test@example.com');
      cy.contains('Sign In').parent('button').should('be.disabled');
      
      // Fill both fields
      cy.get('input#password').type('password123');
      cy.contains('Sign In').parent('button').should('not.be.disabled');
    });

    it('should show loading state during login', () => {
      cy.get('input#email').type('demo@example.com');
      cy.get('input#password').type('password123');
      cy.contains('Sign In').click();

      // Should show loading text briefly
      cy.contains('Signing in...').should('be.visible');
    });
  });

  describe('Route Guards', () => {
    it('should protect chat route when not logged in', () => {
      cy.visit('http://localhost:4200/chat');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });

    it('should protect analytics route when not logged in', () => {
      cy.visit('http://localhost:4200/analytics');
      
      // Should redirect to login
      cy.url().should('include', '/login');
    });
  });
});
