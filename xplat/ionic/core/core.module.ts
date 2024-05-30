import { NgModule, Optional, SkipSelf } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { throwIfAlreadyLoaded } from '@eview/utils';
import { EviewCoreModule } from '@eview/web';

@NgModule({
  imports: [EviewCoreModule, IonicModule.forRoot()],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ]
})
export class EviewIonicCoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: EviewIonicCoreModule
  ) {
    throwIfAlreadyLoaded(parentModule, 'EviewIonicCoreModule');
  }
}
