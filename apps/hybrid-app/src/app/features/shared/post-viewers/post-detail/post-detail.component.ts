import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core'
import { DomSanitizer } from '@angular/platform-browser'
import { Router } from '@angular/router'
import { environment } from '@eview/core'
import { AuthHelpers } from '@eview/core/auth'
import { AllowedPriviledge } from '@eview/core/auth/auth'
import { Permission } from '@eview/core/auth/permission'
import {
  FormAttribute,
  FormAttributeInput,
  FormAttributes,
  FormAttributeType
} from '@eview/core/domain/form/form-attribute'
import { MediaService } from '@eview/core/domain/media/media.service'
import {
  Post,
  PostManagementLevel,
  PostPriority,
  PostStatus
} from '@eview/core/domain/post/post'
import { PostCommentType } from '@eview/core/domain/post/post-comment'
import { PostHelpers } from '@eview/core/domain/post/post.helpers'
import { PostService } from '@eview/core/domain/post/post.service'
import { Tags } from '@eview/core/domain/tags/tag'
import { selectFormAttributes } from '@eview/core/store/selectors/form-attributes.selector'
import { selectTags } from '@eview/core/store/selectors/tags.selector'
import { AppState } from '@eview/core/store/states/app.state'
import { Actions, ofType } from '@ngrx/effects'
import { Store } from '@ngrx/store'
import * as moment from 'moment'
import { FileSaverService } from 'ngx-filesaver'
import { combineLatest, Subscription, Observable } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { ECustomActions, ShowPostDetail } from '../../custom.store'
import { selectUsers } from '@eview/core/store/selectors/users.selector'
import { selectUser } from '@eview/core/store/selectors/user.selector'
import { User } from '@eview/core/models/user'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { PostEditorPageComponent } from '../../post-editor/post-editor/post-editor-page.component';
import { FormFields } from '@eview/core/domain/filters/filterCriteria';

const EDIT_PAGE_URI = '/dashboard/post/edit/:id'

@Component({
  selector: 'eview-post-detail',
  templateUrl: 'post-detail.component.html',
  styleUrls: ['post-detail.component.scss']
})
export class PostDetailComponent implements OnInit, OnDestroy {
  constructor (
    private store: Store<AppState>,
    private actions$: Actions,
    private mediaService: MediaService,
    private postService: PostService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private fileSaverService: FileSaverService,
    private modalService: NgbModal
  ) {
    this.subs = new Subscription()
  }

  ngOnInit () {
    this.subs.add(
      combineLatest(
        this.actions$.pipe(
          ofType<ShowPostDetail>(ECustomActions.ShowPostDetail)
        ),
        this.store.select(selectFormAttributes),
        this.store.select(selectTags)
      ).subscribe(([showPostDetailAction, formAttributes, tags]) => {
        this.formAttributes = formAttributes;
        if (!showPostDetailAction.payload) {
          this._post = null;
          this.post = null;
          return;
        }
        this._post = { ...showPostDetailAction.payload };
        this.postActivities$ = this.postService.getPostAudit(this._post.id);
        this.post = this.formatPost(
          showPostDetailAction.payload,
          formAttributes,
          tags
        );
      })
    )
    this.users$.subscribe(users => (this.users = users));
    this.user$.subscribe(user => (this.user = user));
  }

  ngOnDestroy () {
    this.subs.unsubscribe();
  }

  private _post: Post = null;
  post: PostEx = null;
  users: User[];
  user: User;

  users$: Observable<User[]> = this.store
    .select(selectUsers)
    .pipe(map(users => (users ? users.results : [])));

  user$: Observable<User> = this.store.select(selectUser);

  FormAttributeType = FormAttributeType;

  FormAttributeInput = FormAttributeInput;

  PostStatus = PostStatus;

  AllowedPriviledge = AllowedPriviledge;

  AuthHelpers = AuthHelpers;

  Permission = Permission;

  PostHelpers = PostHelpers;

  PostPriority = PostPriority;

  FormFields = FormFields;

  postActivities$: Observable<Audit>;

  format: string = environment.format.date;

  @Input() public hideLocationMap: boolean;

  @Output() public onDeleted: EventEmitter<void> = new EventEmitter();

  @Output() public onShowLinkedPostClick: EventEmitter<
    number
  > = new EventEmitter();
  @Output() public onLinkedPostClick: EventEmitter<Object> = new EventEmitter();
  @Output() public onClose: EventEmitter<any> = new EventEmitter();

  showDeleteConfirmation: boolean;

  private subs: Subscription;

  postStatuses = [
    PostStatus.Pending,
    PostStatus.Unverified,
    PostStatus.Verified,
    PostStatus.Responded,
    PostStatus.Evaluated
  ]

  postManagementLevels = [
    PostManagementLevel.Unknown,
    PostManagementLevel.Subregional,
    PostManagementLevel.Regional,
    PostManagementLevel.National
  ]

  PostCommentType = PostCommentType

  mediaUrls: any = {}

  formAttributes: FormAttributes;

  private formatPost (
    post: Post,
    formAttributes: FormAttributes,
    tags: Tags
  ): PostEx {
    const formatValues = (
      values: any,
      formAttributes: FormAttributes
    ): FormAttributeEx[] => {
      return Object.keys(values)
        .map(key => ({ key, value: values[key] }))
        .map(({ key, value }) => {
          if (!formAttributes) {
            return null;
          }
          const fa = {
            ...formAttributes.results.find(fa => fa.key === key),
            value
          }
          switch (fa.type) {
            case FormAttributeType.Tags:
              {
                fa.value = fa.value.map((v: string) =>
                  tags.results.find(t => t.id === parseInt(v))
                )
              }
              break

            case FormAttributeType.Int:
            case FormAttributeType.Decimal:
              {
                fa.value = fa.value.map(v => parseFloat(v).toString())
              }
              break

            case FormAttributeType.DateTime:
              {
                fa.value = fa.value.map(v => {
                  const time = moment
                    .utc(v)
                    .local()
                    .format(environment.format.time)
                  if (time === '00:00:00') {
                    return moment
                      .utc(v)
                      .local()
                      .format(environment.format.date)
                  }
                  return moment
                    .utc(v)
                    .local()
                    .format(environment.format.dateTimeWithoutSec)
                })
              }
              break

            case FormAttributeType.Media:
              {
                fa.value.forEach(
                  v =>
                    this.mediaService
                      .read(parseInt(v))
                      .pipe(map(media => media.original_file_url))
                      .subscribe(url => {
                        this.mediaUrls[
                          fa.key
                        ] = this.sanitizer.bypassSecurityTrustResourceUrl(url)
                      }),
                  this
                )
              }
              break
          }
          return fa
        })
    }
    const orderValues = (values: FormAttributeEx[]): FormAttributeEx[] => {
      return values.sort((fa0, fa1) =>
        fa0.priority === fa1.priority ? 0 : fa1.priority < fa0.priority ? 1 : -1
      )
    }
    return {
      ...post,
      values: orderValues(formatValues(post.values, formAttributes))
    }
  }

  private updatePost () {
    this._post.parent_id = this._post.parent ? this._post.parent.id : null
    this.postService.update(this._post).subscribe(post => {
      this._post = post
      this.store.dispatch({
        type: ECustomActions.UpdatedPost,
        payload: post
      })
      this.store.dispatch({
        type: ECustomActions.ShowPostDetail,
        payload: post
      })
    })
  }

  private updatePostStatusOnCmtSave (evt) {
    const commentType = evt.type;
     if (commentType === PostCommentType.Response) {
      //if response is saved
      const linkedPost = evt.linkedPost; //linkedPost
      //update parent post
      this.updatePostWithStatusChange(this._post, PostStatus.Responded);
      //update linked post
      this.updateLinkedPostWithStatusChange(linkedPost);
    }else{
      //if action report is saved
      //update action report
      this.updatePostWithStatusChange(this._post, PostStatus.Evaluated);
    }
  }

  private updateLinkedPostWithStatusChange (linkedPost) {
    linkedPost.status = PostStatus.Responded;
    this.postService.update(linkedPost).subscribe(linkedPost => {
      this.store.dispatch({
        type: ECustomActions.UpdatedPost,
        payload: linkedPost
      })
    })
  }

  private updatePostWithStatusChange (post, status) {
    post.status = status;
    this.postService.update(post).subscribe(post => {
      this._post = post;
      this.store.dispatch({
        type: ECustomActions.UpdatedPost,
        payload: post
      })
      this.store.dispatch({
        type: ECustomActions.ShowPostDetail,
        payload: post
      })
    })
  }

  onChangeStatusClick (status: PostStatus) {
    if (status === this._post.status) return
    this._post.status = status
    this.updatePost()
  }

  onChangeManagementLevelClick (mgmtLev: PostManagementLevel) {
    if (mgmtLev === this._post.mgmt_lev) return
    this._post.mgmt_lev = mgmtLev
    this.updatePost()
  }

  onChangePriorityClick () {
    this._post.priority =
      this._post.priority === PostPriority.Urgent
        ? PostPriority.Standard
        : PostPriority.Urgent
    this.updatePost()
  }

  onRefreshClick () {
    this.postService.read(this.post.id).subscribe(post => {
      this.store.dispatch({
        type: ECustomActions.UpdatedPost,
        payload: post
      })
      this.store.dispatch({
        type: ECustomActions.ShowPostDetail,
        payload: post
      })
    })
  }

  onEditClick() {
    const createIncidentModalRef = this.modalService.open(PostEditorPageComponent, {ariaLabelledBy: 'modal-basic-title', windowClass : "customModalWindowClass" });
    createIncidentModalRef.componentInstance.postId =  this.post.id.toString();
    createIncidentModalRef.componentInstance.formId =  this.post.form.id;
    createIncidentModalRef.componentInstance.modalCloseEvent.subscribe(($e) => {
      createIncidentModalRef.dismiss();
    });
  }

  onDeleteClick (content) {
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      centered: true
    })
  }

  onDeleteConfirmationClick () {
    this.modalService.dismissAll('delete')
    this.postService.delete(this.post).subscribe(
      result => {
        this.showDeleteConfirmation = false
        this.store.dispatch({
          type: ECustomActions.DeletedPost,
          payload: this.post
        })
      },
      $error => {
        console.log($error)
      }
    )
  }

  isStatusEnabled (status: PostStatus) {
    if (status === this.post.status) return true
    switch (status) {
      case PostStatus.Pending:
        return (
          this.post.status === PostStatus.Verified ||
          this.post.status === PostStatus.Unverified
        )
      case PostStatus.Unverified:
        return (
          this.post.status === PostStatus.Pending ||
          this.post.status === PostStatus.Verified
        )
      case PostStatus.Responded:
        return this.post.status === PostStatus.Verified
      case PostStatus.Evaluated:
        return this.post.status === PostStatus.Responded
      case PostStatus.Verified:
      default:
        return true
    }
  }

  onDownloadMediaClick (value: FormAttributeEx) {
    const url$ = this.mediaService
      .read(parseInt(value.value[0]))
      .pipe(
        map(media => media.original_file_url),
        switchMap(url =>
          this.mediaService
            .readContentAsBlob(url)
            .pipe(map(blob => ({ url, blob })))
        )
      )
      .subscribe(({ url, blob }) => {
        this.fileSaverService.save(blob, url.split('/').reverse()[0])
      })
  }

  onShowLinkedPost (parentId: number) {
    this.onShowLinkedPostClick.emit(parentId)
  }

  onLinkToPostClick (post: Post, flag: boolean) {
    this.onLinkedPostClick.emit({ post: post, flag: flag })
  }

  onPostDetailClose () {
    this.onClose.emit()
  }

  getValueByLabel(postValue: any, label: string) {
    let fieldValue;
    const searchField = this.formAttributes.results.filter(fa => fa.type === FormAttributeType.Int);
    if (searchField && searchField.length > 0) {
      const attrKey = searchField[0].key;
      fieldValue = (postValue && postValue[attrKey]) ? postValue[attrKey][0] : 0;
    }
    return fieldValue;
  };
}

interface FormAttributeEx extends FormAttribute {
  value: any
}

interface PostEx extends Post {
  values: FormAttributeEx[]
}

interface Audit {
  created: string
  entity: string
  id: number
  type: string
  user_id: number
  value: string
}
