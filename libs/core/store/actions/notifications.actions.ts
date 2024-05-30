import { Action } from '@ngrx/store';
import { Notifications } from '@eview/core/domain/notifications/notification';

export enum ENotificationsActions {
  StartNotifications = '[Notifications] Start',
  StopNotifications = '[Notifications] Stop',
  ListNotifications = '[Notifications] List',
  ListNotificationsSuccess = '[Notifications] List success',
  ListNotificationsFailure = '[Notifications] List failure',
  ReadNotifications = '[Notifications] Read',
  ReadNotificationsSaved = '[Notifications] Read saved',
}

export class StartNotifications implements Action {
  readonly type = ENotificationsActions.StartNotifications;
}

export class StopNotifications implements Action {
  readonly type = ENotificationsActions.StopNotifications;
}

export class ListNotifications implements Action {
  readonly type = ENotificationsActions.ListNotifications;
}

export class ListNotificationsSuccess implements Action {
  readonly type = ENotificationsActions.ListNotificationsSuccess;
  constructor(public payload: Notifications) {}
}

export class ListNotificationsFailure implements Action {
  readonly type = ENotificationsActions.ListNotificationsFailure;
}

export class ReadNotifications implements Action {
  readonly type = ENotificationsActions.ReadNotifications;
  constructor(public payload: { lastReadId: number }) {}
}

export class ReadNotificationsSaved implements Action {
  readonly type = ENotificationsActions.ReadNotificationsSaved;
  constructor(public payload: { lastReadId: number }) {}
}

export type NotificationsActions =
  | StartNotifications
  | StopNotifications
  | ListNotifications
  | ListNotificationsSuccess
  | ListNotificationsFailure
  | ReadNotifications
  | ReadNotificationsSaved

