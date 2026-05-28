import { Component, OnInit } from '@angular/core';
import { ChatService, Chat } from '../../services/chat';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat-list',
  imports: [CommonModule],
  templateUrl: './chat-list.html',
  styleUrl: './chat-list.css',
})
export class ChatList implements OnInit {
  chats: Chat[] = [];
  selectedChat: Chat | null = null;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.chats = this.chatService.getChats();
    this.chatService.selectedChat$.subscribe(chat => {
      this.selectedChat = chat;
      // Update chats array to reflect any changes
      this.chats = this.chatService.getChats();
    });
  }

  selectChat(chat: Chat) {
    this.chatService.selectChat(chat);
  }
}
