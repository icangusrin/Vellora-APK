import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { environment } from 'src/environments/environment';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-change-phone',
  templateUrl: './change-phone.page.html',
  styleUrls: ['./change-phone.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule, PopupComponent]
})

export class ChangePhonePage {
  mode: 'add' | 'change' = 'add';

  currentPhone = '';

  oldPhone = '';
  newPhone = '';

  isSaving    = false;
  showPopup   = false;
  popupMsg    = '';
  popupOk     = false; 

  constructor(
    private location: Location,
    private router:   Router,
    private http:     HttpClient
  ) {
    addIcons({ 'arrow-back-outline': arrowBackOutline });
  }

  ionViewWillEnter() {

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      this.currentPhone = user.phone_number || '';
      this.mode = this.currentPhone ? 'change' : 'add';
    } catch {
      this.mode = 'add';
    }

    this.oldPhone = '';
    this.newPhone = '';

  }

  savePhone() {

    if (this.mode === 'change') {

      if (!this.oldPhone) {
        return this.showError('Nomor lama wajib diisi');
      }

      const normalize = (n: string) => n.replace(/\s/g, '').replace(/^0/, '');

      if (normalize(this.oldPhone) !== normalize(this.currentPhone)) {
        return this.showError('Nomor lama tidak sesuai');
      }

    }

    if (!this.newPhone) {
      return this.showError('Nomor HP baru wajib diisi');
    }

    if (this.newPhone.length < 9 || this.newPhone.length > 15) {
      return this.showError('Nomor HP tidak valid (9–15 digit)');
    }

    if (this.mode === 'change' && this.newPhone === this.currentPhone) {
      return this.showError('Nomor baru sama dengan nomor lama');
    }


    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.isSaving = true;

    this.http.put(
      `${environment.apiUrl}/auth/update-phone`,
      { phone_number: this.newPhone },
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({

      next: (res: any) => {

        this.isSaving = false;

        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          user.phone_number = this.newPhone;
          localStorage.setItem('user', JSON.stringify(user));
        } catch {}

        this.popupMsg = this.mode === 'add'
          ? 'Nomor HP berhasil ditambahkan ✅'
          : 'Nomor HP berhasil diubah ✅';
        this.popupOk   = true;
        this.showPopup = true;

      },

      error: (err) => {
        this.isSaving = false;
        this.showError(err?.error?.message || 'Gagal menyimpan nomor HP');
      }

    });

  }

  closePopup() {
    this.showPopup = false;
    if (this.popupOk) this.location.back();
  }

  goBack() { this.location.back(); }

  private showError(msg: string) {
    this.popupMsg  = msg;
    this.popupOk   = false;
    this.showPopup = true;
  }

}