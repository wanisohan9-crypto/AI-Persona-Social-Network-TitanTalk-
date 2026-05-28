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
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedChat) {
      this.chatService.addMessage(this.selectedChat.id, this.newMessage.trim());
      this.newMessage = '';
      this.showTypingIndicator();
    }
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  private showTypingIndicator() {
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
    }, 1500);
  }
}
