import { Component, Input, OnInit ,Output, EventEmitter } from '@angular/core';
import { environment } from '@eview/core';
import {
  PostComment,
  PostCommentUser,
  PostCommentType,
  LinkPost
} from '@eview/core/domain/post/post-comment';
import { PostCommentHelpers } from '@eview/core/domain/post/post-comment.helpers';
import { PostService } from '@eview/core/domain/post/post.service';
import { User, Users, Contacts, ListUserOptions } from '@eview/core/models/user';
import { selectUsers } from '@eview/core/store/selectors/users.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import { UserClickedCommentMap } from '@eview/core/store/actions/map.actions';
import { cloneDeep, find } from 'lodash';
import { Observable, BehaviorSubject, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreatedPostComment } from '../../custom.store';
import {
  Post,
  PostStatus
} from '@eview/core/domain/post/post';
import { ECustomActions } from '../../custom.store';
import { UserService } from '@eview/core/users/user.service';
import { OrderSort } from '@eview/core/models/commons';

const ROLE_PRO_USER: string = 'prouser';
@Component({
  selector: 'eview-post-comment',
  templateUrl: 'post-comment.component.html',
  styleUrls: ['post-comment.component.scss']
})
export class PostCommentComponent implements OnInit {
  
  @Output() postStatusChange = new EventEmitter();
  listOption: ListUserOptions;
  subs: Subscription;

  proUsers: Users;
 
  constructor(
    private store: Store<AppState>,
    private postService: PostService,
    private userService: UserService
  ) {
      this.subs = new Subscription();
  }

  ngOnInit() {
    this.fetchListOfProUsers(); //fetch list of pro users
    this.comment.users = this.comment.users || [];
    this._comment = cloneDeep(this.comment);
    this.isEditing = !this.comment.id;
  }

  fetchListOfProUsers() {
    this.listOption = {
      orderby: 'realname',
      role: ROLE_PRO_USER,
      order: OrderSort.Asc
    }; 
    this.subs.add(
      this.userService.list(this.listOption).subscribe((data) => {
        this.proUsers = data;
      })
    );
  }

  @Input() public comment: PostComment;
  @Input() public isParent: boolean;
  @Input() public user: User;
  private _comment: PostComment;

  PostCommentHelpers = PostCommentHelpers;

  format = environment.format;

  availableUsers$: Observable<User[]> = this.store
    .select(selectUsers)
    .pipe(map(users => (users)? users.results.filter(u => u.role === ROLE_PRO_USER): []));

  isEditing: boolean;

  openModal = new BehaviorSubject({flag: false, postId: 0});

  selectedUser: User;

  prouserRole = ROLE_PRO_USER;

  PostCommentType = PostCommentType;

  linkedPost: Post = null;

  onActionTakenClick() {
    setTimeout(() => {
      if (!this.comment.action_taken && !this.comment.no_action_taken) return;
      this.comment.no_action_taken = !this.comment.action_taken;
    });
  }

  onNoActionTakenClick() {
    setTimeout(() => {
      if (!this.comment.action_taken && !this.comment.no_action_taken) return;
      this.comment.action_taken = !this.comment.no_action_taken;
    });
  }

  prepareAvailableUsers(availableUsers: User[]): User[] {
    return availableUsers.filter(
      u => !this.comment.users.some(u1 => +u1.id === +u.id)
    );
  }

  onUserDelete(user: PostCommentUser) {
    this.comment.users = this.comment.users.filter(u => u.id !== user.id);
  }

  onUserAdd() {
    if (!this.selectedUser || typeof this.selectedUser !== 'object') return;
    this.comment.users = [...this.comment.users, this.selectedUser];
    this.selectedUser = null;
  }

  onCancelClick() {
    this.comment = cloneDeep(this._comment);
    this.isEditing = false;
    if (!this.comment.id) this.comment = null;
  }

  onSaveClick() {
    const obs = this.comment.id
      ? this.postService.updateComment(this.comment)
      : this.postService.createComment(this.comment);
    obs.subscribe(comment => {
      if (!this.comment.id)
        this.store.dispatch(new CreatedPostComment(comment));

      this.comment = comment;
      this._comment = cloneDeep(this.comment);
      this.isEditing = false;

      //emit event to post-detail component to change post status
      this.postStatusChange.emit({'linkedPost':this.linkedPost, 'type': this.comment.type});

    });
  }


  onRemoveClick(data: LinkPost) {
    this.comment.linked_reports = this.comment.linked_reports.filter((item) => {
      return item.id !== data.id;
    });
  }

  onPostClick(item) {
    this.store.dispatch(
      new UserClickedCommentMap(
        item.id
      )
    );
  }

  onAddClick() {
    this.openModal.next({flag: true, postId: 0});
  }

  onCloseClick() {
    this.openModal.next({flag: false, postId: 0});
  }

  onApplyClick(data) {
    this.linkedPost = cloneDeep(data.post);//save linked post
    if (data) {
      const isExist = find(this.comment.linked_reports, function(o) { return o.id == data.post.id; });
      if (!isExist) {
        const obj = {
          id: data.post.id,
          name: data.post.title
        }
        this.comment.linked_reports.push(obj);
      }
    }
    this.openModal.next({flag: false, postId: 0});
  }
  
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}
