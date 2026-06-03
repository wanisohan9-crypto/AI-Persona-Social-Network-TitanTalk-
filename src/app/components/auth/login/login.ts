import { Component } from '@angular/core';
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
    private router: Router
  ) {
    // this.testApiConnection();
  }

  // async testApiConnection() {
  //   this.isApiConnected = await this.authService.testConnection();
  //   if (!this.isApiConnected) {
  //     this.errorMessage = 'Cannot connect to server. Please make sure the API is running.';
  //   }
  // }

  fillDemoAccount(email: string, password: string) {
    this.loginData.email = email;
    this.loginData.password = password;
    this.errorMessage = '';
  }

  async onSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (!this.isApiConnected) {
      this.errorMessage = 'Cannot connect to server. Please try again.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const response = await this.authService.login(this.loginData);

    this.isLoading = false;

    if (response.success) {
      const onboardingData = localStorage.getItem('onboardingData');
      if (onboardingData) {
        this.router.navigate(['/chat']);
      } else {
        this.router.navigate(['/onboarding']);
      }
    } else {
      // Show specific error message based on status code
      this.errorMessage = response.message || 'Login failed. Please try again.';
      
      // Log for debugging
      console.error('Login failed:', {
        status: response.statusCode,
        message: response.message
      });
    }
  }

  isFormValid(): boolean {
    return !!(this.loginData.email && this.loginData.password);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  // retryConnection() {
  //   this.errorMessage = '';
  //   this.testApiConnection();
  // }
}
