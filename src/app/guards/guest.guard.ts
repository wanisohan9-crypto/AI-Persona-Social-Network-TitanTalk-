import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {

    constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (!this.authService.isAuthenticated()) {
      return true;
    }
    
    // Redirect authenticated users to appropriate page
    const onboardingData = localStorage.getItem('onboardingData');
    if (onboardingData) {
      this.router.navigate(['/chat']);
    } else {
      this.router.navigate(['/onboarding']);
    }
    return false;
  }
}
