import { Notification, NotificationType } from './notification';
import { User } from '@eview/core/models/user';
import * as moment from 'moment';

const FormatUser = (notification: Notification, users: User[]): string => {
  const user = users ? users.find(u => u.id === notification.user.id) : null;
  return user ? user.realname : 'Unknown';
};

const FormatVerb = (notification: Notification): string => {
  switch (notification.event_type) {
    case NotificationType.Create:
      return 'NEW_REPORT_TITLE';
    case NotificationType.Update:
      return 'UPDATE_REPORT_TITLE';
    case NotificationType.Response:
      return 'RESPONDED_REPORT';
    case NotificationType.Afteraction:
      return 'AFTER_ACTION_REPORT';
  }
};

const FormatPostTitle = (notification: Notification): string =>
  `'${notification.post.title}'`;

const FormatDate = (notification: Notification, format: string) =>
  moment(notification.created).format(format);

export const NotificationHelpers = {
  FormatUser,
  FormatVerb,
  FormatPostTitle,
  FormatDate
};
