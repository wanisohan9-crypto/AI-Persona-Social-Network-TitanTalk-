import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    // Allow access during SSR, actual check will happen in browser
    if (typeof window === 'undefined') {
      return true;
    }

    if (this.authService.isAuthenticated()) {
      return true;
    }
    
    // Redirect to login if not authenticated
    this.router.navigate(['/login']);
    return false;
  }
}
