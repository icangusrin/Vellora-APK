import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonIcon } from '@ionic/angular/standalone';
import { RouterModule, Router } from '@angular/router';
import { addIcons } from 'ionicons';

import {
  chevronBackOutline,
  people,
  barChart,
  shieldCheckmark,
  chatbubbles
} from 'ionicons/icons';



@Component({
  selector: 'app-join-seller',
  templateUrl: './join-seller.page.html',
  styleUrls: ['./join-seller.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, FormsModule, RouterModule]
})
export class JoinSellerPage implements OnInit {

  constructor(
     private router: Router
  ) {
    addIcons({

      'chevron-back-outline': chevronBackOutline,
      'people': people,
      'bar-chart': barChart,
      'shield-checkmark': shieldCheckmark,
      'chatbubbles': chatbubbles

    });
   }

  ngOnInit() {
  }

  goBack() {

    this.router.navigate([
      '/tabs/profile'
    ]);

}
goNext() {

  this.router.navigate([
    '/seller-store'
  ]);

}

}