import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PopupComponent {
  @Input() show: boolean = false;
  @Input() type: 'notice' | 'danger' | 'confirm' = 'notice';
  @Input() title: string = '';
  @Input() message?: string;
  @Input() icon?: string;
  @Input() confirmText: string = 'OK';
  @Input() cancelText?: string;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  onOverlayClick() {
    this.cancelled.emit();
  }
}
