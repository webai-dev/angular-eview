import { Post } from '@eview/core/domain/post/post';
import { PostComment } from '@eview/core/domain/post/post-comment';
import { Action } from '@ngrx/store';

export enum ECustomActions {
  ShowPostDetail = '[Custom.ShowPostDetail] Show Post detail',
  UpdatedPost = '[Custom.UpdatedPost] Updated Post',
  DeletedPost = '[Custom.DeletedPost] Deleted Post',
  CreatedPostComment = '[Custom.CreatedPostComment] Created Post Comment'
}

export class ShowPostDetail implements Action {
  readonly type = ECustomActions.ShowPostDetail;
  constructor(public payload: Post) {}
}

export class UpdatedPost implements Action {
  readonly type = ECustomActions.UpdatedPost;
  constructor(public payload: Post) {}
}

export class DeletedPost implements Action {
  readonly type = ECustomActions.UpdatedPost;
  constructor(public payload: Post) {}
}

export class CreatedPostComment implements Action {
  readonly type = ECustomActions.CreatedPostComment;
  constructor(public payload: PostComment) {}
}
