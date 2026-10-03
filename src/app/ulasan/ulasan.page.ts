import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent, IonIcon,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  storefront, star, arrowBackOutline, person,
  checkmarkCircleOutline, timeOutline
} from 'ionicons/icons';

import { ReviewService } from '../core/services/review.service';

@Component({
  selector: 'app-ulasan',
  templateUrl: './ulasan.page.html',
  styleUrls: ['./ulasan.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule],
})
export class UlasanPage implements OnInit {

  activeTab = 'belum';

  pendingItems: any[] = [];
  myReviews   : any[] = [];

  ratings : { [orderItemId: number]: number } = {};
  comments: { [orderItemId: number]: string  } = {};
  submitting: { [orderItemId: number]: boolean } = {};

  isLoadingPending  = false;
  isLoadingMyReview = false;

  showWarningPopup = false;

  stars = [1, 2, 3, 4, 5];
  ratingLabel = ['', 'Jelek Sekali', 'Kurang Bagus', 'Cukup', 'Bagus', 'Sangat Bagus'];

  constructor(
    private router       : Router,
    private reviewService: ReviewService,
    private toastCtrl    : ToastController,
  ) {
    addIcons({ storefront, star, arrowBackOutline, person, checkmarkCircleOutline, timeOutline });
  }

  ngOnInit() {
    this.loadPending();
    this.loadMyReviews();
  }

  loadPending() {
    this.isLoadingPending = true;

    this.reviewService.getEligibleItems().subscribe({
      next: (res: any) => {
        this.pendingItems = res.data ?? [];
        for (const item of this.pendingItems) {
          this.ratings[item.order_item_id]    = 0;
          this.comments[item.order_item_id]   = '';
          this.submitting[item.order_item_id] = false;
        }
        this.isLoadingPending = false;
      },
      error: (err: any) => {
        this.isLoadingPending = false;
        const msg = err?.error?.message ?? 'Gagal memuat data ulasan';
        this.toast(msg, 'danger');
      },
    });
  }

  loadMyReviews() {
    this.isLoadingMyReview = true;

    this.reviewService.getMyReviews().subscribe({
      next: (res: any) => {
        this.myReviews = res.data ?? [];
        this.isLoadingMyReview = false;
      },
      error: () => { this.isLoadingMyReview = false; },
    });
  }

  setRating(orderItemId: number, value: number) {
    this.ratings[orderItemId] = value;
  }

  submitReview(item: any) {
    const id     = item.order_item_id;
    const rating = this.ratings[id];

    if (!rating) { this.showWarningPopup = true; return; }

    this.submitting[id] = true;

    this.reviewService.createReview({
      product_id    : item.product_id,
      order_id      : item.order_id,
      order_item_id : id,
      rating,
      review        : this.comments[id] || undefined,
    }).subscribe({
      next: () => {
        this.submitting[id] = false;
        this.toast('Ulasan berhasil dikirim ✅', 'success');
        this.pendingItems = this.pendingItems.filter(p => p.order_item_id !== id);
        this.loadMyReviews();
        if (this.pendingItems.length === 0) this.activeTab = 'penilaian';
      },
      error: (err: any) => {
        this.submitting[id] = false;
        this.toast(err?.error?.message ?? 'Gagal mengirim ulasan.', 'danger');
      },
    });
  }

  get totalReviews() { return this.myReviews.length; }

  formatPrice(v: any)  { return this.reviewService.formatPrice(v); }

  getLabel(id: number) { return this.ratingLabel[this.ratings[id]] ?? ''; }

  goBack() { this.router.navigate(['/tabs/profile']); }

  async toast(msg: string, color = 'dark') {
    const t = await this.toastCtrl.create({ message: msg, duration: 2500, position: 'bottom', color });
    t.present();
  }

}