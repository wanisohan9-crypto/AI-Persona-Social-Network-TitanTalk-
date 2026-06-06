import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { Login } from './login';
import { AuthService, AuthResponse } from '../../../services/auth';

describe('Login Component', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockChangeDetectorRef: jasmine.SpyObj<ChangeDetectorRef>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'getCurrentUser']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ChangeDetectorRef, useValue: cdrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    mockAuthService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockChangeDetectorRef = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(null);
  });

  describe('component initialization', () => {
    it('should create component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with empty login data', () => {
      expect(component.loginData.email).toBe('');
      expect(component.loginData.password).toBe('');
      expect(component.isLoading).toBe(false);
      expect(component.errorMessage).toBe('');
    });
  });

  describe('fillDemoAccount', () => {
    it('should fill demo account credentials', () => {
      component.fillDemoAccount('demo@example.com', 'demo123');
      
      expect(component.loginData.email).toBe('demo@example.com');
      expect(component.loginData.password).toBe('demo123');
      expect(component.errorMessage).toBe('');
    });
  });

  describe('isFormValid', () => {
    it('should return false for empty form', () => {
      expect(component.isFormValid()).toBe(false);
    });

    it('should return false for email only', () => {
      component.loginData.email = 'test@example.com';
      expect(component.isFormValid()).toBe(false);
    });

    it('should return false for password only', () => {
      component.loginData.password = 'password123';
      expect(component.isFormValid()).toBe(false);
    });

    it('should return true for complete form', () => {
      component.loginData.email = 'test@example.com';
      component.loginData.password = 'password123';
      expect(component.isFormValid()).toBe(true);
    });
  });

  describe('onSubmit', () => {
    beforeEach(() => {
      component.loginData.email = 'test@example.com';
      component.loginData.password = 'password123';
    });

    it('should show error for invalid form', async () => {
      component.loginData.email = '';
      
      await component.onSubmit();
      
      expect(component.errorMessage).toBe('Please fill in all fields');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should prevent duplicate submissions', async () => {
      component.isLoading = true;
      
      await component.onSubmit();
      
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should redirect admin to analytics after successful login', async () => {
      const mockResponse: AuthResponse = {
        success: true,
        user: { id: '1', email: 'admin@example.com', name: 'Admin', role: 'admin', createdAt: '2024-01-01' },
        token: 'mock-token'
      };
      
      mockAuthService.login.and.returnValue(Promise.resolve(mockResponse));
      mockAuthService.getCurrentUser.and.returnValue(mockResponse.user!);

      await component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/analytics']);
    });

    it('should redirect user to onboarding if no onboarding data', async () => {
      const mockResponse: AuthResponse = {
        success: true,
        user: { id: '1', email: 'user@example.com', name: 'User', role: 'user', createdAt: '2024-01-01' },
        token: 'mock-token'
      };
      
      mockAuthService.login.and.returnValue(Promise.resolve(mockResponse));
      mockAuthService.getCurrentUser.and.returnValue(mockResponse.user!);
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);

      await component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/onboarding']);
    });

    it('should redirect user to chat if onboarding data exists', async () => {
      const mockResponse: AuthResponse = {
        success: true,
        user: { id: '1', email: 'user@example.com', name: 'User', role: 'user', createdAt: '2024-01-01' },
        token: 'mock-token'
      };
      
      mockAuthService.login.and.returnValue(Promise.resolve(mockResponse));
      mockAuthService.getCurrentUser.and.returnValue(mockResponse.user!);
      (localStorage.getItem as jasmine.Spy).and.returnValue('{"careerInterest": "Technology"}');

      await component.onSubmit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/chat']);
    });

    it('should show error message for failed login', async () => {
      const mockResponse: AuthResponse = {
        success: false,
        message: 'Invalid credentials'
      };
      
      mockAuthService.login.and.returnValue(Promise.resolve(mockResponse));

      await component.onSubmit();

      expect(component.errorMessage).toBe('Invalid credentials');
      expect(component.isLoading).toBe(false);
    });

    it('should handle login exceptions', async () => {
      mockAuthService.login.and.returnValue(Promise.reject(new Error('Network error')));

      await component.onSubmit();

      expect(component.errorMessage).toBe('An unexpected error occurred. Please try again.');
      expect(component.isLoading).toBe(false);
    });
  });

  describe('goToRegister', () => {
    it('should navigate to register page', () => {
      component.goToRegister();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/register']);
    });
  });

  describe('loading state management', () => {
    it('should set loading state during login', async () => {
      const mockResponse: AuthResponse = { success: true, user: { id: '1', email: 'test@example.com', name: 'Test', role: 'user', createdAt: '2024-01-01' }, token: 'token' };
      mockAuthService.login.and.returnValue(Promise.resolve(mockResponse));
      mockAuthService.getCurrentUser.and.returnValue(mockResponse.user!);
      
      component.loginData.email = 'test@example.com';
      component.loginData.password = 'password123';

      const loginPromise = component.onSubmit();
      
      expect(component.isLoading).toBe(true);
      
      await loginPromise;
      
      expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled();
    });
  });
});
