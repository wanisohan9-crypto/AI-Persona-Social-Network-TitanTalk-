import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService, User, LoginRequest, RegisterRequest } from './auth';

describe('AuthService', () => {
  let service: AuthService;
  let mockFetch: any;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
    createdAt: '2024-01-01'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockReturnValue(undefined);
    vi.spyOn(Storage.prototype, 'removeItem').mockReturnValue(undefined);
    
    // Mock fetch
    mockFetch = vi.spyOn(window, 'fetch' as any);
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const mockResponse = { success: true, user: mockUser, token: 'mock-token' };
      mockFetch.mockReturnValue(Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
        headers: { get: () => 'application/json' }
      } as unknown as Response));

      const credentials: LoginRequest = { email: 'test@example.com', password: 'password' };
      const result = await service.login(credentials);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'mock-token');
    });

    it('should handle login failure', async () => {
      mockFetch.mockReturnValue(Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ success: false, message: 'Invalid credentials' }),
        headers: { get: () => 'application/json' }
      } as unknown as Response));

      const credentials: LoginRequest = { email: 'wrong@example.com', password: 'wrong' };
      const result = await service.login(credentials);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid credentials');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true when user is logged in', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('mock-token');
      vi.spyOn(service, 'getCurrentUser').mockReturnValue(mockUser);
      
      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('should clear storage and reset user', () => {
      service.logout();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
      expect(service.getCurrentUser()).toBeNull();
    });
  });
});
