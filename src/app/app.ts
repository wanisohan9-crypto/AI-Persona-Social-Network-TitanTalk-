import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {ChatList} from "./components/chat-list/chat-list";
import {ChatWindow} from "./components/chat-window/chat-window";
import {MessageInput} from "./components/message-input/message-input";
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatList, ChatWindow, MessageInput],
  template: '<router-outlet></router-outlet>',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TitanTalk');
}
