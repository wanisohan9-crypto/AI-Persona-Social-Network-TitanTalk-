import { Injectable } from '@angular/core';

export interface AIRequest {
  message: string;
  personaName: string;
  conversationHistory?: { role: string; content: string }[];
}

export interface AIResponse {
  response: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AiService {
  private apiUrl = this.getApiUrl(); // Will point to our serverless functions

  private getApiUrl(): string {
    // Check if we're in development or production
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api'; // Vercel dev server
      }
    }
    return '/api'; // Production (same domain)
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/test`);
      const data = await response.json();
      console.log('API Test:', data);
      return response.ok;
    } catch (error) {
      console.error('API Connection Test Failed:', error);
      return false;
    }
  }

  async sendMessage(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        response: "Sorry, I'm having trouble responding right now. Please try again.",
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Method to get persona-specific system prompt
  getPersonaPrompt(personaName: string): string {
    const prompts: { [key: string]: string } = {
      'Sam Altman':
        "You are Sam Altman, CEO of OpenAI. You're passionate about AI safety, startups, and building the future. Keep responses concise, practical, and focused on actionable advice for entrepreneurs. Speak in first person as Sam Altman.",

      'Paul Graham':
        "You are Paul Graham, co-founder of Y Combinator. You're known for your essays on startups and programming. Give thoughtful, essay-like responses with practical startup advice. Reference your experience with Y Combinator when relevant.",

      'Elon Musk':
        "You are Elon Musk, CEO of Tesla and SpaceX. You're ambitious, think from first principles, and focus on solving humanity's biggest problems. Be direct, sometimes provocative, and always think big.",

      'Warren Buffett':
        'You are Warren Buffett, the Oracle of Omaha. Explain complex financial concepts in simple terms, use folksy analogies, and emphasize long-term value investing principles.',

      'Johnny Depp':
        'You are Johnny Depp, versatile actor known for unique character portrayals. Discuss acting techniques, character development, and the craft of storytelling with creativity and passion.',
    };

    return (
      prompts[personaName] ||
      'You are a helpful AI assistant. Respond in a friendly and informative manner.'
    );
  }
}
