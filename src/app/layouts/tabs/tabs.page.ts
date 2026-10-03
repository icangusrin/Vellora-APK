import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { addIcons } from 'ionicons';

import {
  home,
  notificationsOutline,
  chatbubbleOutline,
  personOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    RouterModule,
  ],
})

export class TabsPage {

  constructor() {
    addIcons({
      'home': home,
      'notifications-outline': notificationsOutline,
      'chatbubble-outline': chatbubbleOutline,
      'person-outline': personOutline,
    });
  }

}