import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from '@eview/core';
import { ConfigHelpers } from '@eview/core/config/config.helpers';
import { SiteConfigItem } from '@eview/core/models/config';
import { EAuthActions, Login } from '@eview/core/store/actions/auth.actions';
import { selectConfig } from '@eview/core/store/selectors/config.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastType } from '../../shared/toast/toast.component';
import { ToastService } from '../../shared/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'eview-login',
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent implements OnInit {
  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private toast: ToastService,
    private router: Router
  ) {
    this.actions$.pipe(ofType(EAuthActions.LoginFailure)).subscribe(() => {
      // TODO: Translate.
      this.toast.show(ToastType.Warning, 'Ops, something went wrong :-(');
      this.loginForm.patchValue({ password: '' });
    });

    this.router.events.subscribe(() => {
      document.body.style.alignItems = 'unset';
    });
  }

  ngOnInit() {
    document.body.style.alignItems = 'center';
  }

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

  public private$: Observable<boolean> = this.siteConfig$.pipe(
    map(siteConfig => (siteConfig ? siteConfig.private : true))
  );

  public footer = {
    ...environment.footer,
    year: new Date().getFullYear()
  };

  public loginForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required)
  });

  public showPassword: boolean = false;

  onForgotPasswordClick() {
    // TODO.
  }

  onLoginClick() {
    this.showPassword = false;
    this.store.dispatch(
      new Login({
        username: this.loginForm.get('username').value,
        password: this.loginForm.get('password').value
      })
    );
  }

  onRegisterClick() {
    // TODO.
  }
}
