import { Injectable } from '@angular/core';
import { BaseService } from '@eview/core/base/base-service';
import { Observable, of } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '@eview/core/store/states/app.state';
import { ConnectionService } from 'ng-connection-service';

import {
  UpdateNetworkStatus
} from '@eview/core/store/actions/network-status.actions';

@Injectable({
  providedIn: 'root'
})
export class NetworkStatusService extends BaseService {
  isConnected = true;
  constructor(
    private connectionService: ConnectionService,
    store: Store<AppState>
  ) {
    super();
    this.connectionService.monitor().subscribe(isConnected => {
      this.isConnected = isConnected;
      store.dispatch(new UpdateNetworkStatus(isConnected));
    });
  }

  checkNetworkStatus(): Observable<any> {
    return of(this.isConnected);
  }
}
