import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';
import { chevronBackOutline, checkmarkOutline, mailOutline, checkmarkCircle } from 'ionicons/icons';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-seller-success',
  templateUrl: './seller-success.page.html',
  styleUrls: ['./seller-success.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule, RouterModule]
})
export class SellerSuccessPage implements OnInit {

  showPopup = false;

  constructor(
    private router: Router,
    private authService: AuthService 
  ) {
    addIcons({
      'chevron-back-outline': chevronBackOutline,
      'checkmark-outline': checkmarkOutline,
      'mail-outline': mailOutline,
      'checkmark-circle': checkmarkCircle
    });
  }

  ngOnInit() {}

  goBack() { this.router.navigate(['/seller-store']); }

  finishRegister() {

    this.authService.refreshUser().subscribe({
      next: () => {
        this.showPopup = true;
        setTimeout(() => {
          this.router.navigate(['/tabs/profile']);
        }, 1800);
      },
      error: () => {
        try {
          const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (savedUser && savedUser.role !== 'seller') {
            savedUser.role = 'seller';
            this.authService.saveUser(savedUser); 
          }
        } catch (e) {}

        this.showPopup = true;
        setTimeout(() => {
          this.router.navigate(['/tabs/profile']);
        }, 1800);
      }
    });

  }

}