import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatList } from '../chat-list/chat-list';
import { ChatWindow } from '../chat-window/chat-window';
import { MessageInput } from '../message-input/message-input';
import { ChatService } from '../../services/chat';
import { AuthService, User } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-layout',
  imports: [CommonModule, ChatList, ChatWindow, MessageInput],
  templateUrl: './chat-layout.html',
  styleUrl: './chat-layout.css',
})
export class ChatLayout implements OnInit {
    currentUser: User | null = null;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    const onboardingData = localStorage.getItem('onboardingData');
    if (!onboardingData) {
      this.router.navigate(['/onboarding']);
      return;
    }

    this.chatService.refreshChatsForUser();
  }

  goToAnalytics() {
    this.router.navigate(['/analytics']);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
