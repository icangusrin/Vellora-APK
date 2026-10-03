import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LaporkanPageRoutingModule } from './laporkan-routing.module';

import { LaporkanPage } from './laporkan.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LaporkanPageRoutingModule
  ],
  declarations: [LaporkanPage]
})
export class LaporkanPageModule {}
