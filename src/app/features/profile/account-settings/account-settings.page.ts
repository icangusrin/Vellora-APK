import { Component } from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  IonicModule
} from '@ionic/angular';

import {
  Router
} from '@angular/router';

import { AuthService } from 'src/app/core/services/auth.service';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  chevronForwardOutline
} from 'ionicons/icons';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.page.html',
  styleUrls: ['./account-settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    PopupComponent
  ]
})

export class AccountSettingsPage {

  showLogoutPopup = false;

  constructor(
    private location: Location,
    private router: Router,
    private authService: AuthService
  ) {

    addIcons({

      'arrow-back-outline':
        arrowBackOutline,

      'chevron-forward-outline':
        chevronForwardOutline

    });

  }

  goBack() {

    this.router.navigate([
      '/tabs/profile'
    ]);

  }

  goToSecurity() {

    this.router.navigate([
      '/security-account'
    ]);

  }

  goToAddress() {

    this.router.navigate([
      '/my-address'
    ]);

  }

  goToPrivacySettings() {

    this.router.navigate([
      '/privacy-settings'
    ]);

  }

  goToLaporkan() {

    this.router.navigate([
      '/laporkan'
    ]);

  }


  // GO TO SWITCH ACCOUNT
  // goToSwitchAccount() {

  //   this.router.navigate([
  //     '/ganti-akun'
  //   ]);

  // }

  closeLogoutPopup() {

    this.showLogoutPopup = false;

  }

  logout() {

    this.authService.logout();

    this.showLogoutPopup = false;

    this.router.navigate([
      '/auth/login'
    ]);

  }

}