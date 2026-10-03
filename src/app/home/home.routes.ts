import { Routes } from '@angular/router';
import { HomePage } from './home.page';

export const routes: Routes = [
  {
    path: 'fashion',
    loadComponent: () =>
      import('../fashion/fashion.page').then(m => m.FashionPage),
  },
  {
    path: 'beauty',
    loadComponent: () =>
      import('../beauty/beauty.page').then(m => m.BeautyPage),
  },
  {
    path: 'elektronik',
    loadComponent: () =>
      import('../elektronik/elektronik.page').then(m => m.ElektronikPage),
  },
  {
    path: 'snack',
    loadComponent: () =>
      import('../snack/snack.page').then(m => m.SnackPage),
  },
];