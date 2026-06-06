import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { Onboarding } from './components/onboarding/onboarding';
import { ChatLayout } from './components/chat-layout/chat-layout';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { Analytics } from './components/analytics/analytics';
import { AdminGuard } from './guards/admin.guard';


const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'login', 
    component: Login,
    canActivate: [GuestGuard]
  },
  { 
    path: 'register', 
    component: Register,
    canActivate: [GuestGuard]
  },
  { 
    path: 'onboarding', 
    component: Onboarding,
    canActivate: [AuthGuard]
  },
  { 
    path: 'chat', 
    component: ChatLayout,
    canActivate: [AuthGuard]
  },
    {
    path: 'analytics',
    component: Analytics,
    canActivate: [AuthGuard, AdminGuard]
  }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};
