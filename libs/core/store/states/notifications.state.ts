import { Notifications } from '@eview/core/domain/notifications/notification';

export interface NotificationsState {
  notifications: Notifications;
  lastReadId: number;
  unreadNotifications: boolean;
}

export const initialNotificationsState: NotificationsState = {
  notifications: null,
  lastReadId: null,
  unreadNotifications: false
};
