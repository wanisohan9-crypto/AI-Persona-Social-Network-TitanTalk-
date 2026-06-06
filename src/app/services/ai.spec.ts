import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AiService, AIRequest, AIResponse } from './ai';

describe('AiService', () => {
  let service: AiService;
  let mockFetch: any;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiService);
    
    // Mock fetch
    mockFetch = vi.spyOn(window, 'fetch' as any);
  });

  describe('initialization', () => {
    it('should create service', () => {
      expect(service).toBeTruthy();
    });

    it('should set correct API URL for localhost', () => {
      const apiUrl = service['getApiUrl']();
      expect(apiUrl).toContain('api');
    });
  });

  describe('testConnection', () => {
    it('should return true for successful connection', async () => {
      mockFetch.mockReturnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: 'ok' })
      } as Response));

      const result = await service.testConnection();
      expect(result).toBe(true);
    });

    it('should return false for failed connection', async () => {
      mockFetch.mockReturnValue(Promise.reject(new Error('Network error')));

      const result = await service.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('sendMessage', () => {
    const mockRequest: AIRequest = {
      message: 'Hello AI',
      personaName: 'Sam Altman',
      conversationHistory: [
        { role: 'user', content: 'Previous message' },
        { role: 'assistant', content: 'Previous response' }
      ]
    };

    it('should send message and return AI response', async () => {
      const mockResponse: AIResponse = {
        response: 'Hello! I\'m Sam Altman, happy to help with your startup questions.'
      };

      mockFetch.mockReturnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response));

      const result = await service.sendMessage(mockRequest);
      
      expect(result.response).toBe(mockResponse.response);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/chat'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mockRequest)
        })
      );
    });

    it('should handle API errors gracefully', async () => {
      mockFetch.mockReturnValue(Promise.resolve({
        ok: false,
        status: 500
      } as Response));

      const result = await service.sendMessage(mockRequest);
      
      expect(result.response).toContain('having trouble responding');
      expect(result.error).toBeDefined();
    });

    it('should handle network errors', async () => {
      mockFetch.mockReturnValue(Promise.reject(new Error('Network failed')));

      const result = await service.sendMessage(mockRequest);
      
      expect(result.response).toContain('having trouble responding');
      expect(result.error).toBe('Network failed');
    });

    it('should handle fetch with minimal request data', async () => {
      const simpleRequest: AIRequest = {
        message: 'Hi',
        personaName: 'Paul Graham'
      };

      mockFetch.mockReturnValue(Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ response: 'Hello there!' })
      } as Response));

      const result = await service.sendMessage(simpleRequest);
      expect(result.response).toBe('Hello there!');
    });
  });

  describe('getPersonaPrompt', () => {
    it('should return specific prompt for Sam Altman', () => {
      const prompt = service.getPersonaPrompt('Sam Altman');
      expect(prompt).toContain('Sam Altman');
      expect(prompt).toContain('OpenAI');
    });

    it('should return specific prompt for Paul Graham', () => {
      const prompt = service.getPersonaPrompt('Paul Graham');
      expect(prompt).toContain('Paul Graham');
      expect(prompt).toContain('Y Combinator');
    });

    it('should return default prompt for unknown persona', () => {
      const prompt = service.getPersonaPrompt('Unknown Person');
      expect(prompt).toContain('helpful AI assistant');
    });

    it('should return prompts for all defined personas', () => {
      const personas = ['Sam Altman', 'Paul Graham', 'Elon Musk', 'Warren Buffett', 'Johnny Depp'];
      
      personas.forEach(persona => {
        const prompt = service.getPersonaPrompt(persona);
        expect(prompt).toContain(persona);
        expect(prompt.length).toBeGreaterThan(50);
      });
    });
  });
});
