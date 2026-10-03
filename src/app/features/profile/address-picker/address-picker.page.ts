import { Component } from '@angular/core';

import { environment } from 'src/environments/environment';

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

import {
  arrowBackOutline,
  searchOutline,
  locationOutline,
  ellipseOutline,
  chevronForwardOutline,
  checkmarkOutline,
  personOutline,
  homeOutline,
  closeOutline
} from 'ionicons/icons';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-address-picker',
  templateUrl: './address-picker.page.html',
  styleUrls: ['./address-picker.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PopupComponent
  ]
})

export class AddressPickerPage {

  currentStep = 'province';

  searchText = '';

  selectedProvince = '';

  selectedCity = '';

  selectedDistrict = '';

  selectedPostal = '';

  recipientName = '';

  phoneNumber = '';

  detailAddress = '';

  apiUrl = environment.apiUrl;

  provinceId = '';

  cityId = '';

  displayedList: string[] = [];

  provinces: any[] = [];

  cities: any[] = [];

  districts: any[] = [];

  isSaving = false;

  showErrorPopup = false;

  errorMessage = '';

  constructor(
    private location: Location,
    private http: HttpClient,
    private router: Router
  ) {

    addIcons({
      'arrow-back-outline': arrowBackOutline,
      'search-outline': searchOutline,
      'location-outline': locationOutline,
      'ellipse-outline': ellipseOutline,
      'chevron-forward-outline': chevronForwardOutline,
      'checkmark-outline': checkmarkOutline,
      'person-outline': personOutline,
      'home-outline': homeOutline,
      'close-outline': closeOutline
    });

    this.loadProvinces();

  }

  get searchPlaceholder(): string {
    if (this.currentStep === 'province') return 'Cari Provinsi';
    if (this.currentStep === 'city') return 'Cari Kota / Kabupaten';
    return 'Cari Kecamatan';
  }

  loadProvinces() {

    this.http.get<any[]>(
      `${this.apiUrl}/regions/provinces`
    ).subscribe({

      next: (res) => {

        this.provinces = res;

        this.displayedList =
          res.map(item => item.name);

      },

      error: (err) => {
        console.log('PROVINCE ERROR:', err);
      }

    });

  }


  goBack() {

    this.location.back();

  }


  onSearchChange() {

    const keyword =
      this.searchText.toLowerCase();

    let currentList: string[] = [];

    if (this.currentStep === 'province') {
      currentList = this.provinces.map(item => item.name);
    } else if (this.currentStep === 'city') {
      currentList = this.cities.map(item => item.name);
    } else if (this.currentStep === 'district') {
      currentList = this.districts.map(item => item.name);
    }

    this.displayedList =
      currentList.filter(item =>
        item.toLowerCase().includes(keyword)
      );

  }


  resetPicker() {

    this.selectedProvince = '';
    this.selectedCity = '';
    this.selectedDistrict = '';
    this.selectedPostal = '';
    this.currentStep = 'province';

    this.displayedList =
      this.provinces.map(item => item.name);

  }


  selectItem(item: string) {

    this.searchText = '';

    if (this.currentStep === 'province') {

      this.selectedProvince = item;

      const province =
        this.provinces.find(p => p.name === item);

      this.provinceId = province.id;

      this.http.get<any[]>(
        `${this.apiUrl}/regions/regencies/${this.provinceId}`
      ).subscribe({

        next: (res) => {

          this.cities = res;
          this.currentStep = 'city';
          this.displayedList = res.map(city => city.name);

        },

        error: (err) => {
          console.log('CITY ERROR:', err);
        }

      });

      return;

    }

    if (this.currentStep === 'city') {

      this.selectedCity = item;

      const city =
        this.cities.find(c => c.name === item);

      this.cityId = city.id;

      this.http.get<any[]>(
        `${this.apiUrl}/regions/districts/${this.cityId}`
      ).subscribe({

        next: (res) => {

          this.districts = res;
          this.currentStep = 'district';
          this.displayedList = res.map(district => district.name);

        },

        error: (err) => {
          console.log('DISTRICT ERROR:', err);
        }

      });

      return;

    }

    if (this.currentStep === 'district') {

      this.selectedDistrict = item;
      this.currentStep = 'postal';

      return;

    }

  }


  saveAddress() {

    if (
      !this.recipientName ||
      !this.phoneNumber ||
      !this.selectedProvince ||
      !this.selectedCity ||
      !this.selectedDistrict ||
      !this.detailAddress ||
      !this.selectedPostal
    ) {

      this.errorMessage =
        'Semua data wajib diisi';

      this.showErrorPopup = true;

      return;

    }

    if (this.isSaving) return;

    this.isSaving = true;

    const token = localStorage.getItem('token');

    if (!token) {

      this.errorMessage =
        'Silakan login terlebih dahulu';

      this.showErrorPopup = true;

      this.isSaving = false;

      return;

    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const body = {

      recipient_name: this.recipientName,

      phone_number: this.phoneNumber,

      full_address:
        `${this.selectedProvince}, ${this.selectedCity}, ${this.selectedDistrict}`,

      detail_address: this.detailAddress,

      postal_code: this.selectedPostal,

      is_default: false

    };

    this.http.post(
      `${this.apiUrl}/addresses`,
      body,
      { headers }
    ).subscribe({

      next: () => {

        this.isSaving = false;

        this.location.back();

      },

      error: (err) => {

        console.log('SAVE ADDRESS ERROR:', err);

        this.errorMessage =
          'Gagal menyimpan alamat. Coba lagi.';

        this.showErrorPopup = true;

        this.isSaving = false;

      }

    });

  }


  closePopup() {

    this.showErrorPopup = false;

  }

}