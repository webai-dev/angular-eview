import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  APP_INITIALIZER,
  Inject,
  ModuleWithProviders,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import { throwIfAlreadyLoaded } from '@eview/utils';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { Store, StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from './auth';
import { environment } from './environments/environment';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { ApiErrorInterceptor } from './interceptors/error.interceptor';
import { CORE_PROVIDERS, PlatformLanguageToken } from './services';
import { LogService } from './services/log.service';
import { UserLoggedIn } from './store/actions/app.actions';
import { GetCurrentUser, LogoutSuccess } from './store/actions/auth.actions';
import { GetConfig } from './store/actions/config.actions';
import { appEffects } from './store/effects/app.effects';
import { appReducers } from './store/reducers/app.reducers';
import { AppState } from './store/states/app.state';
import { ApiServerError } from '@eview/core/store/actions/error.actions';
import { CheckNetworkStatus } from '@eview/core/store/actions/network-status.actions';
import { storageMetaReducer } from './storage.metareducer';
import { selectNetworkStatus } from '@eview/core/store/selectors/network-status.selector';

/**
 * DEBUGGING
 */
LogService.DEBUG.LEVEL_4 = !environment.production;

export const BASE_PROVIDERS: any[] = [
  ...CORE_PROVIDERS,
  { provide: APP_BASE_HREF, useValue: '/' },
  {
    provide: APP_INITIALIZER,
    useFactory: appInit,
    deps: [AuthService, Store],
    multi: true
  },
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  {
    provide: HTTP_INTERCEPTORS,
    useClass: ApiErrorInterceptor,
    deps: [Store],
    multi: true
  }
];

function initActions(auth, store) {
    const { token } = auth.init();
    if (token && auth.hasRefreshToken(token)) {
      store.dispatch(new GetCurrentUser());
      store.dispatch(new UserLoggedIn());
    }
    store.dispatch(new GetConfig());
    store.dispatch(new ApiServerError({}));
    store.dispatch(new CheckNetworkStatus());
    if (!token) {
      store.dispatch(new LogoutSuccess());
    }
}

export function appInit(auth: AuthService, store: Store<AppState>) {
  return () => {
    initActions(auth, store);
    let initialStatus: boolean = false;
    store.select(selectNetworkStatus).subscribe((status) => {
      if (initialStatus) {
        initActions(auth, store);
      }
      initialStatus = (status) ? false : true;
    })
  };
}

@NgModule({
  imports: [
    CommonModule,
    StoreModule.forRoot(appReducers, {
      metaReducers: [storageMetaReducer]
    }),
    EffectsModule.forRoot(appEffects),
    StoreRouterConnectingModule.forRoot({ stateKey: 'router' }),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ]
})
export class CoreModule {
  static forRoot(configuredProviders: Array<any>): ModuleWithProviders {
    return {
      ngModule: CoreModule,
      providers: [...BASE_PROVIDERS, ...configuredProviders]
    };
  }

  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule,
    @Inject(PlatformLanguageToken) lang: string,
    translate: TranslateService
  ) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
    translate.setDefaultLang(environment.defaultLanguage);
    if(environment.availableLanguages.find(languageCode=>languageCode.toLowerCase()===lang.toLowerCase())){
      translate.use(lang);
    }
    else{
      translate.use(environment.defaultLanguage);
    }
  }
}
