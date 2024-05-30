import { Injectable } from '@angular/core';
import { BaseService } from '@eview/core/base/base-service';
import { Observable, of } from 'rxjs';
import { Position } from '@eview/core/models/map';
import { environment } from '@eview/core/environments/environment';
import {
  Provider,
  MapQuestForwardResponse
} from './geocoding';
import { catchError, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService extends BaseService {

forward(address: string): Observable<any> {
    const provider: Provider = environment.geocoding.provider as Provider;
    const providerConfig = environment.geocoding[provider] || null;
    if (!providerConfig) throw 'Geocoding configuration is not valid.';

    if (provider === Provider.MapQuest)
      return this.forwardViaMapQuest(providerConfig, address);
    return of(null);
  }

  private forwardViaMapQuest(
    config: { url: string; key: string },
    address: string
  ): Observable<Position> {
     const mapSearch: MapSearch = {
        key: config.key,
        q: address,
        limit: 10,
        format:'json',
        countrycodes: environment.defaultCountryCode
      };
    return this.http
      .get<MapQuestForwardResponse>(config.url, {
        params: this.getParamsFromObject(mapSearch)
      })
      .pipe(
        switchMap(response => {
          if (!response[0]) return of(null);
          if (response)
            return of(response);
        }),
        catchError(() => [null])
      );
  }
}

interface MapSearch {
  key: string,
  q: string,
  limit: number,
  format: string,
  countrycodes: string
}
