import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LaporkanPage } from './laporkan.page';

const routes: Routes = [
  {
    path: '',
    component: LaporkanPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LaporkanPageRoutingModule {}
