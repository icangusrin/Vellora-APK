import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ActionSheetController, ToastController } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  cameraOutline,
  warningOutline,
  chevronDownOutline,
  alertCircleOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-laporkan',
  templateUrl: './laporkan.page.html',
  styleUrls: ['./laporkan.page.scss'],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ]
})
export class LaporkanPage {


  selectedJenis = '';
  judulLaporan  = '';
  deskripsiLaporan = '';


  previewImages: string[] = [];
  selectedFiles: File[]   = [];


  isSubmitting = false;

  constructor(
    private location: Location,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {
    addIcons({
      'arrow-back-outline'       : arrowBackOutline,
      'camera-outline'           : cameraOutline,
      'warning-outline'          : warningOutline,
      'chevron-down-outline'     : chevronDownOutline,
      'alert-circle-outline'     : alertCircleOutline,
      'checkmark-circle-outline' : checkmarkCircleOutline
    });
  }

  goBack() {
    this.location.back();
  }


  async pilihJenisLaporan() {
    const actionSheet = await this.actionSheetCtrl.create({
      cssClass: 'custom-action-sheet',
      buttons: [
        { text: 'Produk Tidak Sesuai',                  handler: () => { this.selectedJenis = 'Produk Tidak Sesuai'; } },
        { text: 'Produk Palsu / Melanggar Hak Cipta',   handler: () => { this.selectedJenis = 'Produk Palsu / Melanggar Hak Cipta'; } },
        { text: 'Penipuan / Aktivitas Mencurigakan',    handler: () => { this.selectedJenis = 'Penipuan / Aktivitas Mencurigakan'; } },
        { text: 'Toko Bermasalah',                      handler: () => { this.selectedJenis = 'Toko Bermasalah'; } },
        { text: 'Konten Tidak Pantas',                  handler: () => { this.selectedJenis = 'Konten Tidak Pantas'; } },
        { text: 'Harga / Informasi Menyesatkan',        handler: () => { this.selectedJenis = 'Harga / Informasi Menyesatkan'; } },
        { text: 'Pelanggaran Kebijakan Vellora',        handler: () => { this.selectedJenis = 'Pelanggaran Kebijakan Vellora'; } },
        { text: 'Masalah Pesanan / Pengiriman',         handler: () => { this.selectedJenis = 'Masalah Pesanan / Pengiriman'; } },
        { text: 'Lainnya',                              handler: () => { this.selectedJenis = 'Lainnya'; } },
        { text: 'Batal', role: 'cancel' }
      ]
    });
    await actionSheet.present();
  }


  async kirimLaporan() {

    if (this.isSubmitting) return;

    // Validasi form
    if (!this.selectedJenis || !this.judulLaporan.trim() || !this.deskripsiLaporan.trim()) {
      await this.showToast('Lengkapi seluruh laporan terlebih dahulu!', 'alert-circle-outline', 'custom-warning-toast');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      await this.showToast('Kamu harus login terlebih dahulu.', 'alert-circle-outline', 'custom-warning-toast');
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('jenis_laporan', this.selectedJenis);
    formData.append('judul',         this.judulLaporan.trim());
    formData.append('deskripsi',     this.deskripsiLaporan.trim());

    this.selectedFiles.forEach((file) => {
      formData.append('foto[]', file);
    });

    try {
      const res  = await fetch(`${environment.apiUrl}/reports`, {
        method : 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body   : formData
      });

      const data = await res.json();
      this.isSubmitting = false;

      if (res.ok && data.status) {
        await this.showToast('Laporan berhasil terkirim!', 'checkmark-circle-outline', 'custom-success-toast');
        this.resetForm();
        setTimeout(() => this.location.back(), 2600);
      } else {
        const errMsg = data?.message || 'Gagal mengirim laporan.';
        await this.showToast(errMsg, 'alert-circle-outline', 'custom-warning-toast');
      }

    } catch (err) {
      this.isSubmitting = false;
      console.error('kirimLaporan error:', err);
      await this.showToast('Koneksi gagal, coba lagi.', 'alert-circle-outline', 'custom-warning-toast');
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    this.previewImages = [];
    this.selectedFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      this.selectedFiles.push(file);

      const reader = new FileReader();
      reader.onload = (e: any) => this.previewImages.push(e.target.result);
      reader.readAsDataURL(file);
    }
  }

  private async showToast(message: string, icon: string, cssClass: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration : 2500,
      position : 'middle',
      icon,
      cssClass
    });
    await toast.present();
  }

  private resetForm() {
    this.selectedJenis    = '';
    this.judulLaporan     = '';
    this.deskripsiLaporan = '';
    this.previewImages    = [];
    this.selectedFiles    = [];
  }
}