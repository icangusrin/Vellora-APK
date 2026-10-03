import {
  Component,
  OnInit
} from '@angular/core';

import {
  CommonModule,
  Location
} from '@angular/common';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  IonContent,
  IonIcon
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  arrowBackOutline,
  cubeOutline,
  bicycleOutline,
  checkmarkCircleOutline,
  timeOutline,
  locationOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-lacak-pesanan',
  templateUrl: './lacak-pesanan.page.html',
  styleUrls: ['./lacak-pesanan.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon
  ]
})

export class LacakPesananPage
implements OnInit {

  order: any;

  // 0 dibuat
  // 1 dikemas
  // 2 dikirim
  // 3 selesai
  currentStep = 0;

  logs: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) {

    addIcons({
      arrowBackOutline,
      cubeOutline,
      bicycleOutline,
      checkmarkCircleOutline,
      timeOutline,
      locationOutline
    });

  }

  ngOnInit() {

    const id = Number(
      this.route.snapshot.paramMap.get('id')
    );

    const savedOrders =
      localStorage.getItem('orders');

    if (!savedOrders) return;

    const orders = JSON.parse(savedOrders);

    const found = orders.find(
      (item: any) =>
        Number(item.id) === id
    );

    if (!found) return;

    this.order = found;


if (!found) return;

this.order = found;


switch (found.status) {

  case 'belum-dibayar':

    this.currentStep = 0;

    break;

  case 'dikemas':

    this.currentStep = 1;

    break;

  case 'dikirim':

    this.currentStep = 2;

    break;

  case 'selesai':

    this.currentStep = 3;

    break;

  default:

    this.currentStep = 0;

}


this.buildLogs(found);


    switch (found.status) {

      case 'belum-dibayar':

        this.currentStep = 0;

        break;

      case 'dikemas':

        this.currentStep = 1;

        break;

      case 'dikirim':

        this.currentStep = 2;

        break;

      case 'selesai':

        this.currentStep = 3;

        break;

      default:

        this.currentStep = 0;

    }


    this.buildLogs(found);

  }

  buildLogs(order: any) {

    this.logs = [];

    const date =
      order.purchaseDate ||
      '08 Mei 2026';


    this.logs.push({

      icon: 'time-outline',

      time: date,

      label: 'Pesanan dibuat',

      desc:
        'Pesanan berhasil dibuat.'

    });


    if (
      this.currentStep >= 1
    ) {

      this.logs.push({

        icon: 'cube-outline',

        time: date,

        label: 'Pesanan dikemas',

        desc:
          (order.store || 'Toko') +
          ' sedang menyiapkan pesanan kamu.'

      });

    }


    if (
      this.currentStep >= 2
    ) {

      this.logs.push({

        icon: 'bicycle-outline',

        time: date,

        label: 'Paket dikirim',

        desc:
          'Kurir ' +
          (order.courier || '-') +
          ' telah mengambil paket.'

      });

      this.logs.push({

        icon: 'location-outline',

        time: date,

        label: 'Dalam perjalanan',

        desc:
          'Paket sedang menuju alamat tujuan.'

      });

    }

    if (
      this.currentStep >= 3
    ) {

      this.logs.push({

        icon:
          'checkmarkCircleOutline',

        time: date,

        label: 'Pesanan selesai',

        desc:
          'Pesanan telah diterima.'

      });

    }

    this.logs.reverse();

  }

  isDone(step: number): boolean {

    return this.currentStep >= step;

  }

  isActive(step: number): boolean {

    return this.currentStep === step;

  }

goBack() {

  if (this.order?.id) {

    this.router.navigate([
      '/rincian-pesanan',
      this.order.id
    ]);

  } else {

    this.router.navigate([
      '/pesanan'
    ]);

  }

}
}