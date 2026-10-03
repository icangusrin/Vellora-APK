import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { CommonModule, Location } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { addIcons } from 'ionicons';
import { arrowBackOutline, personOutline, chevronForwardOutline } from 'ionicons/icons';

import { PopupComponent } from '../../../shared/components/popup/popup.component';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule, HttpClientModule, PopupComponent]
})

export class EditProfilePage {

  userData = {
    name: '',
    gender: localStorage.getItem('userGender') || 'Perempuan',
    birthDate: localStorage.getItem('userBirthDate') || '',
    phone: '',  
    email: ''
  };

  profileImage: string | ArrayBuffer | null = localStorage.getItem('profileImage');

  
  isSaving = false;
  saveSuccess = false;
  saveError = '';
  showPopup = false;
  popupTitle = '';
  popupMsg = '';
  popupIcon = '';
  popupType: 'notice' | 'confirm' = 'notice';

  constructor(
    private location: Location,
    private router: Router,
    private http: HttpClient
  ) {
    addIcons({ 'arrow-back-outline': arrowBackOutline, 'person-outline': personOutline, 'chevron-forward-outline': chevronForwardOutline });
  }

  ionViewWillEnter() {
    this.saveSuccess = false;
    this.saveError = '';
    this.showPopup = false;

    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      this.userData.gender = profile.gender || 'Perempuan';
      this.userData.birthDate = profile.birthDate || '';
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    this.http.get(
      `${environment.apiUrl}/auth/profile`,
      { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) }
    ).subscribe({
      next: (res: any) => {
        const user = res.data;
        this.userData.name  = user.name || '';
        this.userData.phone = user.phone_number || '';
        this.userData.email = user.email || '';
      },
      error: (err) => console.log('PROFILE ERROR:', err)
    });
  }

  closePopup() {
    this.showPopup = false;
    if (this.saveSuccess) {
      this.router.navigate(['/tabs/profile']);
    }
  }

  goToChangePhone() {
    this.router.navigate(['/change-phone']);
  }

  onSelectImage(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.profileImage = reader.result;
      localStorage.setItem('profileImage', String(reader.result));
    };
    reader.readAsDataURL(file);
  }

  saveProfile() {

    const token = localStorage.getItem('token');
    if (!token) return;

    if (this.isSaving) return;  
    this.isSaving = true;
    this.saveSuccess = false;
    this.saveError = '';

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });


    this.http.put(
      `${environment.apiUrl}/auth/update-profile`,
      { name: this.userData.name, email: this.userData.email },
      { headers }
    ).subscribe({
      next: () => {
        this.onSaveSuccess();
      },
      error: (err) => {
        this.isSaving = false;
        this.saveError = err?.error?.message || 'Gagal update profil';
        this.popupTitle = 'Gagal';
        this.popupMsg = this.saveError;
        this.popupIcon = 'cloud-offline-outline';
        this.popupType = 'notice';
        this.showPopup = true;
      }
    });

  }

  private onSaveSuccess() {
    this.isSaving = false;
    this.saveSuccess = true;

    localStorage.setItem('userGender', this.userData.gender);
    localStorage.setItem('userBirthDate', this.userData.birthDate);
    localStorage.setItem('userName', this.userData.name);
    localStorage.setItem('userEmail', this.userData.email);
    localStorage.setItem('userProfile', JSON.stringify({
      name: this.userData.name,
      gender: this.userData.gender,
      birthDate: this.userData.birthDate,
      phone: this.userData.phone,
      email: this.userData.email,
      image: this.profileImage
    }));

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.name  = this.userData.name;
        user.email = this.userData.email;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch (e) {
      console.log('Sync user localStorage error:', e);
    }

    this.popupTitle = 'Sukses';
    this.popupMsg = 'Profil berhasil diperbarui';
    this.popupIcon = 'checkmark-circle-outline';
    this.popupType = 'confirm';
    this.showPopup = true;
  }

  goBack() { this.location.back(); }

}