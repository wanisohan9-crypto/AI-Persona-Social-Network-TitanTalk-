import { Component, OnInit } from '@angular/core';
import { ChatService, Chat } from '../../services/chat';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-window',
  imports: [CommonModule],
  templateUrl: './chat-window.html',
  styleUrl: './chat-window.css',
})
export class ChatWindow implements OnInit {
    selectedChat: Chat | null = null;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.chatService.selectedChat$.subscribe(chat => {
      this.selectedChat = chat;
    });
  }
}
