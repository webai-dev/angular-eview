import { Component, Input } from '@angular/core';
import { PostHelpers } from '@eview/core/domain/post/post.helpers';
import { Post, PostStatus } from '@eview/core/domain/post/post';
import { UsersHelpers } from '@eview/core/users/users.helpers';
import { environment } from '@eview/core';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import { selectUsers } from '@eview/core/store/selectors/users.selector';
import { map } from 'rxjs/operators';

@Component({
  selector: 'eview-post-subtitle',
  template: `
    <h6 class="card-subtitle mb-2 text-muted">
      <span> {{ 'POST_ID' | translate }} {{ post.id }} </span>
      <span>
        <fa-icon [icon]="'inbox'"></fa-icon>
        {{ PostHelpers.FormatSource(post) | translate }}</span
      >
      <span>
        <fa-icon [icon]="'calendar'"></fa-icon>
        {{ PostHelpers.FormatDate(post, 'created', format.dateTime) }}</span
      >
    </h6>
    <h6 class="card-subtitle mb-2 text-muted">
      <span>
        <fa-icon [icon]="'user-circle'"></fa-icon>
        {{ UsersHelpers.FormatUserRealname(user$ | async) || '?' }}</span
      >
      <span
        class="badge"
        [class.badge-primary]="post.status === PostStatus.Published"
        [class.badge-warning]="post.status === PostStatus.Draft"
        >{{ PostHelpers.FormatStatus(post) | translate }}</span
      >
    </h6>
  `,
  styleUrls: ['post-subtitle.component.scss']
})
export class PostSubtitleComponent {
  constructor(private store: Store<AppState>) {}

  @Input() post: Post;

  public PostHelpers = PostHelpers;

  public UsersHelpers = UsersHelpers;

  public PostStatus = PostStatus;

  public format = environment.format;

  public user$ = this.store
    .select(selectUsers)
    .pipe(map(users => UsersHelpers.FindUserById(users, this.post.user.id)));
}
