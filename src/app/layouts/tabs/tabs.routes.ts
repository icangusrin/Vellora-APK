import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('../../features/home/home.page')
          .then(m => m.HomePage)
      },
      {
        path: 'notifikasi',
        loadComponent: () => import('../../features/notifikasi/notifikasi.page')
          .then(m => m.NotifikasiPage)
      },
      {
        path: 'chat',
        loadComponent: () => import('../../features/chat/chat/chat.page')
          .then(m => m.ChatPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('../../features/profile/profile/profile.page')
          .then(m => m.ProfilePage)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  }
];