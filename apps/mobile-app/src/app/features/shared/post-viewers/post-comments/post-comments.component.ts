import { Component, Input, Output, OnChanges, OnDestroy, OnInit, EventEmitter } from '@angular/core';
import { Post } from '@eview/core/domain/post/post';
import {
  PostComment,
  PostComments,
  PostCommentType
} from '@eview/core/domain/post/post-comment';
import { PostService } from '@eview/core/domain/post/post.service';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { CreatedPostComment, ECustomActions } from '../../custom.store';
import { User } from '@eview/core/models/user';

const ROLE_PRO_USER: string = 'prouser';

@Component({
  selector: 'eview-post-comments',
  templateUrl: 'post-comments.component.html',
  styleUrls: ['post-comments.component.scss']
})
export class PostCommentsComponent implements OnInit, OnChanges, OnDestroy {

  @Input() private post: Post;

  @Input() private type: PostCommentType;

  @Input() user: User;

  @Output() postStatusChangeOnSaveCommt = new EventEmitter();

  private ROLE_PRO_USER = ROLE_PRO_USER;

  comments: PostComments;

  private subs: Subscription;

  constructor(
    private store: Store<AppState>,
    private action$: Actions,
    private postService: PostService
  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.load();
    this.subs.add(
      this.action$
        .pipe(ofType<CreatedPostComment>(ECustomActions.CreatedPostComment))
        .subscribe(action => {
          this.load();
        })
    );
  }

  ngOnChanges() {
    this.load();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  get label(): string {
    switch (this.type) {
      case PostCommentType.Response:
        return 'POST_COMMENT_RESPONSES';
      case PostCommentType.AfterActionReport:
        return 'POST_COMMENT_AFTER_ACTION_REPORT';
    }
    return null;
  }

  load() {
    this.postService
      .listComments(
        this.post.parent ? this.post.parent.id : this.post.id,
        this.type
      )
      .subscribe(comments => (this.comments = comments));
  }

  onAddClick() {
    this.comments.results = [
      {
        id: 0,
        post_id: this.post.id,
        content: null,
        action_taken: false,
        type: this.type,
        linked_reports: []
      } as PostComment,
      ...this.comments.results
    ];
  }

  onRefreshClick() {
    this.load();
  }

  updatePostStatusOnComment(evt) {
    this.postStatusChangeOnSaveCommt.emit(evt);
  }
}
