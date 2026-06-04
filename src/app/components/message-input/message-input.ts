import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatService, Chat } from '../../services/chat';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-message-input',
  imports: [FormsModule, CommonModule],
  templateUrl: './message-input.html',
  styleUrl: './message-input.css',
})
export class MessageInput implements OnInit {
  selectedChat: Chat | null = null;
  newMessage: string = '';
  isTyping: boolean = false;

  constructor(private chatService: ChatService) { }

  ngOnInit(): void {
    this.chatService.selectedChat$.subscribe(chat => {
      this.selectedChat = chat;
    });
    
    // Subscribe to AI typing status
    this.chatService.isAITyping$.subscribe(typing => {
      this.isTyping = typing;
    });
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedChat) {
      this.chatService.addMessage(this.selectedChat.id, this.newMessage.trim());
      this.newMessage = '';
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}
