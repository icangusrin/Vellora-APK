import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-add-cart-modal',
  templateUrl: './add-cart-modal.component.html',
  styleUrls: ['./add-cart-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class AddCartModalComponent implements OnInit, OnChanges {
  @Input() product: any;
  @Input() variants: string[] = [];
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<string>();

  selectedVariant: string = '';

  constructor(private toastController: ToastController) {
    addIcons({
      closeOutline
    });
  }

  ngOnInit() {
    this.initializeVariant();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen'] && this.isOpen) {
      this.initializeVariant();
    }
  }

  private initializeVariant() {
    if (this.variants.length > 0 && !this.selectedVariant) {
      this.selectedVariant = this.variants[0];
    } else if (this.variants.length > 0) {
      if (!this.variants.includes(this.selectedVariant)) {
        this.selectedVariant = this.variants[0];
      }
    }
  }

  selectVariant(variant: string) {
    this.selectedVariant = variant;
  }

  onAddToCart() {
    this.addToCart.emit(this.selectedVariant);
    this.close.emit();
    this.showSuccessToast();
  }

  onClose() {
    this.close.emit();
  }

  private async showSuccessToast() {
    const toast = await this.toastController.create({
      message: 'Produk berhasil ditambahkan ke keranjang 🛒',
      duration: 1800,
      position: 'middle',
      cssClass: 'success-toast'
    });
    await toast.present();
  }
}
