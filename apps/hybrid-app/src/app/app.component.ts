import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Plugins, StatusBarStyle } from '@capacitor/core';
import { environment } from '@eview/core';
import { ConfigHelpers } from '@eview/core/config/config.helpers';
import { SiteConfigItem } from '@eview/core/models/config';
import { EAuthActions } from '@eview/core/store/actions/auth.actions';
import { selectConfig } from '@eview/core/store/selectors/config.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { AppBaseComponent } from '@eview/web';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar as NgxStatusBar } from '@ionic-native/status-bar/ngx';
import { Platform } from '@ionic/angular';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Spinkit } from 'ng-http-loader';
import { Observable } from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';
import { ToastService } from './features/toast/toast.service';
import { ToastType } from './features/toast/toast.component';
import { ApiServerError, EApiErrorActions } from '@eview/core/store/actions/error.actions';
import {
  LastJobSuccess,
  EExportActions,
  CreateJobSuccess
} from '@eview/core/store/actions/export.actions';
import { ExportService } from '@eview/core/domain/export/export.service';
import { FileSaverService } from 'ngx-filesaver';
const { StatusBar } = Plugins;


@Component({
  selector: 'eview-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent extends AppBaseComponent implements OnInit {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: NgxStatusBar,
    private breakpointObserver: BreakpointObserver,
    private store: Store<AppState>,
    private actions$: Actions,
    private router: Router,
    @Inject(ViewContainerRef) private viewContainerRef: ViewContainerRef,
    public toast: ToastService,
    private exportService: ExportService,
    private fileSaver: FileSaverService
  ) {
    super();

    this.initializeApp();

    document.title = environment.deploymentName;
    toast.setViewContainerRef(viewContainerRef);
  }

  ngOnInit() {
    this.actions$
      .pipe(ofType(EAuthActions.LoginSuccess))
      .subscribe(() => this.router.navigate(['/']));

    this.actions$
      .pipe(ofType(EAuthActions.LogoutSuccess))
      .subscribe(() => this.router.navigate(['/login']));

    this.actions$
      .pipe(ofType(EApiErrorActions.ApiServerError))
      .subscribe((error: ApiServerError) => {
        const err = error.payload;
        let errorMsg = '';
        if (err && err.error) {
          const error = err.error;
          if (err.status === 422 || err.status === 403 || err.status === 500) {
            errorMsg = (error.errors) ? error.errors[0].message : '';
          } else if (err.status !== 401) {
            errorMsg = err.message;
          }
          this.toast.show(
            ToastType.Warning,
            err.status === 0 ? 'TOAST_GENERIC_ERROR' : errorMsg
          );
      }
    });

    this.actions$
      .pipe(ofType<CreateJobSuccess>(EExportActions.CreateJobSuccess))
      .subscribe(() => {
        this.toast.show(ToastType.Success, 'TOAST_CREATE_JOB_SUCCESS');
      });

    this.actions$
      .pipe(
        ofType<LastJobSuccess>(EExportActions.LastJobSuccess),
        switchMap(action =>
          this.exportService
            .readAsBlob(action.payload.url)
            .pipe(map(blob => ({ url: action.payload.url, blob })))
        )
      )
      .subscribe(({ url, blob }) => {
        this.fileSaver.save(blob, environment.export.expoerted_file_name);
      });

    this.store.select(selectConfig).subscribe(config => {
      const siteConfig = ConfigHelpers.GetConfigItem<SiteConfigItem>(
        SiteConfigItem,
        config
      );
      if (!siteConfig) return;
      document.title = siteConfig.name || environment.deploymentName;
    });
  }

  ngHttpLoaderConfig = environment.ngHttpLoaderConfig;
  spinkit = Spinkit;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  initializeApp() {
    this.splashScreen.hide();
    this.platform.ready().then(() => {
      if (this.platform.is('capacitor')) {
        StatusBar.setStyle({
          style: StatusBarStyle.Dark
        });
      } else {
        this.statusBar.styleDefault();
        this.splashScreen.hide();
      }
    });
  }
}
