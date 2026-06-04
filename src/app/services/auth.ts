import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
   role: 'user' | 'admin'; 
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
  statusCode?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private apiUrl = this.getApiUrl();

  constructor() {
    if (this.isBrowser()) {
      this.checkStoredAuth();
    }
  }

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private getApiUrl(): string {
    if (this.isBrowser()) {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
      }
    }
    return '/api';
  }

  private checkStoredAuth() {
    if (!this.isBrowser()) return;

    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        this.currentUserSubject.next(userData);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }

  private getErrorMessage(status: number, defaultMessage: string): string {
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Invalid email or password. Please try again.';
      case 403:
        return 'Access denied. Please contact support.';
      case 404:
        return 'Service not found. Please try again later.';
      case 409:
        return 'Email already registered. Please use a different email.';
      case 422:
        return 'Invalid data provided. Please check your input.';
      case 429:
        return 'Too many attempts. Please wait and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again.';
      case 503:
        return 'Service maintenance. Please try again later.';
      default:
        return defaultMessage;
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    console.log('AuthService: Starting login request');
    console.log('AuthService: Credentials:', { email: credentials.email, passwordLength: credentials.password?.length });
    
    try {
      console.log('AuthService: Making fetch request to', `${this.apiUrl}/auth/login`);
      
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(credentials)
      });

      console.log('AuthService: Response received, status:', response.status, 'ok:', response.ok);

      // Always try to parse the response
      let data: any = null;
      const contentType = response.headers.get('content-type');
      console.log('AuthService: Response content-type:', contentType);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
          console.log('AuthService: Response data:', data);
        } catch (jsonError) {
          console.error('AuthService: Failed to parse JSON response:', jsonError);
          return {
            success: false,
            message: 'Invalid response from server',
            statusCode: response.status
          };
        }
      } else {
        console.warn('AuthService: Response is not JSON');
        return {
          success: false,
          message: this.getErrorMessage(response.status, 'Invalid server response'),
          statusCode: response.status
        };
      }

      // Check for successful login
      if (response.ok && data && data.success && data.user && data.token) {
        console.log('AuthService: Login successful, storing user data');
        if (this.isBrowser()) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        this.currentUserSubject.next(data.user);
        return { ...data, statusCode: response.status };
      } else {
        // Login failed
        console.log('AuthService: Login failed, response.ok:', response.ok, 'data:', data);
        const errorMessage = (data && data.message) || this.getErrorMessage(response.status, 'Login failed');
        return { 
          success: false, 
          message: errorMessage,
          statusCode: response.status
        };
      }

    } catch (error) {
      console.error('AuthService: Exception during login:', error);
      console.error('AuthService: Error type:', error?.constructor?.name);
      console.error('AuthService: Error message:', error instanceof Error ? error.message : String(error));
      
      if (error instanceof TypeError) {
        return { 
          success: false, 
          message: 'Connection failed. Please check your internet connection.',
          statusCode: 0
        };
      }
      
      return { 
        success: false, 
        message: 'An error occurred. Please try again.',
        statusCode: 0
      };
    } finally {
      console.log('AuthService: Login function completed');
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.success && data.user && data.token) {
        if (this.isBrowser()) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.user));
        }
        this.currentUserSubject.next(data.user);
        return { ...data, statusCode: response.status };
      } else {
        const errorMessage = data.message || this.getErrorMessage(response.status, 'Registration failed');
        return { 
          success: false, 
          message: errorMessage,
          statusCode: response.status
        };
      }

    } catch (error) {
      console.error('Registration network error:', error);
      
      if (error instanceof TypeError) {
        return { 
          success: false, 
          message: 'Connection failed. Please check your internet connection.',
          statusCode: 0
        };
      }
      
      return { 
        success: false, 
        message: 'Network error. Please try again.',
        statusCode: 0
      };
    }
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('onboardingData');
    }
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    if (!this.isBrowser()) return null;
    return localStorage.getItem('authToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getCurrentUser();
  }

  // Method to test API connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/test`);
      return response.ok;
    } catch (error) {
      console.error('API Connection Test Failed:', error);
      return false;
    }
  }

  isAdmin(): boolean {
  const user = this.getCurrentUser();
  return user?.role === 'admin';
}

// Add this method to get user role
getUserRole(): 'user' | 'admin' | null {
  const user = this.getCurrentUser();
  return user?.role || null;
}
}
