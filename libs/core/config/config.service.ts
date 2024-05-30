import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, throwError, of } from 'rxjs';
import { BaseService } from '../base/base-service';
import { environment } from '../environments/environment';
import { Config } from '../models/config';

@Injectable({
  providedIn: 'root'
})
export class ConfigService extends BaseService {
  readonly uris = {
    config: `api/${environment.api.version}/config`,
    update: `api/${environment.api.version}/config/:group_key`
  };

  init() {}

  get(): Observable<Config> {
    return this.http.get<Config>(this.getUrl(this.uris.config, false)).pipe(
      catchError(err => {
        return this.cacheHandler(err, 'config');
      })
    );
  }

  update(key, data): Observable<Object> {
    return this.http.put(
      this.getUrl(this.uris.update, false).replace(':group_key', key.toString()),
      data
    );
  }
}
