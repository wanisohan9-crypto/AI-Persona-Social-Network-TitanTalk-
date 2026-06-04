import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';

interface AnalyticsData {
  totalUsers: number;
  totalConversations: number;
  activeUsers: number;
  popularPersona: string;
  conversationTrends: { date: string; count: number }[];
  personaDistribution: { name: string; percentage: number; color: string }[];
  userDemographics: { ageGroup: string; count: number }[];
  engagementMetrics: {
    avgResponseTime: string;
    avgMessagesPerSession: number;
    totalMessages: number;
  };
}

@Component({
  selector: 'app-analytics',
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics implements OnInit {
  analyticsData: AnalyticsData | null = null;
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Verify admin access
    if (!this.authService.isAdmin()) {
      console.log('Access denied: Not an admin');
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();
    this.loadAnalyticsData();
  }

  private loadAnalyticsData() {
    // Generate dummy analytics data
    this.analyticsData = {
      totalUsers: 1247,
      totalConversations: 8936,
      activeUsers: 423,
      popularPersona: 'Elon Musk',
      conversationTrends: [
        { date: '2024-01-01', count: 45 },
        { date: '2024-01-02', count: 67 },
        { date: '2024-01-03', count: 89 },
        { date: '2024-01-04', count: 123 },
        { date: '2024-01-05', count: 156 },
        { date: '2024-01-06', count: 187 },
        { date: '2024-01-07', count: 234 }
      ],
      personaDistribution: [
        { name: 'Startup Founder', percentage: 35, color: '#667eea' },
        { name: 'Technology', percentage: 25, color: '#764ba2' },
        { name: 'Finance', percentage: 20, color: '#f093fb' },
        { name: 'Acting', percentage: 15, color: '#f5576c' },
        { name: 'Fitness', percentage: 5, color: '#4facfe' }
      ],
      userDemographics: [
        { ageGroup: '18-25', count: 312 },
        { ageGroup: '26-35', count: 456 },
        { ageGroup: '36-45', count: 289 },
        { ageGroup: '46-55', count: 134 },
        { ageGroup: '55+', count: 56 }
      ],
      engagementMetrics: {
        avgResponseTime: '2.3s',
        avgMessagesPerSession: 8.7,
        totalMessages: 24532
      }
    };
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
