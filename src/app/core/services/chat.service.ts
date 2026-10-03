import {
  Injectable,
  signal
} from '@angular/core';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Chat, Message } from '../../models/chat.model';

import {
  environment
} from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class ChatService {

  private chatsSignal =
    signal<Chat[]>(
      this.loadChatsFromStorage()
    );

  readonly chats =
    this.chatsSignal.asReadonly();

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient
  ) {}


  createRoom(data: any) {

    const token =
      localStorage.getItem('token');

    return this.http.post(

      `${this.apiUrl}/chat-rooms`,

      data,

      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }

    );

  }


  getRooms() {

    const token =
      localStorage.getItem('token');

    return this.http.get(

      `${this.apiUrl}/chat-rooms`,

      {
        headers: new HttpHeaders({
          Authorization: `Bearer ${token}`
        })
      }

    );

  }


  getChats(): Chat[] {

    return this.chatsSignal();

  }


  addChat(chat: Omit<Chat, 'updatedAt'>) {

    const currentChats = [
      ...this.chatsSignal()
    ];

    const existIndex =
      currentChats.findIndex(
        item => item.id === chat.id
      );

    if (existIndex > -1) {

      const existing =
        currentChats[existIndex];

      currentChats[existIndex] = {
        ...existing,
        message: chat.message || existing.message,
        time: chat.time || 'Now',
        unread: chat.unread ?? existing.unread,
        avatar: chat.avatar || existing.avatar,
        name: chat.name || existing.name,
        updatedAt: new Date()
      };

    } else {

      currentChats.unshift({
        ...chat,
        updatedAt: new Date()
      });

    }

    currentChats.sort((a, b) =>
      new Date(b.updatedAt).getTime() -
      new Date(a.updatedAt).getTime()
    );

    this.updateState(currentChats);

  }


  updateLastMessage(
    chatId: number,
    message: string
  ) {

    const currentChats = [
      ...this.chatsSignal()
    ];

    const chatIndex =
      currentChats.findIndex(
        item => item.id === chatId
      );

    if (chatIndex > -1) {

      currentChats[chatIndex] = {
        ...currentChats[chatIndex],
        message: message,
        time: 'Now',
        updatedAt: new Date()
      };

      currentChats.sort((a, b) =>
        new Date(b.updatedAt).getTime() -
        new Date(a.updatedAt).getTime()
      );

      this.updateState(currentChats);

    }

  }

  getMessages(chatId: number): Message[] {

    const saved =
      localStorage.getItem(
        'messages_' + chatId
      );

    return saved ? JSON.parse(saved) : [];

  }



  saveMessages(
    chatId: number,
    messages: Message[]
  ) {

    localStorage.setItem(
      'messages_' + chatId,
      JSON.stringify(messages)
    );

  }


  deleteChat(chatId: number) {

    const filtered =
      this.chatsSignal().filter(
        item => item.id !== chatId
      );

    localStorage.removeItem(
      'messages_' + chatId
    );

    this.updateState(filtered);

  }



  private updateState(chats: Chat[]) {

    this.chatsSignal.set(chats);

    localStorage.setItem(
      'chats',
      JSON.stringify(chats)
    );

  }


  private loadChatsFromStorage(): Chat[] {

    const saved =
      localStorage.getItem('chats');

    return saved ? JSON.parse(saved) : [];

  }

}