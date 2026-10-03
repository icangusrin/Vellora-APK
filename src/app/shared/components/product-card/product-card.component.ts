import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { addIcons } from 'ionicons';
import { bagAddOutline } from 'ionicons/icons';

import { Product } from '../../../models/product.model';
import { RupiahPipe } from '../../pipes/rupiah.pipe';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RupiahPipe
  ]
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() cardClick = new EventEmitter<Product>();
  @Output() cartClick = new EventEmitter<{ product: Product; event: Event }>();

  constructor() {
    addIcons({
      bagAddOutline
    });
  }

  onCardClick() {
    this.cardClick.emit(this.product);
  }

onCartClick(event: Event) {

  event.stopPropagation();

  this.cartClick.emit({
    product: this.product,
    event
  });

}

  get ratingStars(): string {
    const rating = this.product.rating;
    if (rating === undefined) return '';
    if (typeof rating === 'number') {
      const fullStars = Math.floor(rating);
      const halfStar = rating % 1 >= 0.5 ? '☆' : '';
      return '⭐'.repeat(fullStars) + halfStar;
    }
    return rating;
  }
}
