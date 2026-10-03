import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import {
  HttpClient, HttpHeaders, HttpClientModule
} from '@angular/common/http';
import { addIcons } from 'ionicons';
import {
  cartOutline, trashOutline, notificationsOutline,
  bagHandleOutline, timeOutline, checkmarkCircleOutline,
  cubeOutline, carOutline, starOutline, closeCircleOutline,
  checkmarkDoneOutline, chevronForwardOutline
} from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-notifikasi',
  templateUrl: './notifikasi.page.html',
  styleUrls: ['./notifikasi.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, HttpClientModule],
})
export class NotifikasiPage implements OnInit {

  notifications: any[] = [];
  isLoading = false;
  showPopup = false;

  get unreadCount(): number {
    return this.notifications.filter(n => !n.is_read).length;
  }

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    addIcons({
      cartOutline, trashOutline, notificationsOutline,
      bagHandleOutline, timeOutline, checkmarkCircleOutline,
      cubeOutline, carOutline, starOutline, closeCircleOutline,
      checkmarkDoneOutline, chevronForwardOutline
    });
  }

  ngOnInit() {}

  ionViewWillEnter() { this.loadNotifications(); }

  loadNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return;
    this.isLoading = true;

    this.http.get(
      `${environment.apiUrl}/notifications`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: (res: any) => {
        const raw = res.data || [];
        this.notifications = raw.map((notif: any) => {
          let parsedData = notif.data;
          if (typeof parsedData === 'string') {
            try {
              parsedData = JSON.parse(parsedData);
            } catch (e) {
              console.error('Gagal mengurai data notifikasi:', e);
            }
          }
          return { ...notif, data: parsedData };
        });
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });
  }

  openNotification(notif: any) {
    if (!notif.is_read) this.markRead(notif);
    
    let data = notif.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) {
        console.error('Gagal mengurai data notifikasi:', e);
      }
    }
    
    const orderId = data?.order_id;
    if (orderId) {
      this.router.navigate(['/rincian-pesanan', orderId]);
    }
  }

  markRead(notif: any) {
    const token = localStorage.getItem('token');
    if (!token) return;
    notif.is_read = true;
    this.http.put(
      `${environment.apiUrl}/notifications/${notif.id}/read`,
      {},
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({ error: () => { notif.is_read = false; } });
  }

  markAllRead() {
    const token = localStorage.getItem('token');
    if (!token) return;
    this.notifications.forEach(n => n.is_read = true);
    this.http.put(
      `${environment.apiUrl}/notifications/read-all`,
      {},
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe();
  }

  deleteAllNotifications() {
    const token = localStorage.getItem('token');
    if (!token) { this.notifications = []; this.showPopup = false; return; }
    this.http.delete(
      `${environment.apiUrl}/notifications`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: () => { this.notifications = []; this.showPopup = false; },
      error: () => { this.showPopup = false; }
    });
  }

  goToCart() { this.router.navigate(['/cart']); }

  get skeletonItems() { return Array(5).fill(0); }
}
