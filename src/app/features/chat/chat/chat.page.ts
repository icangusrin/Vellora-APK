import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  Router
} from '@angular/router';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import { environment } from 'src/environments/environment';
import {
  searchOutline,
  createOutline,
  ellipsisVerticalOutline,
  storefrontOutline,
  chatbubbleOutline,
  chevronForwardOutline,
  lockClosedOutline,
  personOutline,
  cartOutline
} from 'ionicons/icons';

import { ChatService } from '../../../core/services/chat.service';

import {
  AuthService
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon
  ]
})

export class ChatPage implements OnInit {

  chats: any[] = [];

  filteredChats: any[] = [];

  searchText: string = '';

  isLoading = false;


  isLoggedIn = false;

  constructor(
    private chatService: ChatService,
    private authService: AuthService,
    private router: Router
  ) {

    addIcons({
      searchOutline,
      createOutline,
      ellipsisVerticalOutline,
      storefrontOutline,
      chatbubbleOutline,
      chevronForwardOutline,
      lockClosedOutline,
      personOutline,
      cartOutline
    });

  }

  ngOnInit() {
    this.checkAuthAndLoad();
  }

  ionViewWillEnter() {
    this.checkAuthAndLoad();
  }

  checkAuthAndLoad() {

    this.isLoggedIn = this.authService.isLoggedIn();

    if (this.isLoggedIn) {
      this.loadChats();
    } else {
      this.chats = [];
      this.filteredChats = [];
    }

  }


  loadChats() {

    this.isLoading = true;

    this.chatService.getRooms().subscribe({

      next: (res: any) => {

        const currentUser = JSON.parse(
          localStorage.getItem('user') || '{}'
        );

        this.chats = (res.data || []).map((room: any) => {

          const isMe = Number(room.buyer_id) === Number(currentUser.id);

          const partnerName = isMe
            ? room.seller?.store?.store_name ||
              room.seller?.name ||
              'Penjual'
            : room.buyer?.name || 'Pembeli';

          const partnerAvatar = isMe
            ? room.seller?.store?.store_logo
              ? `${environment.baseUrl}/` + room.seller.store.store_logo
              : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
            : room.buyer?.profile_photo_path
              ? `${environment.baseUrl}/` + room.buyer.profile_photo_path
              : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

          const lastMsg  = room.last_message;

          let cachedLastMsg: { text: string; time: string } | null = null;
          try {
            const raw = localStorage.getItem(`last_msg_${room.id}`);
            if (raw) cachedLastMsg = JSON.parse(raw);
          } catch (e) {}

          const lastText = lastMsg?.message
            ? lastMsg.message
            : (lastMsg?.image_url ? '📷 Foto'
              : (cachedLastMsg?.text || 'Mulai percakapan...'));

          const lastTime = lastMsg?.created_at
            ? this.formatTime(lastMsg.created_at)
            : (cachedLastMsg?.time ? this.formatTime(cachedLastMsg.time) : '--:--');

          return {
            id:      room.id,
            name:    partnerName,
            avatar:  partnerAvatar,
            message: lastText,
            time:    lastTime,
            unread:  0
          };

        });

        this.filteredChats = [...this.chats];
        this.isLoading = false;

      },

      error: (err:any) => {
        console.log('GET ROOMS ERROR:', err);
        this.isLoading = false;
      }

    });

  }

  searchChat() {

    const keyword = this.searchText.toLowerCase().trim();

    if (!keyword) {
      this.filteredChats = [...this.chats];
      return;
    }

    this.filteredChats = this.chats.filter(chat => {
      const name    = (chat.name    || '').toLowerCase();
      const message = (chat.message || '').toLowerCase();
      return name.includes(keyword) || message.includes(keyword);
    });

  }

 
  openChat(chat: any) {

    this.router.navigate(
      ['/chat-detail', chat.id],
      {
        state: {
          chatData: chat
        }
      }
    );

  }


  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }


  formatTime(datetime: string): string {

    if (!datetime) return '';

    const date = new Date(datetime);
    const now  = new Date();


    const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.floor(diffTime / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }

    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7)   return `${diffDays}h`;

    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short'
    });

  }

}