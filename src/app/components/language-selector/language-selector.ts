import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-language-selector',
  imports: [CommonModule],
    template: `
    <div class="language-selector">
      <div class="current-lang" (click)="toggleDropdown()">
        <span class="flag">{{ getCurrentFlag() }}</span>
        <span class="lang-code">{{ getCurrentLanguage().toUpperCase() }}</span>
        <span class="dropdown-arrow" [class.open]="isDropdownOpen">▼</span>
      </div>
      
      @if (isDropdownOpen) {
        <div class="language-dropdown">
          @for (lang of languages; track lang.code) {
            <div 
              class="language-option"
              [class.active]="currentLanguage === lang.code"
              (click)="changeLanguage(lang.code)">
              <span class="flag">{{ lang.flag }}</span>
              <span class="lang-name">{{ lang.name }}</span>
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './language-selector.css',
})
export class LanguageSelector implements OnInit {
  currentLanguage: string = 'en';
  isDropdownOpen: boolean = false;

  languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  ngOnInit() {
    // Detect current language from URL or localStorage
    this.currentLanguage = this.detectCurrentLanguage();
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.language-selector')) {
        this.isDropdownOpen = false;
      }
    });
  }

  private detectCurrentLanguage(): string {
    // Check if running on specific language ports
    const port = window.location.port;
    if (port === '4201') return 'es';
    if (port === '4202') return 'fr';
    
    // Check localStorage for saved preference
    const savedLang = localStorage.getItem('selectedLanguage');
    return savedLang || 'en';
  }

  getCurrentLanguage(): string {
    return this.currentLanguage;
  }

  getCurrentFlag(): string {
    const currentLang = this.languages.find(lang => lang.code === this.currentLanguage);
    return currentLang?.flag || '🇺🇸';
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  changeLanguage(langCode: string) {
    this.currentLanguage = langCode;
    this.isDropdownOpen = false;
    
    // Save preference
    localStorage.setItem('selectedLanguage', langCode);
    
    // Redirect to appropriate language version
    this.redirectToLanguage(langCode);
  }

  private redirectToLanguage(langCode: string) {
    const currentUrl = window.location.pathname;
    
    switch (langCode) {
      case 'es':
        window.location.href = `http://localhost:4201${currentUrl}`;
        break;
      case 'fr':
        window.location.href = `http://localhost:4202${currentUrl}`;
        break;
      default:
        window.location.href = `http://localhost:4200${currentUrl}`;
        break;
    }
  }
}
