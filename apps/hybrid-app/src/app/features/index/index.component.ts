import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivationStart, Router, RouterOutlet } from '@angular/router';
import { BaseComponent, environment } from '@eview/core';
import { AuthHelpers } from '@eview/core/auth';
import { Permission } from '@eview/core/auth/permission';
import { ConfigHelpers } from '@eview/core/config/config.helpers';
import { SiteConfigItem } from '@eview/core/models/config';
import { TranslateService } from '@ngx-translate/core';
import { User } from '@eview/core/models/user';
import { UserPermissions } from '@eview/core/models/user-permissions';
import { Logout } from '@eview/core/store/actions/auth.actions';
import { EConfigActions } from '@eview/core/store/actions/config.actions';
import { selectConfig } from '@eview/core/store/selectors/config.selector';
import { selectUserPermissions } from '@eview/core/store/selectors/user-permissions.selector';
import { selectUser } from '@eview/core/store/selectors/user.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { selectUnreadNotifications } from '@eview/core/store/selectors/notifications.selector';
import { selectNetworkStatus } from '@eview/core/store/selectors/network-status.selector';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PostEditorPageComponent } from '../shared/post-editor/post-editor/post-editor-page.component';

@Component({
  selector: 'eview-index',
  templateUrl: 'index.component.html',
  styleUrls: ['index.component.scss']
})
export class IndexComponent extends BaseComponent implements OnInit, OnDestroy {
  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private router: Router,
    private translate: TranslateService,
    private modalService: NgbModal
  ) {
    super();
    this.subs = new Subscription();
  }

  time = {hour: 'Hrs', minute: 'Mins'};
  countryCodes = environment.countryCodes;
  currentLang: string = this.translate.currentLang;
  userCanSubmitPosts: boolean = false;

  ngOnInit() {
    this.subs.add(
      this.router.events.subscribe(e => {
        if (e instanceof ActivationStart) {
          window.scroll(0, 0);
          if (e.snapshot.outlet === 'dashboard') this.outlet.deactivate();
        }
      })
    );

    this.subs.add(
      AuthHelpers.User.HasUserPermission(
      this.store,
      Permission.CreatePost
      ).subscribe(can => {
        this.userCanSubmitPosts = can;
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  @ViewChild(RouterOutlet, { static: false }) outlet: RouterOutlet;

  private subs: Subscription;

  configReady$: Observable<boolean> = this.actions$.pipe(
    ofType(EConfigActions.GetConfigSuccess),
    map(() => {
      return true;
    })
  );

  siteConfig$: Observable<SiteConfigItem> = this.store
    .select(selectConfig)
    .pipe(
      map(config =>
        ConfigHelpers.GetConfigItem<SiteConfigItem>(SiteConfigItem, config)
      )
    );

  deploymentName$: Observable<string> = this.siteConfig$.pipe(
    map(siteConfig =>
      siteConfig ? siteConfig.name : environment.deploymentName
    )
  );

  footer$: Observable<string> = this.siteConfig$.pipe(
    map(siteConfig =>
      siteConfig ? siteConfig.description : environment.footer.text
    )
  );

  footer = {
    ...environment.footer,
    year: new Date().getFullYear()
  };

  user$: Observable<User> = this.store.select(selectUser);
  userPermissions$: Observable<UserPermissions> = this.store.select(
    selectUserPermissions
  );
  isNetworkAvailable$: Observable<any> = this.store.select(
    selectNetworkStatus
  );

  sidebarItems: {
    link: string;
    icon: string;
    text: string;
    permission?: Permission;
    children?: {
      link: string;
      icon: string;
      text: string;
      permission?: Permission;
    }[];
  }[] = [
    { link: '/dashboard/map', icon: 'icon_map_view', text: 'MENU_MAP_VIEW' },
    {
      link: null,
      icon: 'icon_reports_analysis',
      text: 'MENU_REPORTS_ANALYSIS',
      children: [
        {
          link: '/dashboard/posts',
          icon: 'edit',
          text: 'MENU_POSTS',
          permission: Permission.ViewPosts
        },
        // {
        //   link: '/dashboard/post/attributes',
        //   icon: 'chart-bar',
        //   text: 'MENU_REPORT_FORMS',
        //   permission: Permission.ManageSettings
        // },
        {
          link: '/dashboard/messages',
          icon: 'sms',
          text: 'MESSAGES',
          permission: Permission.ManageCollectionsAndSavedSearches
        }
      ]
    },
    {
      link: null,
      icon: 'icon_categories',
      text: 'MENU_ANALYSIS',
      permission: Permission.ManageCollectionsAndSavedSearches,
      children: [
        {
          link: '/dashboard/analysis',
          icon: 'dot-circle',
          text: 'MENU_ANALYSIS',
          permission: Permission.ManageCollectionsAndSavedSearches
        },
        {
          link: '/dashboard/analysis-templates',
          icon: 'dot-circle',
          text: 'MENU_ANALYSIS_FILTERS',
          permission: Permission.ManageCollectionsAndSavedSearches
        }
      ]
    }
  ];

  sidebarItemsSecondGroup: {
    link: string;
    icon: string;
    text: string;
     permission?: Permission;
    children?: {
      link: string;
      icon: string;
      text: string;
      permission?: Permission;
    }[];
  }[] = [
    	{
      link: null,
      icon: 'icon_settings',
      text: 'MENU_SETTINGS',
      permission: Permission.ManageSettings,
      children: [
        {
          link: '/dashboard/forms-management',
          icon: 'icon_settings',
          text: 'FORMS_MANAGEMENT'
        },
        {
          link: '/dashboard/tags',
          icon: 'edit',
          text: 'MENU_TAGS',
          permission: Permission.ManageSettings
        },
        {
          link: '/dashboard/user-access-management',
          icon: 'icon_filters',
          text: 'ACCESS_MGMT',
          permission: Permission.ManageSetupInfo
        },
        {
          link: '/dashboard/user-management',
          icon: 'icon_settings',
          text: 'USER_MANAGEMENT',
          permission: Permission.CreateUser
        }        
      ]
    }
  ];

  menuVisibile: boolean = true;

  unreadNotifications$: Observable<boolean> = this.store.select(
    selectUnreadNotifications
  );


  hasUserPermission(permission: Permission) {
    return AuthHelpers.User.HasUserPermission(this.store, permission);
  }

  onLogoutClick() {
    this.store.dispatch(new Logout());
  }

  onLanguageChange(languageCode) {
    if (languageCode && languageCode.length > 0) {
      this.currentLang = languageCode;
      this.translate.use(this.currentLang);
    }
  }

  //function to open modal popup
  openCreateIncident(){
    const createIncidentModalRef = this.modalService.open(PostEditorPageComponent, {ariaLabelledBy: 'modal-basic-title', windowClass : "customModalWindowClass" });
    createIncidentModalRef.componentInstance.modalCloseEvent.subscribe(($e) => {
      createIncidentModalRef.dismiss();
    });
  }
  
}
