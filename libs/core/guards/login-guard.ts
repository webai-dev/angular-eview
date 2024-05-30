import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { User } from '@eview/core/models/user';
import { selectUser } from '@eview/core/store/selectors/user.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from '../auth';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate, CanActivateChild {
  constructor(
    private store: Store<AppState>,
    private authService: AuthService,
    private router: Router
  ) {}

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
    return this.authService.me().pipe(
      catchError(error => {
        return of(null);
      }),
      map(u => {
        if (u) {
          this.router.navigate(['/']);
          return false;
        }
        return true;
      })
    );
  }

  user$: Observable<User> = this.store.select(selectUser);
}
