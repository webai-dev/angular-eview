import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { environment } from '@eview/core';
import { Notification } from '@eview/core/domain/notifications/notification';
import { NotificationHelpers } from '@eview/core/domain/notifications/notification.helpers';
import { ReadNotifications } from '@eview/core/store/actions/notifications.actions';
import {
  selectLastReadId,
  selectNotifications
} from '@eview/core/store/selectors/notifications.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'eview-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  notifications$: Observable<Notification[]> = this.store
    .select(selectNotifications)
    .pipe(map(notifications => (notifications ? notifications.results : [])));

  lastReadId$: Observable<number> = this.store.select(selectLastReadId);

  notifications: Notification[] = [];

  lastReadId: number;

  NotificationHelpers = NotificationHelpers;

  format = environment.format;

  constructor(private store: Store<AppState>, private actions$: Actions) {}

  ngOnInit() {
    this.notifications$.subscribe(
      notifications => (this.notifications = notifications)
    );
    this.lastReadId$.subscribe(lastReadId => (this.lastReadId = lastReadId));
  }

  ngOnDestroy() {}

  @HostListener('touchstart')
  @HostListener('mouseenter')
  onReading() {
    if (!this.notifications || this.notifications.length === 0) {
      return;
    }
    if (this.lastReadId === this.notifications[0].id) {
      return;
    }
    this.store.dispatch(
      new ReadNotifications({ lastReadId: this.notifications[0].id })
    );
  }

  isUnread(notification: Notification): boolean {
    return notification.id > this.lastReadId;
  }
}
