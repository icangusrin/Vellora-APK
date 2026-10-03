import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Camera, CameraPermissionState } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
import { Network } from '@capacitor/network';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private alertCtrl: AlertController) {}

  async requestCameraPermission(): Promise<boolean> {
    try {
      const status = await Camera.checkPermissions();

      if (status.camera === 'granted') return true;

      if (status.camera === 'prompt' || status.camera === 'prompt-with-rationale') {
        const result = await Camera.requestPermissions({ permissions: ['camera'] });
        if (result.camera === 'granted') return true;
      }

      await this.showPermissionDeniedAlert(
        'Izin Kamera Diperlukan',
        'Vellora membutuhkan akses kamera untuk mengambil foto produk dan profil.',
        'kamera'
      );
      return false;

    } catch (error) {
      console.error('[PermissionService] requestCameraPermission error:', error);
      return false;
    }
  }

  async requestGalleryPermission(): Promise<boolean> {
    try {
      const status = await Camera.checkPermissions();

      if (status.photos === 'granted') return true;

      if (status.photos === 'prompt' || status.photos === 'prompt-with-rationale') {
        const result = await Camera.requestPermissions({ permissions: ['photos'] });
        if (result.photos === 'granted') return true;
      }

      await this.showPermissionDeniedAlert(
        'Izin Galeri Diperlukan',
        'Vellora membutuhkan akses galeri untuk memilih foto produk dan profil.',
        'galeri'
      );
      return false;

    } catch (error) {
      console.error('[PermissionService] requestGalleryPermission error:', error);
      return false;
    }
  }

  async requestCameraAndGalleryPermission(): Promise<boolean> {
    try {
      const status = await Camera.checkPermissions();
      const toRequest: ('camera' | 'photos')[] = [];
      if (status.camera !== 'granted') toRequest.push('camera');
      if (status.photos !== 'granted') toRequest.push('photos');

      if (toRequest.length === 0) return true;

      const result = await Camera.requestPermissions({ permissions: toRequest });

      const cameraOk = result.camera === 'granted' || status.camera === 'granted';
      const photosOk = result.photos === 'granted' || status.photos === 'granted';

      if (cameraOk && photosOk) return true;

      const deniedItems: string[] = [];
      if (!cameraOk) deniedItems.push('kamera');
      if (!photosOk) deniedItems.push('galeri');

      await this.showPermissionDeniedAlert(
        'Izin Diperlukan',
        `Vellora membutuhkan akses ${deniedItems.join(' dan ')} untuk fitur upload foto.`,
        deniedItems[0]
      );
      return false;

    } catch (error) {
      console.error('[PermissionService] requestCameraAndGalleryPermission error:', error);
      return false;
    }
  }

  async requestNotificationPermission(): Promise<boolean> {
    try {
      const status = await PushNotifications.checkPermissions();

      if (status.receive === 'granted') return true;

      if (status.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive === 'granted') {
          await PushNotifications.register();
          return true;
        }
      }

      await this.showPermissionDeniedAlert(
        'Izin Notifikasi Diperlukan',
        'Aktifkan notifikasi agar kamu tidak ketinggalan update pesanan, chat, dan promo dari Vellora.',
        'notifikasi'
      );
      return false;

    } catch (error) {
      console.error('[PermissionService] requestNotificationPermission error:', error);
      return false;
    }
  }

  async checkNetworkConnection(): Promise<boolean> {
    try {
      const status = await Network.getStatus();

      if (!status.connected) {
        await this.showNoConnectionAlert();
        return false;
      }

      return true;

    } catch (error) {
      console.error('[PermissionService] checkNetworkConnection error:', error);
      return false;
    }
  }

  private async showPermissionDeniedAlert(
    header: string,
    message: string,
    permissionType: string
  ): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      subHeader: this.getPermissionIcon(permissionType),
      cssClass: 'permission-denied-alert',
      backdropDismiss: false, 
      buttons: [
        {
          text: 'Nanti Saja',
          role: 'cancel',
          cssClass: 'alert-btn-cancel',
          handler: () => {
          }
        },
        {
          text: 'Buka Pengaturan',
          cssClass: 'alert-btn-settings',
          handler: () => {
            this.openAppSettings();
          }
        }
      ]
    });

    await alert.present();
  }

  private async showNoConnectionAlert(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: 'Tidak Ada Koneksi',
      message: 'Periksa koneksi WiFi atau data seluler kamu, lalu coba lagi.',
      cssClass: 'permission-denied-alert',
      backdropDismiss: false,
      buttons: [
        {
          text: 'Tutup',
          role: 'cancel'
        },
        {
          text: 'Coba Lagi',
          handler: async () => {
            // Re-check koneksi setelah user tap "Coba Lagi"
            const status = await Network.getStatus();
            if (!status.connected) {
              await this.showNoConnectionAlert();
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private openAppSettings(): void {
    try {
      if ((window as any).cordova) {
        (window as any).cordova.plugins.diagnostic.switchToSettings();
      } else {
        window.open('app-settings:', '_system');
      }
    } catch (error) {
      console.error('[PermissionService] openAppSettings error:', error);
    }
  }

  private getPermissionIcon(type: string): string {
    const icons: Record<string, string> = {
      kamera: '📷 Akses Kamera',
      galeri: '🖼️ Akses Galeri',
      notifikasi: '🔔 Notifikasi',
      lokasi: '📍 Lokasi',
    };
    return icons[type] ?? '🔐 Izin Aplikasi';
  }
}