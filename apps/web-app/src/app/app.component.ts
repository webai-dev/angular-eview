import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { environment } from '@eview/core';
import { ConfigHelpers } from '@eview/core/config/config.helpers';
import { SiteConfigItem } from '@eview/core/models/config';
import { selectConfig } from '@eview/core/store/selectors/config.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { AppBaseComponent } from '@eview/web';
import { Store } from '@ngrx/store';
import { Spinkit } from 'ng-http-loader';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { ToastService } from './features/shared/toast/toast.service';
import { Actions, ofType } from '@ngrx/effects';
import { EAuthActions } from '@eview/core/store/actions/auth.actions';
import { Router } from '@angular/router';

@Component({
  selector: 'eview-root',
  templateUrl: './app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent extends AppBaseComponent implements OnInit {
  constructor(
    private breakpointObserver: BreakpointObserver,
    private store: Store<AppState>,
    private actions$: Actions,
    private router: Router,
    @Inject(ViewContainerRef) private viewContainerRef: ViewContainerRef,
    toast: ToastService
  ) {
    super();
    document.title = environment.deploymentName;
    toast.setViewContainerRef(viewContainerRef);

    this.actions$
      .pipe(ofType(EAuthActions.LoginSuccess))
      .subscribe(() => this.router.navigate(['/']));
  }

  ngOnInit() {
    this.store.select(selectConfig).subscribe(config => {
      const siteConfig = ConfigHelpers.GetConfigItem<SiteConfigItem>(
        SiteConfigItem,
        config
      );
      if (!siteConfig) return;
      document.title = siteConfig.name || environment.deploymentName;
    });
  }

  public ngHttpLoaderConfig = environment.ngHttpLoaderConfig;
  public spinkit = Spinkit;

  isHandset$: Observable<boolean> = this.breakpointObserver
    .observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );
}
