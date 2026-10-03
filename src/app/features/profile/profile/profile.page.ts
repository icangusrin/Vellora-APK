import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router,
} from '@angular/router';

import {
  IonicModule,
  AlertController,
} from '@ionic/angular';

import { addIcons } from 'ionicons';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';

import {
  personOutline,
  settingsOutline,
  shieldOutline,
  locationOutline,
  callOutline,
  mailOutline,
  storefrontOutline,
  bagHandleOutline,
  chevronForwardOutline,
  logOutOutline,
  createOutline,
  flagOutline,
  swapHorizontalOutline,
  cartOutline,
  cubeOutline,
  starOutline,
  cardOutline,
  carOutline,
  checkmarkDoneOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    HttpClientModule

  ]
})

export class ProfilePage implements OnInit {



  userData = {
    name: '',
    email: '',
    phone: '',
    photo: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
  };



  get isSeller(): boolean {
    return this.userRole === 'seller';
  }

  // INTERNAL — role user
  userRole = '';

  isLoggedIn = false  ;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private http: HttpClient
  ) {

    addIcons({
      personOutline,
      settingsOutline,
      shieldOutline,
      locationOutline,
      callOutline,
      mailOutline,
      storefrontOutline,
      bagHandleOutline,
      chevronForwardOutline,
      logOutOutline,
      createOutline,
      flagOutline,
      swapHorizontalOutline,
      cartOutline,
      starOutline,
      cubeOutline,
      cardOutline,
      carOutline,
      checkmarkDoneOutline
    });

  }

  ngOnInit() {

    this.loadProfile();

  }

  ionViewWillEnter() {

    this.loadProfile();
    this.refreshFromApi();

  }



  loadProfile() {

    const token = localStorage.getItem('token');

    this.isLoggedIn = !!token;

    if (!token) {

      this.userData = {
        name: '',
        email: '',
        phone: '',
        photo: 'https://cdn-icons-png.flaticon.com/512/149/149071.png'
      };

      this.userRole = '';

      return;

    }

    const userStr = localStorage.getItem('user');

    if (!userStr) return;

    try {

      const user = JSON.parse(userStr);

      this.userRole = user.role || '';
      const localPhoto = localStorage.getItem('profileImage');

      const imgPath = user.image || user.profile_photo_path;

      let photo: string;
      if (localPhoto) {
        photo = localPhoto;
      } else if (imgPath) {
        const baseUrl = imgPath.startsWith('http')
          ? imgPath
          : `${environment.baseUrl}/` + imgPath;
        photo = `${baseUrl}?t=${Date.now()}`;
      } else {
        photo = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
      }

      this.userData = {
        name: user.name || 'User',
        email: user.email || '',
        phone: user.phone || user.phone_number || '',
        photo
      };

    } catch (e) {

      console.log('PARSE USER ERROR:', e);

    }

  }

  refreshFromApi() {

    const token = localStorage.getItem('token');

    if (!token) return;

    this.http.get(`${environment.apiUrl}/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).subscribe({

      next: (res: any) => {

        const user = res.data;

        localStorage.setItem('user', JSON.stringify(user));

        this.userRole = user.role || '';

        const imgPath = user.image || user.profile_photo_path;

        const localPhoto = localStorage.getItem('profileImage');

        let resolvedPhoto: string;
        if (localPhoto) {
          resolvedPhoto = localPhoto;
        } else if (imgPath) {
          const baseUrl = imgPath.startsWith('http')
            ? imgPath
            : `${environment.baseUrl}/` + imgPath;
          resolvedPhoto = `${baseUrl}?t=${Date.now()}`;
        } else {
          resolvedPhoto = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
        }

        this.userData = {
          name:  user.name  || 'User',
          email: user.email || '',
          phone: user.phone || user.phone_number || '',
          photo: resolvedPhoto
        };

      },

      error: (err) => {
        console.log('Refresh profile error:', err);
      }

    });

  }


  goToEditProfile() {
    this.router.navigate(['/edit-profile']);
  }

  goToCart() {
    this.router.navigate(['/cart']);
  }

  goToPesanan(status?: string) {

    this.router.navigate(['/pesanan'], {
      queryParams: { status: status || 'semua' }
    });

  }

  goToUlasan() {
    this.router.navigate(['/ulasan']);
  }

  goToOrders() {
    this.router.navigate(['/orders']);
  }

  goToAddress() {
    this.router.navigate(['/my-address']);
  }

  goToSettings() {
    this.router.navigate(['/account-settings']);
  }

  goToSecurity() {
    this.router.navigate(['/security-account']);
  }

  goToDashboard() {
    location.href = 'https://layananapp.my.id/';
  }

  goToShop() {
    this.router.navigate(['/shop-profile']);
  }

  goToJoinSeller() {
    this.router.navigate(['/join-seller']);
  }

  goToLaporkan() {
    this.router.navigate(['/laporkan']);
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }

  goToRegister() {

    this.router.navigate([
      '/register'
    ]);

  }


  async confirmLogout() {

    const alert = await this.alertController.create({

      header: 'Konfirmasi',

      message: 'Apakah kamu yakin ingin keluar?',

      buttons: [

        {
          text: 'Batal',
          role: 'cancel'
        },

        {
          text: 'Keluar',
          role: 'confirm',
          cssClass: 'danger',
          handler: () => {
            this.logout();
          }
        }

      ]

    });

    await alert.present();

  }


  logout() {

    [
      'token', 'user', 'userProfile', 'userName',
      'userEmail', 'userPhone', 'profileImage',
      'savedAddress', 'selectedProvince', 'selectedCity',
      'selectedDistrict', 'selectedPostalCode',
      'cart', 'selectedVoucher', 'checkoutItems',
      'checkoutTotal', 'chats'
    ].forEach(key => localStorage.removeItem(key));

    this.isLoggedIn = false;

    this.router.navigateByUrl(
      '/auth/login',
      { replaceUrl: true }
    );

  }

}
