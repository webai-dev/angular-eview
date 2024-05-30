import { Component, OnInit, ViewChild } from '@angular/core';
import { BaseComponent, environment } from '@eview/core';
import { AuthHelpers } from '@eview/core/auth';
import { Permission } from '@eview/core/auth/permission';
import { ConfigHelpers } from '@eview/core/config/config.helpers';
import { SiteConfigItem } from '@eview/core/models/config';
import { User } from '@eview/core/models/user';
import { UserPermissions } from '@eview/core/models/user-permissions';
import { EConfigActions } from '@eview/core/store/actions/config.actions';
import { selectConfig } from '@eview/core/store/selectors/config.selector';
import { selectUserPermissions } from '@eview/core/store/selectors/user-permissions.selector';
import { selectUser } from '@eview/core/store/selectors/user.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Logout,
  EAuthActions,
  LogoutSuccess
} from '@eview/core/store/actions/auth.actions';
import { RouterOutlet, Router, ActivationStart } from '@angular/router';

@Component({
  selector: 'eview-index',
  templateUrl: 'index.component.html',
  styleUrls: ['index.component.scss']
})
export class IndexComponent extends BaseComponent implements OnInit {
  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private router: Router
  ) {
    super();
  }

  ngOnInit() {
    this.router.events.subscribe(e => {
      if (e instanceof ActivationStart) {
        window.scroll(0, 0);
        if (e.snapshot.outlet === 'dashboard') this.outlet.deactivate();
      }
    });

    this.actions$
      .pipe(ofType<LogoutSuccess>(EAuthActions.LogoutSuccess))
      .subscribe(() => {
        this.router.navigateByUrl('/login');
      });
  }

  @ViewChild(RouterOutlet, { static: false }) outlet: RouterOutlet;

  public configReady$: Observable<boolean> = this.actions$.pipe(
    ofType(EConfigActions.GetConfigSuccess),
    map(() => {
      return true;
    })
  );

  public siteConfig$: Observable<SiteConfigItem> = this.store
    .select(selectConfig)
    .pipe(
      map(config =>
        ConfigHelpers.GetConfigItem<SiteConfigItem>(SiteConfigItem, config)
      )
    );

  public deploymentName$: Observable<string> = this.siteConfig$.pipe(
    map(siteConfig =>
      siteConfig ? siteConfig.name : environment.deploymentName
    )
  );

  public footer$: Observable<string> = this.siteConfig$.pipe(
    map(siteConfig =>
      siteConfig ? siteConfig.description : environment.footer.text
    )
  );

  public footer = {
    ...environment.footer,
    year: new Date().getFullYear()
  };

  public user$: Observable<User> = this.store.select(selectUser);
  public userPermissions$: Observable<UserPermissions> = this.store.select(
    selectUserPermissions
  );

  public sidebarItems: {
    link: string;
    icon: string;
    text: string;
    permission?: Permission;
  }[] = [
    { link: '/dashboard/map', icon: 'globe', text: 'MENU_MAP' },
    {
      link: '/dashboard/post/submit',
      icon: 'plus',
      text: 'MENU_SUBMIT',
      permission: Permission.SubmitPosts
    },
    {
      link: '/dashboard/posts',
      icon: 'stream',
      text: 'MENU_POSTS'
    },
    {
      link: '/dashboard/tags',
      icon: 'hashtag',
      text: 'MENU_TAGS',
      permission: Permission.ManageSettings
    }
  ];

  public menuVisibile: boolean = false;

  public hasUserPermission(permission: Permission) {
    return AuthHelpers.User.HasUserPermission(this.store, permission);
  }

  public onLogoutClick() {
    this.store.dispatch(new Logout());
  }
}
