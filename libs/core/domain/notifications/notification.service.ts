import { Injectable } from '@angular/core';
import { BaseService } from '@eview/core/base/base-service';
import { Observable } from 'rxjs';
import { Notifications } from './notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends BaseService {
  readonly uris = {
    list: 'notifications_ex'
  };

  list(): Observable<Notifications> {
    return this.http.get<Notifications>(this.getUrl(this.uris.list));
  }
}
