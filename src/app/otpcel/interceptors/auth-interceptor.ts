import {
  HttpInterceptorFn
} from '@angular/common/http';

import {
  inject
} from '@angular/core';

import {
  Router
} from '@angular/router';

import {
  catchError
} from 'rxjs/operators';

import {
  throwError
} from 'rxjs';

import { AuthService } from '../services/auth.service';

export const authInterceptor:
HttpInterceptorFn = (

  
  req,
  next

) => {

  const authService =
    inject(AuthService);

  const router =
    inject(Router);

  const token = authService.getToken();
  console.log('INTERCEPTOR TOKEN:', token);
  console.log('INTERCEPTOR URL:', req.url);

    
  // CLONE REQUEST + INJECT TOKEN
  let authReq = req;

  if (token) {

    authReq = req.clone({

      setHeaders: {

        Authorization:
          `Bearer ${token}`

      }

    });

  }

  return next(authReq).pipe(

    catchError((err) => {

      if (err.status === 401) {

        authService.logout();

        window.dispatchEvent(
          new CustomEvent(
            'session-expired',
            {
              detail:
                'Session habis, silakan login ulang'
            }
          )
        );

        router.navigate([
          '/auth/login'
        ]);

      }

      return throwError(
        () => err
      );

    })

  );

};