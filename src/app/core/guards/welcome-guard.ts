import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';

export const welcomeGuard: CanActivateFn = async () => {
  const router = inject(Router);

  const { value } = await Preferences.get({
    key: 'welcome_seen'
  });

  if (value === 'true') {
    return router.createUrlTree(['/tabs/home']);
  }

  return true;
};