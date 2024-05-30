import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { ConfigHelpers } from '@eview/core/config/config.helpers';
import { SiteConfigItem } from '@eview/core/models/config';
import { User } from '@eview/core/models/user';
import { selectConfig } from '@eview/core/store/selectors/config.selector';
import { selectUser } from '@eview/core/store/selectors/user.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import { Observable, of, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PrivateSiteGuard implements CanActivate, CanActivateChild {
  constructor(private store: Store<AppState>, private router: Router) {}

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.canActivate(childRoute, state);
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return combineLatest(this.private$, this.user$).pipe(
      map(([p, u]) => {
        if (p && !u) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }

  siteConfig$: Observable<SiteConfigItem> = this.store
    .select(selectConfig)
    .pipe(
      map(config =>
        ConfigHelpers.GetConfigItem<SiteConfigItem>(SiteConfigItem, config)
      )
    );

  private$: Observable<boolean> = this.siteConfig$.pipe(
    map(siteConfig => (siteConfig ? siteConfig.private : true))
  );

  user$: Observable<User> = this.store.select(selectUser);
}
