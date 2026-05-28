import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatList } from '../chat-list/chat-list';
import { ChatWindow } from '../chat-window/chat-window';
import { MessageInput } from '../message-input/message-input';
import { ChatService } from '../../services/chat';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-layout',
  imports: [CommonModule, ChatList, ChatWindow, MessageInput],
  templateUrl: './chat-layout.html',
  styleUrl: './chat-layout.css',
})
export class ChatLayout implements OnInit {
  constructor(
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if user has completed onboarding
    const onboardingData = localStorage.getItem('onboardingData');
    if (!onboardingData) {
      // Redirect to onboarding if not completed
      this.router.navigate(['/onboarding']);
      return;
    }

    // Refresh chats based on user's career interest
    this.chatService.refreshChatsForUser();
  }
} 
