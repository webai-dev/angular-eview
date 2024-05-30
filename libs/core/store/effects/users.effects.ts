import { Injectable } from '@angular/core';
import { UserService } from '@eview/core/users/user.service';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import {
  EUsersActions,
  ListUsers,
  ListUsersFailure,
  ListUsersSuccess
} from '../actions/users.actions';
import { OrderSort } from '@eview/core/models/commons';

@Injectable()
export class UsersEffects {
  constructor(private userService: UserService, private actions$: Actions) {}

  @Effect()
  list: Observable<any> = this.actions$.pipe(
    ofType<ListUsers>(EUsersActions.ListUsers),
    switchMap(() => {
      return this.userService.list({offset: 0, limit: 20, orderby: 'id', order: OrderSort.Asc}).pipe(
        switchMap(payload => [
          payload ? new ListUsersSuccess(payload) : new ListUsersFailure()
        ]),
        catchError(error => {
          console.error(error);
          return [new ListUsersFailure()];
        })
      );
    }),
    catchError(error => {
      console.error(error);
      return [new ListUsersFailure()];
    })
  );
}
