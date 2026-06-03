import { Component, OnInit } from '@angular/core';
import { ChatService, Chat } from '../../services/chat';
import { CommonModule } from '@angular/common';
import { AiService } from '../../services/ai';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
})
export class ChatWindow implements OnInit {
  selectedChat: Chat | null = null;
  isApiConnected: boolean = false;
  isTestingApi: boolean = false;

  constructor(
    private chatService: ChatService,
    private aiService: AiService,
  ) {}

  ngOnInit(): void {
    this.chatService.selectedChat$.subscribe((chat) => {
      this.selectedChat = chat;
    });
    this.testApiConnection();
  }
  async testApiConnection() {
    this.isTestingApi = true;
    this.isApiConnected = await this.aiService.testConnection();
    this.isTestingApi = false;

    if (this.isApiConnected) {
      console.log('✅ API connection successful');
    } else {
      console.log('❌ API connection failed');
    }
  }
}
