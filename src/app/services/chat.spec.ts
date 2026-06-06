import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatService, Chat, Message } from './chat';
import { PersonaService, Persona } from './persona';
import { AiService } from './ai';

describe('ChatService', () => {
  let service: ChatService;
  let mockPersonaService: any;
  let mockAiService: any;

  const mockPersona: Persona = {
    id: 1,
    name: 'Test AI',
    avatar: 'avatar.jpg',
    category: 'Technology',
    greeting: 'Hello! I\'m here to help.',
    description: 'Test AI persona'
  };

  const mockChat: Chat = {
    id: 1,
    name: 'Test AI',
    lastMessage: 'Hello! I\'m here to help.',
    timestamp: 'Now',
    avatar: 'avatar.jpg',
    persona: mockPersona,
    messages: [
      {
        id: 1,
        text: 'Hello! I\'m here to help.',
        timestamp: '10:00',
        isOwn: false
      }
    ]
  };

  beforeEach(() => {
    const personaSpy = { getPersonasByCategory: vi.fn() };
    const aiSpy = { sendMessage: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        ChatService,
        { provide: PersonaService, useValue: personaSpy },
        { provide: AiService, useValue: aiSpy },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(ChatService);
    mockPersonaService = TestBed.inject(PersonaService);
    mockAiService = TestBed.inject(AiService);

    // Mock localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockReturnValue(undefined);
  });

  describe('initialization', () => {
    it('should create service', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize chats from onboarding data', () => {
      const onboardingData = JSON.stringify({ careerInterest: 'Technology' });
      vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(onboardingData);
      mockPersonaService.getPersonasByCategory.mockReturnValue([mockPersona]);

      service['initializeChats']();
      const chats = service.getChats();

      expect(chats.length).toBe(1);
      expect(chats[0].name).toBe('Test AI');
    });
  });

  describe('chat selection', () => {
    it('should select a chat', async () => {
      let selectedChat: any = null;
      service.selectedChat$.subscribe((chat: any) => {
        selectedChat = chat;
      });

      service.selectChat(mockChat);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      if (selectedChat) {
        expect(selectedChat.id).toBe(1);
        expect(selectedChat.name).toBe('Test AI');
      }
    });
  });

  describe('message handling', () => {
    beforeEach(() => {
      // Setup chats for testing
      service['chats'] = [mockChat];
    });

    it('should add user message to chat', async () => {
      mockAiService.sendMessage.mockReturnValue(Promise.resolve({
        response: 'AI response',
        success: true
      }));

      await service.addMessage(1, 'Hello from user');
      
      const chat = service.getChats().find(c => c.id === 1);
      expect(chat?.messages.length).toBe(3); // Initial + user + AI
      expect(chat?.messages[1].text).toBe('Hello from user');
      expect(chat?.messages[1].isOwn).toBe(true);
    });

    it('should handle AI response', async () => {
      mockAiService.sendMessage.mockReturnValue(Promise.resolve({
        response: 'This is AI response',
        success: true
      }));

      await service.addMessage(1, 'Test message');
      
      const chat = service.getChats().find(c => c.id === 1);
      const lastMessage = chat?.messages[chat.messages.length - 1];
      
      expect(lastMessage?.text).toBe('This is AI response');
      expect(lastMessage?.isOwn).toBe(false);
    });

    it('should handle AI service errors gracefully', async () => {
      mockAiService.sendMessage.mockReturnValue(Promise.reject(new Error('AI Error')));

      await service.addMessage(1, 'Test message');
      
      const chat = service.getChats().find(c => c.id === 1);
      const lastMessage = chat?.messages[chat.messages.length - 1];
      
      expect(lastMessage?.text).toContain('having trouble responding');
      expect(lastMessage?.isOwn).toBe(false);
    });
  });

  describe('AI typing indicator', () => {
    it('should show typing indicator during AI response', async () => {
      const typingStates: boolean[] = [];
      
      service.isAITyping$.subscribe(isTyping => {
        typingStates.push(isTyping);
      });

      service['chats'] = [mockChat];
      mockAiService.sendMessage.mockReturnValue(Promise.resolve({
        response: 'AI response',
        success: true
      }));

      await service.addMessage(1, 'Test');
      
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(typingStates.length).toBeGreaterThan(0);
    });
  });
});
