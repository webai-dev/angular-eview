import { Component, Input, Output, EventEmitter } from '@angular/core';
import { PostHelpers } from '@eview/core/domain/post/post.helpers';
import { Post, PostStatus, PostPriority } from '@eview/core/domain/post/post';
import { UsersHelpers } from '@eview/core/users/users.helpers';
import { environment } from '@eview/core';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import { selectUsers } from '@eview/core/store/selectors/users.selector';
import { map } from 'rxjs/operators';

@Component({
  selector: 'eview-post-subtitle',
  templateUrl: 'post-subtitle.component.html',
  styleUrls: ['post-subtitle.component.scss']
})
export class PostSubtitleComponent {
  constructor(private store: Store<AppState>) {}

  @Input() post: Post;
  @Input() disableLinkPost: Boolean;
  @Output() public onShowLinkedPostClick: EventEmitter<Object> = new EventEmitter();

  PostHelpers = PostHelpers;

  UsersHelpers = UsersHelpers;

  PostStatus = PostStatus;

  PostPriority = PostPriority;

  format = environment.format;

  user$ = this.store
    .select(selectUsers)
    .pipe(
      map(users =>
        this.post.user && this.post.user.id
          ? UsersHelpers.FindUserById(users, this.post.user.id)
          : null
      )
    );

  get managementLevels() {
    return PostHelpers.FormatMgmtLevels(this.post);
  }

  onShowLinkedClick(post: Post) {
    //event.stopPropagation();
    this.onShowLinkedPostClick.emit({id : post.id, title: post.title});
  }

}
