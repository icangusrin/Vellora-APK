import {
  Injectable
} from '@angular/core';

import { environment } from 'src/environments/environment';

import Echo from 'laravel-echo';

import Pusher from 'pusher-js';

@Injectable({
  providedIn: 'root'
})

export class RealtimeService {

  echo!: Echo<any>;

  constructor() {

    (window as any).Pusher = Pusher;

  }


  connect(token: string) {

    this.echo = new Echo({

      broadcaster: 'pusher',

      key:     environment.pusherKey,
      cluster: environment.pusherCluster,

      forceTLS: true,

      authEndpoint:
        `${environment.apiUrl}/broadcasting/auth`,

      auth: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }

    });

  }


  listenChat(roomId: number, callback: any) {

    this.echo
      .private(`chat.${roomId}`)
      .listen('.MessageSent', (event: any) => {

        callback(event);

      });

  }


  leaveChat(roomId: number) {

    if (this.echo) {
      this.echo.leave(`chat.${roomId}`);
    }

  }

}