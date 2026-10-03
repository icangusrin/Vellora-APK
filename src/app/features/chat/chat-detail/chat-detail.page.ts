import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  NgZone                   
} from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  ActivatedRoute
} from '@angular/router';

import {
  HttpClient,
  HttpHeaders,
  HttpClientModule
} from '@angular/common/http';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  sendOutline,
  imageOutline,
  cameraOutline
} from 'ionicons/icons';

import {
  RealtimeService
} from '../../../core/services/realtime.service';

import {
  environment
} from 'src/environments/environment';

@Component({
  selector: 'app-chat-detail',
  templateUrl: './chat-detail.page.html',
  styleUrls: ['./chat-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    IonContent,
    IonIcon,
  ]
})

export class ChatDetailPage
implements OnInit, OnDestroy, AfterViewChecked {

  @ViewChild('messagesEnd')
  messagesEnd!: ElementRef;

  roomId!: number;

  /*
  FORMAT PESAN:
  {
    id:        number | null   ← ID dari DB, null kalau masih optimistic
    uploadId:  string | null   ← ID unik sementara untuk dedup gambar di realtime
    text:      string | null
    image:     string | null   ← base64 preview ATAU URL server
    sender:    'user'|'seller'
    time:      string          ← waktu format HH:MM (untuk bubble)
    time_raw:  string          ← ISO string asli (untuk day separator)
    pending:   boolean         ← true = belum dikonfirmasi server
    uploading: boolean         ← true = sedang upload gambar
  }
  */
  messages: any[] = [];

  newMessage = '';

  chatData: any = {};

  shopName = '';

  isLoading = true;


  isSending = false;

  isScrolling = false;
  private scrollTimeout: any;

  private currentUserId: number | null = null;

  private shouldScrollDown = false;

  constructor(
    private route:    ActivatedRoute,
    private location: Location,
    private http:     HttpClient,
    private realtime: RealtimeService,
    private ngZone:   NgZone          
  ) {
    addIcons({
      arrowBackOutline,
      sendOutline,
      imageOutline,
      cameraOutline
    });
  }

  ngOnInit() {


    const nav = history.state;
    if (nav.chatData) {
      this.chatData = nav.chatData;
      this.shopName = nav.chatData.name || '';
    }


    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUserId = Number(JSON.parse(userStr).id) || null;
    }

    this.route.params.subscribe(params => {
      this.roomId = Number(params['id']);


      this.messages  = [];
      this.isLoading = true;

      this.loadRoomDetails();
      this.loadMessages();
      this.connectRealtime();
    });

  }

  loadRoomDetails() {
    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.get(
      `${environment.apiUrl}/chat-rooms`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: (res: any) => {
        const rooms = res.data || [];
        const room = rooms.find((r: any) => Number(r.id) === Number(this.roomId));
        if (room) {
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const isMe = Number(room.buyer_id) === Number(currentUser.id);

          const partnerName = isMe
            ? room.seller?.store?.store_name || room.seller?.name || 'Penjual'
            : room.buyer?.name || 'Pembeli';

          const partnerAvatar = isMe
            ? room.seller?.store?.store_logo
              ? `${environment.baseUrl}/` + room.seller.store.store_logo
              : 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png'
            : room.buyer?.profile_photo_path
              ? `${environment.baseUrl}/` + room.buyer.profile_photo_path
              : 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

          this.chatData = {
            ...this.chatData,
            name: partnerName,
            avatar: partnerAvatar
          };
          this.shopName = partnerName;
        }
      },
      error: (err) => {
        console.error('Error loading room details:', err);
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScrollDown) {
      this.scrollToBottom();
      this.shouldScrollDown = false;
    }
  }

  ngOnDestroy() {
    if (this.realtime.echo && this.roomId) {
      this.realtime.echo.leave(`chat.${this.roomId}`);
    }
  }



  loadMessages() {

    const token = localStorage.getItem('token');

    this.http.get(
      `${environment.apiUrl}/chat-rooms/${this.roomId}/messages`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({

      next: (res: any) => {
        const rawMessages = (res.data || []).slice().reverse();

        this.messages = rawMessages.map((msg: any) => ({
          id:        msg.id,
          uploadId:  null,
          text:      msg.message || null,
          sender:    Number(msg.sender_id) === Number(this.currentUserId) ? 'user' : 'seller',
          time:      this.formatTime(msg.created_at),
          time_raw:  msg.created_at,           // [FIX Bug #6] simpan raw ISO string
          image:     msg.image_url || null,
          pending:   false,
          uploading: false
        }));

        this.isLoading        = false;
        this.shouldScrollDown = true;
      },

      error: () => { this.isLoading = false; }

    });

  }


  connectRealtime() {

    const token = localStorage.getItem('token');
    if (!token) return;
    if (this.realtime.echo && this.roomId) {
      this.realtime.echo.leave(`chat.${this.roomId}`);
    }

    this.realtime.connect(token);

    this.realtime.listenChat(this.roomId, (event: any) => {

      const msg = event.message;

      const senderLabel = Number(msg.sender_id) === Number(this.currentUserId)
        ? 'user'
        : 'seller';


      const buildMsg = (overrides: any = {}) => ({
        id:        msg.id,
        uploadId:  null,
        text:      msg.message || null,
        sender:    senderLabel,
        time:      this.formatTime(msg.created_at || new Date().toISOString()),
        time_raw:  msg.created_at || new Date().toISOString(),  // [FIX Bug #6]
        image:     msg.image_url || null,
        pending:   false,
        uploading: false,
        ...overrides
      });

      const alreadyById = this.messages.some(m => m.id === msg.id && msg.id != null);
      if (alreadyById) return;

      if (senderLabel === 'user') {

 
        if (!msg.image_url) {
          const pendingTeksIdx = this.messages.findIndex(
            m => m.pending === true && m.text === msg.message && !m.image
          );
          if (pendingTeksIdx !== -1) {
            this.messages[pendingTeksIdx] = buildMsg();
            this.shouldScrollDown = true;
            return;
          }
        }

        if (msg.upload_id) {
          const pendingImgIdx = this.messages.findIndex(
            m => m.uploadId === msg.upload_id && m.uploading === true
          );
          if (pendingImgIdx !== -1) {
            this.messages[pendingImgIdx] = buildMsg({
              image: msg.image_url || this.messages[pendingImgIdx].image
            });
            this.shouldScrollDown = true;
            return;
          }
        }

        if (msg.image_url) {
          const pendingImgFallbackIdx = this.messages.findIndex(
            m => m.pending === true && m.uploading === true && m.image
          );
          if (pendingImgFallbackIdx !== -1) {
            this.messages[pendingImgFallbackIdx] = buildMsg({ image: msg.image_url });
            this.shouldScrollDown = true;
            return;
          }
        }

      }

      this.messages.push(buildMsg());
      this.shouldScrollDown = true;

      const preview = msg.message ? msg.message : (msg.image_url ? '📷 Foto' : '');
      if (preview) this.saveLastMessageToStorage(preview, msg.image_url ? 'image' : 'text');

    });

  }


  sendMessage() {

    const text = this.newMessage.trim();
    if (!text) return;
    if (this.isSending) return;

    this.isSending = true;

    const token = localStorage.getItem('token');
    const now   = new Date().toISOString();

    const optimisticMsg = {
      id:        null,
      uploadId:  null,
      text,
      sender:    'user',
      time:      this.formatTime(now),
      time_raw:  now,                   
      image:     null,
      pending:   true,
      uploading: false
    };

    this.messages.push(optimisticMsg);
    this.newMessage       = '';
    this.shouldScrollDown = true;

    this.http.post(
      `${environment.apiUrl}/chat-rooms/${this.roomId}/messages`,
      { message: text },
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({

      next: (res: any) => {
        const savedMsg = res?.data;
        if (savedMsg?.id) {
          const idx = this.messages.findIndex(
            m => m.pending === true && m.text === text && !m.image
          );
          if (idx !== -1) {
            this.messages[idx].id      = savedMsg.id;
            this.messages[idx].pending = false;
          }
        }
        this.saveLastMessageToStorage(text, 'text');
        this.isSending       = false;
      },

      error: () => {
        const idx = this.messages.findIndex(
          m => m.pending === true && m.text === text && !m.image
        );
        if (idx !== -1) this.messages.splice(idx, 1);
        this.isSending = false;
      }

    });

  }


  private sendImage(file: File) {

    const token = localStorage.getItem('token');

    const reader = new FileReader();
    reader.onload = (ev: any) => {

      const localPreview = ev.target.result as string;
      const uploadId     = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const now          = new Date().toISOString();

      const optimisticImg = {
        id:        null,
        uploadId,
        text:      null,
        sender:    'user',
        time:      this.formatTime(now),
        time_raw:  now,              
        image:     localPreview,
        pending:   true,
        uploading: true
      };

      this.messages.push(optimisticImg);
      this.shouldScrollDown = true;

      const formData = new FormData();
      formData.append('image', file, file.name);
      formData.append('upload_id', uploadId);

      this.http.post(
        `${environment.apiUrl}/chat-rooms/${this.roomId}/messages`,
        formData,
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`
          })
        }
      ).subscribe({

        next: (res: any) => {
          const savedMsg = res?.data;
          const idx = this.messages.findIndex(m => m.uploadId === uploadId);
          if (idx !== -1) {
            this.messages[idx] = {
              id:        savedMsg?.id || null,
              uploadId:  null,
              text:      null,
              sender:    'user',
              time:      this.messages[idx].time,
              time_raw:  this.messages[idx].time_raw,
              image:     savedMsg?.image_url || localPreview,
              pending:   false,
              uploading: false
            };
          }
        },

        error: () => {
          const idx = this.messages.findIndex(m => m.uploadId === uploadId);
          if (idx !== -1) this.messages.splice(idx, 1);
        }

      });

    };

    reader.readAsDataURL(file);

  }


  async pickImage() {
    const input         = document.createElement('input');
    input.type          = 'file';
    input.accept        = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) this.ngZone.run(() => this.sendImage(file));
      document.body.removeChild(input);
    };

    input.click();
  }


  async openCamera() {
    const input         = document.createElement('input');
    input.type          = 'file';
    input.accept        = 'image/*';
    input.setAttribute('capture', 'environment');
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) this.ngZone.run(() => this.sendImage(file));
      document.body.removeChild(input);
    };

    input.click();
  }


  sendQuickMessage(text: string) {
    this.newMessage = text;
    this.sendMessage();
  }



  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  get groupedMessages() {
    const groups: { dayLabel: string; timeRaw: string; messages: any[] }[] = [];
    let currentGroup: { dayLabel: string; timeRaw: string; messages: any[] } | null = null;

    this.messages.forEach((msg, index) => {
      const dayLabel = this.formatDayLabel(msg.time_raw);
      if (!currentGroup || currentGroup.dayLabel !== dayLabel) {
        currentGroup = {
          dayLabel,
          timeRaw: msg.time_raw,
          messages: []
        };
        groups.push(currentGroup);
      }
      currentGroup.messages.push({ ...msg, originalIndex: index });
    });

    return groups;
  }

  formatTime(datetime: string): string {
    if (!datetime) return '';
    const date = new Date(datetime);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }


  formatDayLabel(datetime: string): string {
    if (!datetime) return '';
    const date = new Date(datetime);
    const now  = new Date();

    const sameDay = (a: Date, b: Date) =>
      a.getDate()     === b.getDate()     &&
      a.getMonth()    === b.getMonth()    &&
      a.getFullYear() === b.getFullYear();

    if (sameDay(date, now)) return 'Hari ini';

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (sameDay(date, yesterday)) return 'Kemarin';

    return date.toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }

  isDifferentDay(index: number): boolean {
    if (index === 0) return true; 

    const prev = this.messages[index - 1];
    const curr = this.messages[index];

    if (!prev?.time_raw || !curr?.time_raw) return false;

    const prevDate = new Date(prev.time_raw);
    const currDate = new Date(curr.time_raw);

    return prevDate.toDateString() !== currDate.toDateString();
  }


  scrollToBottom() {
    try {
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {}
  }


  saveLastMessageToStorage(text: string, type: 'text' | 'image') {
    const preview = type === 'image' ? '📷 Foto' : text;
    localStorage.setItem(
      `last_msg_${this.roomId}`,
      JSON.stringify({ text: preview, time: new Date().toISOString() })
    );
  }

  onScroll(event: any) {
    this.isScrolling = true;
    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 1200); // 1.2 detik setelah berhenti scroll, tanggal memudar/menghilang
  }

  goBack() {
    this.location.back();
  }

}