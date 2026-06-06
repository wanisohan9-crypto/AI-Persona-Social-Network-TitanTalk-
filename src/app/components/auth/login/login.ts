import { Component, ChangeDetectorRef } from '@angular/core';
import {CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService , LoginRequest} from '../../../services/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  isApiConnected = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  fillDemoAccount(email: string, password: string) {
    this.loginData.email = email;
    this.loginData.password = password;
    this.errorMessage = '';
  }

  async onSubmit() {
    if (this.isLoading) {
      console.log('Login already in progress, ignoring duplicate submission');
      return;
    }

    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    console.log('Starting login process...');
    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      console.log('Calling auth service...');
      const response = await this.authService.login(this.loginData);
      
      console.log('Login response received:', response);

      if (response && response.success) {
        console.log('Login successful, checking user role...');
        
        const user = this.authService.getCurrentUser();
        if (user?.role === 'admin') {
          console.log('Admin user, redirecting to analytics');
          this.router.navigate(['/analytics']);
        } else {
          console.log('Regular user, checking onboarding status');
          const onboardingData = localStorage.getItem('onboardingData');
          if (onboardingData) {
            this.router.navigate(['/chat']);
          } else {
            this.router.navigate(['/onboarding']);
          }
        }
      } else {
        console.log('Login failed:', response?.message || 'No response');
        this.errorMessage = response?.message || 'Login failed. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      this.errorMessage = 'An unexpected error occurred. Please try again.';
      this.isLoading = false;
      this.cdr.detectChanges();
    } finally {
      setTimeout(() => {
        if (this.isLoading) {
          console.warn('Loading state still true after completion, forcing reset');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      }, 100);
      console.log('Login process completed');
    }
  }

  isFormValid(): boolean {
    return !!(this.loginData.email && this.loginData.password);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}
