import { Component } from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-privacy-settings',
  templateUrl: './privacy-settings.page.html',
  styleUrls: ['./privacy-settings.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
  ]
})

export class PrivacySettingsPage {

  get hideContact(): boolean {
    return localStorage.getItem('privacy_hide_contact') === 'true';
  }

  set hideContact(val: boolean) {
    localStorage.setItem('privacy_hide_contact', String(val));
  }

  get locationNotification(): boolean {
    return localStorage.getItem('privacy_location_notification') === 'true';
  }

  set locationNotification(val: boolean) {
    localStorage.setItem('privacy_location_notification', String(val));
  }

  constructor(
    private location: Location
  ) {

    addIcons({

      'arrow-back-outline':
        arrowBackOutline

    });

  }

  goBack() {

    this.location.back();

  }

}