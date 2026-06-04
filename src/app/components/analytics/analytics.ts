import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

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
  styleUrl: './analytics.css'
})
export class Analytics implements OnInit, AfterViewInit {
  @ViewChild('personaChart') personaChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('demographicsChart') demographicsChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('trendsChart') trendsChartRef!: ElementRef<HTMLCanvasElement>;

  analyticsData: AnalyticsData | null = null;
  currentUser: any;
  
  private personaChart: Chart | null = null;
  private demographicsChart: Chart | null = null;
  private trendsChart: Chart | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAdmin()) {
      console.log('Access denied: Not an admin');
      this.router.navigate(['/login']);
      return;
    }

    this.currentUser = this.authService.getCurrentUser();
    this.loadAnalyticsData();
  }

  ngAfterViewInit() {
    // Create charts after view is initialized
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  private loadAnalyticsData() {
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

  private createCharts() {
    if (!this.analyticsData) return;

    this.createPersonaChart();
    this.createDemographicsChart();
    this.createTrendsChart();
  }

  private createPersonaChart() {
    const ctx = this.personaChartRef.nativeElement.getContext('2d');
    if (!ctx || !this.analyticsData) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: this.analyticsData.personaDistribution.map(item => item.name),
        datasets: [{
          data: this.analyticsData.personaDistribution.map(item => item.percentage),
          backgroundColor: this.analyticsData.personaDistribution.map(item => item.color),
          borderWidth: 0,
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                return `${context.label}: ${context.parsed}%`;
              }
            }
          }
        }
      }
    };

    this.personaChart = new Chart(ctx, config);
  }

  private createDemographicsChart() {
    const ctx = this.demographicsChartRef.nativeElement.getContext('2d');
    if (!ctx || !this.analyticsData) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.analyticsData.userDemographics.map(item => item.ageGroup),
        datasets: [{
          label: 'Users',
          data: this.analyticsData.userDemographics.map(item => item.count),
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 50
            }
          }
        }
      }
    };

    this.demographicsChart = new Chart(ctx, config);
  }

  private createTrendsChart() {
    const ctx = this.trendsChartRef.nativeElement.getContext('2d');
    if (!ctx || !this.analyticsData) return;

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: this.analyticsData.conversationTrends.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }),
        datasets: [{
          label: 'Conversations',
          data: this.analyticsData.conversationTrends.map(item => item.count),
          borderColor: 'rgba(102, 126, 234, 1)',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 25
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    };

    this.trendsChart = new Chart(ctx, config);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy() {
    // Clean up charts to prevent memory leaks
    this.personaChart?.destroy();
    this.demographicsChart?.destroy();
    this.trendsChart?.destroy();
  }
}
