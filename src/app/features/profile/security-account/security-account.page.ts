import { Component } from '@angular/core';
import { Router } from '@angular/router';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  HttpClient
} from '@angular/common/http';

import {
  IonicModule
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  chevronForwardOutline,
  personOutline,
  atOutline,
  callOutline,
  mailOutline,
  lockClosedOutline
} from 'ionicons/icons';

import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-security-account',
  templateUrl: './security-account.page.html',
  styleUrls: ['./security-account.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ]
})

export class SecurityAccountPage {

  userData = {

    name: '',

    phone: '',

    email: '',

    gender: '',

    birthDate: ''

  };

  profileImage:
    string | null = null;

  constructor(
    private location: Location,
    private router: Router,
    private http: HttpClient
  ) {

    addIcons({

      'arrow-back-outline':
        arrowBackOutline,

      'chevron-forward-outline':
        chevronForwardOutline,

      'person-outline':
        personOutline,

      'at-outline':
        atOutline,

      'call-outline':
        callOutline,

      'mail-outline':
        mailOutline,

      'lock-closed-outline':
        lockClosedOutline

    });

  }

  ionViewWillEnter() {

  const token =
    localStorage.getItem(
      'token'
    );

  if (!token) {

    this.router.navigate([
      '/login'
    ]);

    return;

  }

  this.http.get(
    `${environment.apiUrl}/auth/profile`,
    {
      headers: {

        Authorization:
          'Bearer ' + token

      }
    }
  )
  .subscribe({

    next: (res: any) => {

      console.log(
        'PROFILE:',
        res
      );

      const user =
        res.data;

      this.userData = {

        name:
          user.name ||
          'User',

        phone:
          user.phone_number || '',

        email:
          user.email ||
          'Belum ada email',

        gender:
          user.gender || '',

        birthDate:
          user.birth_date || ''

      };

      const localPhoto = localStorage.getItem('profileImage');
      if (localPhoto) {
        this.profileImage = localPhoto;
      } else {
        const apiPhoto = user.profile_photo_path || user.profile_photo || user.image;
        this.profileImage = apiPhoto
          ? (apiPhoto.startsWith('http') ? apiPhoto : `${environment.baseUrl}/` + apiPhoto)
          : null;
      }

    },

    error: (err) => {

      console.log(
        'PROFILE ERROR:',
        err
      );

      this.router.navigate([
        '/login'
      ]);

    }

  });

}


  goBack() {

    this.router.navigate([
      '/account-settings'
    ]);

  }

  goToEditProfile() {

    this.router.navigate([
      '/edit-profile'
    ]);

  }



  // GO TO CHANGE EMAIL
  // goToChangeEmail() {

  //   this.router.navigate([
  //     '/change-email'
  //   ]);

  // }

  // GO TO CHANGE PASSWORD
  goToChangePassword() {

    this.router.navigate([
      '/change-password'
    ]);

  }

}