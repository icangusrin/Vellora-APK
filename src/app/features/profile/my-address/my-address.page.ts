import { Component } from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  FormsModule
} from '@angular/forms';

import {
  IonicModule
} from '@ionic/angular';

import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import { Router } from '@angular/router';

import { addIcons } from 'ionicons';
import { environment } from 'src/environments/environment';

import {
  arrowBackOutline,
  addOutline,
  trashOutline,
  checkmarkCircle,
  ellipseOutline,
  locationOutline
} from 'ionicons/icons';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-my-address',
  templateUrl: './my-address.page.html',
  styleUrls: ['./my-address.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PopupComponent
  ]
})

export class MyAddressPage {

  apiUrl = environment.apiUrl;


  addresses: any[] = [];

  isLoading = false;

  isSelectionMode = false;

  showDeleteConfirm = false;

  deleteTargetId: number | null = null;

  showErrorPopup = false;

  errorMessage = '';

  constructor(
    private location: Location,
    private router: Router,
    private http: HttpClient
  ) {

    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'add-outline': addOutline,
      'trash-outline': trashOutline,
      'checkmark-circle': checkmarkCircle,
      'ellipse-outline': ellipseOutline,
      'location-outline': locationOutline
    });

  }


  ionViewWillEnter() {

    // Mode pilih alamat dari checkout:
    // checkout page set localStorage.setItem('addressMode', 'select')
    // lalu navigasi ke sini
    const mode = localStorage.getItem('addressMode');
    this.isSelectionMode = mode === 'select';

    this.loadAddresses();

  }

  loadAddresses() {

    const token = localStorage.getItem('token');

    if (!token) {
      console.log('TOKEN TIDAK ADA');
      return;
    }

    this.isLoading = true;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.get(
      `${this.apiUrl}/addresses`,
      { headers }
    ).subscribe({

      next: (res: any) => {
        const raw = res.data || [];
        
        let foundDefault = false;
        this.addresses = raw.map((a: any) => {
          const isDbDefault = a.is_default === true || a.is_default === 1 || String(a.is_default) === '1' || String(a.is_default) === 'true';
          if (isDbDefault && !foundDefault) {
            foundDefault = true;
            return { ...a, is_default: true };
          }
          return { ...a, is_default: false };
        });

        this.isLoading = false;
      },

      error: (err) => {

        console.log('LOAD ADDRESS ERROR:', err);
        this.isLoading = false;

      }

    });

  }


  goBack() {

    localStorage.removeItem('addressMode');
    this.location.back();

  }


  addNewAddress() {

    this.router.navigate(['/address-picker']);

  }



  selectAddress(address: any) {

    if (this.isSelectionMode) {

      localStorage.setItem(
        'checkoutAddress',
        JSON.stringify(address)
      );

      localStorage.removeItem('addressMode');

      this.location.back();

    } else {

      this.setDefaultAddress(address);

    }

  }


  setDefaultAddress(address: any) {

    if (address.is_default) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const body = {
      recipient_name: address.recipient_name,
      phone_number: address.phone_number,
      full_address: address.full_address,
      detail_address: address.detail_address,
      postal_code: address.postal_code,
      is_default: true
    };

    this.http.put(
      `${this.apiUrl}/addresses/${address.id}`,
      body,
      { headers }
    ).subscribe({

      next: () => {
        this.addresses = this.addresses.map(a => ({
          ...a,
          is_default: a.id === address.id
        }));
      },

      error: (err) => {
        console.log('SET DEFAULT ERROR:', err);
      }

    });

  }


  confirmDelete(id: number, event: Event) {

    event.stopPropagation();
    this.deleteTargetId = id;
    this.showDeleteConfirm = true;

  }


  deleteAddress() {

    if (!this.deleteTargetId) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http.delete(
      `${this.apiUrl}/addresses/${this.deleteTargetId}`,
      { headers }
    ).subscribe({

      next: () => {

        this.addresses = this.addresses.filter(
          a => a.id !== this.deleteTargetId
        );

        this.showDeleteConfirm = false;
        this.deleteTargetId = null;

      },

      error: (err) => {

        console.log('DELETE ERROR:', err);
        this.showDeleteConfirm = false;

      }

    });

  }

  cancelDelete() {

    this.showDeleteConfirm = false;
    this.deleteTargetId = null;

  }


  closePopup() {

    this.showErrorPopup = false;

  }

}