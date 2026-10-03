import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  chevronForwardOutline,
  chevronDownOutline,
  ticketOutline,
  closeOutline,
  lockClosedOutline,
  personOutline
} from 'ionicons/icons';

import { CartService }  from '../../core/services/cart.service';
import { AuthService }  from '../../core/services/auth.service';
import { CartItem }     from '../../models/cart.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class CartPage {
  private location    = inject(Location);
  private router      = inject(Router);
  readonly cartService  = inject(CartService);
  private authService = inject(AuthService);

  readonly cartItems      = this.cartService.cartItems;
  readonly selectedVoucher = this.cartService.selectedVoucher;

  // Popup login
  showLoginPopup = false;

  // Pesan popup — berbeda antara voucher vs checkout
  loginPopupContext: 'checkout' | 'voucher' = 'checkout';

  // Toast notifikasi
  toastVisible  = false;
  toastMessage  = '';
  private toastTimer: any;

  constructor() {
    addIcons({
      arrowBackOutline,
      chevronForwardOutline,
      chevronDownOutline,
      ticketOutline,
      closeOutline,
      lockClosedOutline,
      personOutline
    });
  }

  ionViewWillEnter() {
    this.cartService.loadFromStorage();
  }

  get groupedCart() {
    const items = this.cartItems();
    const groupsMap: Record<string, { shop: any, storeChecked: boolean, items: CartItem[] }> = {};

    items.forEach(item => {
      const shopName = item.shop?.name || 'Toko';
      if (!groupsMap[shopName]) {
        groupsMap[shopName] = {
          shop: item.shop,
          storeChecked: false,
          items: []
        };
      }
      groupsMap[shopName].items.push(item);
    });

    const groups = Object.values(groupsMap);
    groups.forEach(g => {
      g.storeChecked = g.items.every(item => item.checked);
    });

    return groups;
  }

  get selectAll(): boolean {
    const items = this.cartItems();
    if (items.length === 0) return false;
    return items.every(item => item.checked);
  }

  goBack() {
    this.location.back();
  }

  // ===========================
  // VOUCHER — CEK LOGIN DULU
  // ===========================
  goToVoucher() {
    if (!this.authService.isLoggedIn()) {
      this.loginPopupContext = 'voucher';
      this.showLoginPopup = true;
      return;
    }
    this.router.navigate(['/voucher']);
  }

  // ===========================
  // CHECKOUT — CEK LOGIN DULU
  // ===========================
  goToCheckout() {
    // Cek apakah ada item yang dipilih
    const selectedCount = this.cartService.selectedCount();
    if (selectedCount === 0) {
      this.showToast('Pilih produk yang ingin di-checkout dulu');
      return;
    }

    // Cek login
    if (!this.authService.isLoggedIn()) {
      this.loginPopupContext = 'checkout';
      this.showLoginPopup = true;
      return;
    }

    const success = this.cartService.proceedToCheckout();
    if (success) {
      this.router.navigate(['/checkout']);
    }
  }

  // Tutup popup login
  closeLoginPopup() {
    this.showLoginPopup = false;
  }

  // Tombol "Login Sekarang" di popup
  goToLogin() {
    this.showLoginPopup = false;
    const redirectTo = this.loginPopupContext === 'voucher' ? '/voucher' : '/checkout';
    this.router.navigate(['/auth/login'], {
      queryParams: { redirectTo }
    });
  }

  // ===========================
  // TOAST
  // ===========================
  showToast(msg: string) {
    this.toastMessage = msg;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastVisible = false;
    }, 2500);
  }

  removeVoucher(event: Event) {
    event.stopPropagation();
    this.cartService.removeVoucher();
  }

  toggleItemChecked(itemId: string) {
    this.cartService.toggleItemChecked(itemId);
  }

  toggleStore(shopName: string, checked: boolean) {
    this.cartService.toggleStoreChecked(shopName, checked);
  }

  toggleSelectAll(checked: boolean) {
    this.cartService.toggleSelectAll(checked);
  }

  increaseQty(itemId: string) {
    this.cartService.increaseQty(itemId);
  }

  decreaseQty(itemId: string) {
    this.cartService.decreaseQty(itemId);
  }

  removeGroupedItem(itemId: string) {
    this.cartService.removeItem(itemId);
  }

  changeVariant(itemId: string, event: any) {
    const value = event.target.value;
    this.cartService.changeVariant(itemId, value);
  }

  getVariants(item: CartItem): string[] {
    return item.variants || ['Default'];
  }

  formatPrice(price: string | number): string {
    if (typeof price === 'number') {
      return this.cartService.formatRupiah(price);
    }
    return price;
  }
}