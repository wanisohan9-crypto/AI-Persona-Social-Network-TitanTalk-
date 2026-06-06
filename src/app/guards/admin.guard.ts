import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Check if user is authenticated first
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if user is admin
    if (this.authService.isAdmin()) {
      return true;
    }

    // If not admin, redirect to appropriate page
    console.log('Access denied: User is not admin');
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      this.router.navigate(['/chat']);
    } else {
      this.router.navigate(['/onboarding']);
    }
    return false;
  }
}
