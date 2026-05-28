import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PersonaService, Persona } from './persona';

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
private selectedChatSubject = new BehaviorSubject<Chat | null>(null);
  selectedChat$ = this.selectedChatSubject.asObservable();
  
  private chats: Chat[] = [];

  constructor(private personaService: PersonaService) {
    this.initializeChats();
  }

  private initializeChats() {
    // Get user's career interest from localStorage
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

  getChats(): Chat[] {
    return this.chats;
  }

  selectChat(chat: Chat) {
    this.selectedChatSubject.next(chat);
  }

  addMessage(chatId: number, messageText: string) {
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
      
      // Simulate AI response after a short delay
      setTimeout(() => {
        this.addAIResponse(chat);
      }, 1000);
      
      // Update the selected chat to trigger UI refresh
      this.selectedChatSubject.next(chat);
    }
  }

  private addAIResponse(chat: Chat) {
    const responses = this.getPersonaResponses(chat.persona.name);
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    
    const aiMessage: Message = {
      id: Date.now() + 1,
      text: randomResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: false
    };
    
    chat.messages.push(aiMessage);
    chat.lastMessage = randomResponse;
    chat.timestamp = aiMessage.timestamp;
    
    // Update the selected chat to show AI response
    this.selectedChatSubject.next(chat);
  }

  private getPersonaResponses(personaName: string): string[] {
    const responseMap: { [key: string]: string[] } = {
      'Sam Altman': [
        'That\'s a fascinating idea! Have you thought about the market size?',
        'Focus on building something people want. What\'s your MVP?',
        'Great question! Y Combinator always says "talk to your users".',
        'The key is to start small and iterate quickly. What\'s your next step?'
      ],
      'Paul Graham': [
        'Interesting perspective! What problem are you really solving?',
        'Remember, startups are about growth. How will you scale this?',
        'That reminds me of something I wrote about in my essays...',
        'The best startups often start as side projects. Keep building!'
      ],
      'Elon Musk': [
        'Think bigger! How can we make this 10x better?',
        'First principles thinking - what are the fundamental truths here?',
        'We need to accelerate the world\'s transition to sustainable solutions.',
        'That\'s exactly the kind of problem we should be solving!'
      ],
      'Johnny Depp': [
        'Every character is a journey into the unknown, mate.',
        'The key is to find the truth in every role you play.',
        'Method acting? Sometimes you have to become the character.',
        'What\'s the story behind your character\'s eyes?'
      ],
      'Warren Buffett': [
        'Buy wonderful companies at fair prices, not fair companies at wonderful prices.',
        'The stock market is a voting machine in the short run, but a weighing machine in the long run.',
        'Rule No. 1: Never lose money. Rule No. 2: Never forget rule No. 1.',
        'Price is what you pay, value is what you get.'
      ]
    };
    
    return responseMap[personaName] || [
      'That\'s very interesting! Tell me more.',
      'I see your point. What do you think about that?',
      'Great insight! How did you come to that conclusion?',
      'That\'s a thoughtful perspective. What\'s your next move?'
    ];
  }

  // Method to refresh chats when user completes onboarding
  refreshChatsForUser() {
    this.initializeChats();
  }
}
