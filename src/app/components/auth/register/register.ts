import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterRequest } from '../../../services/auth';


@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  registerData: RegisterRequest = {
    name: '',
    email: '',
    password: ''
  };

  confirmPassword = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  async onSubmit() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Please fill in all fields correctly';
      return;
    }

    if (this.registerData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const response = await this.authService.register(this.registerData);

    this.isLoading = false;

    if (response.success) {
      // After successful registration, go to onboarding
      this.router.navigate(['/onboarding']);
    } else {
      this.errorMessage = response.message || 'Registration failed. Please try again.';
    }
  }

  isFormValid(): boolean {
    return !!(
      this.registerData.name &&
      this.registerData.email &&
      this.registerData.password &&
      this.confirmPassword &&
      this.registerData.password.length >= 6
    );
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
