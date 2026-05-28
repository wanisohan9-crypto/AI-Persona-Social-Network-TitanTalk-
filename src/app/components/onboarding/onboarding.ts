import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface OnboardingData {
  name: string;
  age: number | null;
  gender: string;
  careerInterest: string;
}

@Component({
  selector: 'app-onboarding',
  imports: [FormsModule, CommonModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {
  onboardingData: OnboardingData = {
    name: '',
    age: null,
    gender: '',
    careerInterest: ''
  };

  careerOptions = [
    'Startup Founder',
    'Acting',
    'Finance',
    'Technology',
    'Fitness'
  ];

  constructor(private router: Router) {}

  onSubmit() {
    if (this.isFormValid()) {
      // Store data and navigate to chat
      localStorage.setItem('onboardingData', JSON.stringify(this.onboardingData));
      this.router.navigate(['/chat']);
    }
  }

  isFormValid(): boolean {
    return !!(this.onboardingData.name && 
              this.onboardingData.age && 
              this.onboardingData.gender && 
              this.onboardingData.careerInterest);
  }
}
