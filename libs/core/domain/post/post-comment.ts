import { BaseModel, BaseModelArray } from '@eview/core/base/base-model';

import { User } from '@eview/core/models/user';

export interface PostComment extends BaseModel {
  id: number;
  post_id: number;
  content: string;
  action_taken: boolean;
  no_action_taken: boolean;
  status: PostCommentStatus;
  user: User;
  parent_id: number;
  created: Date;
  updated: Date;
  type: PostCommentType;
  users?: PostCommentUser[];
  linked_reports?: LinkPost[];
}

export interface PostComments extends BaseModelArray<PostComment> {}

export enum PostCommentStatus {
  Pending = 'pending',
  Published = 'published'
}

export interface PostCommentUser {
  id: number;
  realname?: string;
}

export interface LinkPost {
  id: number;
  name: string;
}

export enum PostCommentType {
  Response = 0,
  AfterActionReport = 1
}
