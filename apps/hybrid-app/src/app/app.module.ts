import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';
import {
  FaIconLibrary,
  FontAwesomeModule
} from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicRouteStrategy } from '@ionic/angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { CoreModule } from './core/core.module';
import { AuthModule } from './features/auth/auth.module';
import { IndexModule } from './features/index/index.module';
import { SharedModule } from './features/shared/shared.module';
import { Actions, ofType } from '@ngrx/effects';
import {
  StartNotifications,
  ENotificationsActions,
  ListNotifications,
  StopNotifications
} from '@eview/core/store/actions/notifications.actions';
import { environment } from '@eview/core';
import { Store } from '@ngrx/store';
import { AppState } from '@eview/core/store/states/app.state';

@NgModule({
  imports: [
    CoreModule,
    NgHttpLoaderModule.forRoot(),
    SharedModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    NgbModule,
    FontAwesomeModule,
    AuthModule,
    IndexModule
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  providers: [
    SplashScreen,
    StatusBar,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ]
})
export class AppModule {
  constructor(
    library: FaIconLibrary,
    actions$: Actions,
    store: Store<AppState>
  ) {
    library.addIconPacks(fas);
    this.handleNotifications(actions$, store);
  }

  private handleNotifications(actions$, store) {
    let notificationsTimer = null;
    actions$
      .pipe(
        ofType<StartNotifications>(ENotificationsActions.StartNotifications)
      )
      .subscribe(() => {
        if (notificationsTimer) clearInterval(notificationsTimer);
        if (
          environment.notifications.enabled &&
          environment.notifications.timing > 0
        ) {
          notificationsTimer = setInterval(() => {
            store.dispatch(new ListNotifications());
          }, environment.notifications.timing * 1000 || 1000);
        }
      });
    actions$
      .pipe(ofType<StopNotifications>(ENotificationsActions.StopNotifications))
      .subscribe(() => {
        if (notificationsTimer) clearInterval(notificationsTimer);
      });
  }
}
