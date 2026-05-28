import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, Routes } from '@angular/router';
import { Onboarding } from './components/onboarding/onboarding';
import { ChatLayout } from './components/chat-layout/chat-layout';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

const routes: Routes = [
  { path: '', redirectTo: '/onboarding', pathMatch: 'full' },
  { path: 'onboarding', component: Onboarding },
  { path: 'chat', component: ChatLayout }
];

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay())
  ]
};
