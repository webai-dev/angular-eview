import { BaseModel, BaseModelPagedArray } from '@eview/core/base/base-model';
import { User } from '@eview/core/models/user';
import { Post } from '../post/post';

export interface Notification extends BaseModel {
  id: number;
  user: User;
  post: Post;
  event_type: NotificationType;
  created: Date;
}

export enum NotificationType {
  Create = 'create',
  Update = 'update',
  Response = 'response',
  Afteraction = 'after-action'
}

export interface Notifications extends BaseModelPagedArray<Notification> {}
