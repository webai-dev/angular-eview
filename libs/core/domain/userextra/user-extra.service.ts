import { Injectable } from '@angular/core';
import { BaseService } from '@eview/core/base/base-service';
import { Observable } from 'rxjs';
import { UserExtra } from '../../../core/models/user-extra';

@Injectable({
  providedIn: 'root'
})
export class UserExtraService extends BaseService {
  readonly uris = {
    user_extra: 'users/extra'
  };

  saveUserExtra(data): Observable<any> {
    return this.http.post<UserExtra>(this.getUrl(this.uris.user_extra), data);
  }

  getUserExtra(): Observable<UserExtra> {
    return this.http.get<UserExtra>(this.getUrl(this.uris.user_extra));
  }
}
