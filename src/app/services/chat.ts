import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PersonaService, Persona } from './persona';
import { AiService } from './ai';
import { isPlatformBrowser } from '@angular/common';

export interface Message {
  id: number;
  text: string;
  timestamp: string;
  isOwn: boolean;
}

export interface Chat {
  id: number;
  name: string;
  lastMessage: string;
  timestamp: string;
  avatar: string;
  messages: Message[];
  persona: Persona;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private platformId = inject(PLATFORM_ID);
  private selectedChatSubject = new BehaviorSubject<Chat | null>(null);
  selectedChat$ = this.selectedChatSubject.asObservable();
  
  // Observable to track if AI is typing
  private isAITypingSubject = new BehaviorSubject<boolean>(false);
  isAITyping$ = this.isAITypingSubject.asObservable();
  
  private chats: Chat[] = [];

  constructor(private personaService: PersonaService, private aiService: AiService) {
    this.initializeChats();
  }

  private initializeChats() {
    if (isPlatformBrowser(this.platformId)) {
      const onboardingData = localStorage.getItem('onboardingData');
      if (onboardingData) {
        const userData = JSON.parse(onboardingData);
        const personas = this.personaService.getPersonasByCategory(userData.careerInterest);
        
        this.chats = personas.map(persona => ({
          id: persona.id,
          name: persona.name,
          lastMessage: persona.greeting,
          timestamp: 'Now',
          avatar: persona.avatar,
          persona: persona,
          messages: [
            {
              id: 1,
              text: persona.greeting,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isOwn: false
            }
          ]
        }));
      }
    }
  }

  getChats(): Chat[] {
    return this.chats;
  }

  selectChat(chat: Chat) {
    this.selectedChatSubject.next(chat);
  }

  async addMessage(chatId: number, messageText: string) {
    const chat = this.chats.find(c => c.id === chatId);
    if (chat) {
      const newMessage: Message = {
        id: Date.now(),
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      
      chat.messages.push(newMessage);
      chat.lastMessage = messageText;
      chat.timestamp = newMessage.timestamp;

      // Update UI immediately with user message
      this.selectedChatSubject.next(chat);
      
      // Show typing indicator
      this.isAITypingSubject.next(true);
      
      // Get AI response
      await this.getAIResponse(chat, messageText);
      
      // Hide typing indicator
      this.isAITypingSubject.next(false);
    }
  }

  private async getAIResponse(chat: Chat, userMessage: string) {
    try {
      // Prepare conversation history (last 10 messages for context)
      const recentMessages = chat.messages.slice(-10).map(msg => ({
        role: msg.isOwn ? 'user' : 'assistant',
        content: msg.text
      }));

      // Call AI service
      const aiResponse = await this.aiService.sendMessage({
        message: userMessage,
        personaName: chat.persona.name,
        conversationHistory: recentMessages
      });

      // Add AI response to chat
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false
      };
      
      chat.messages.push(aiMessage);
      chat.lastMessage = aiResponse.response;
      chat.timestamp = aiMessage.timestamp;
      
      // Update UI with AI response
      this.selectedChatSubject.next(chat);

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback message if AI fails
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: 'Sorry, I\'m having trouble responding right now. Please try again in a moment.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: false
      };
      
      chat.messages.push(errorMessage);
      chat.lastMessage = errorMessage.text;
      chat.timestamp = errorMessage.timestamp;
      
      this.selectedChatSubject.next(chat);
    }
  }

  refreshChatsForUser() {
    this.initializeChats();
  }
}
