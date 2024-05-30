import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '@eview/core';
import { AuthHelpers } from '@eview/core/auth';
import { AllowedPriviledge } from '@eview/core/auth/auth';
import {
  FormAttribute,
  FormAttributeInput,
  FormAttributes,
  FormAttributeType
} from '@eview/core/domain/form/form-attribute';
import { FormService } from '@eview/core/domain/form/form.service';
import { MediaService } from '@eview/core/domain/media/media.service';
import { Post, PostStatus } from '@eview/core/domain/post/post';
import { PostService } from '@eview/core/domain/post/post.service';
import { Tags } from '@eview/core/domain/tags/tag';
import { selectFormAttributes } from '@eview/core/store/selectors/form-attributes.selector';
import { selectTags } from '@eview/core/store/selectors/tags.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import * as moment from 'moment';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { ECustomActions, ShowPostDetail } from '../custom.store';

const EDIT_PAGE_URI = '/dashboard/post/edit/:id';

@Component({
  selector: 'eview-post-detail',
  templateUrl: 'post-detail.component.html',
  styleUrls: ['post-detail.component.scss']
})
export class PostDetailComponent implements OnInit {
  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private mediaService: MediaService,
    private postService: PostService,
    private router: Router
  ) {}

  ngOnInit() {
    combineLatest(
      this.actions$.pipe(ofType<ShowPostDetail>(ECustomActions.ShowPostDetail)),
      this.store.select(selectFormAttributes),
      this.store.select(selectTags)
    ).subscribe(([showPostDetailAction, formAttributes, tags]) => {
      if (!showPostDetailAction.payload) {
        this._post = null;
        this.post = null;
        return;
      }
      this._post = { ...showPostDetailAction.payload };
      this.post = this.formatPost(
        showPostDetailAction.payload,
        formAttributes,
        tags
      );
    });
  }

  private _post: Post = null;
  public post: PostEx = null;

  public FormAttributeType = FormAttributeType;

  public FormAttributeInput = FormAttributeInput;

  public PostStatus = PostStatus;

  public AllowedPriviledge = AllowedPriviledge;

  public AuthHelpers = AuthHelpers;

  @Input() public hideLocationMap: boolean;

  @Output() public onDeleted: EventEmitter<void> = new EventEmitter();

  public showDeleteConfirmation: boolean;

  private formatPost(
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
          const fa = {
            ...formAttributes.results.find(fa => fa.key === key),
            value
          };
          switch (fa.type) {
            case FormAttributeType.Tags:
              {
                fa.value = fa.value.map((v: string) =>
                  tags.results.find(t => t.id === parseInt(v))
                );
              }
              break;

            case FormAttributeType.Int:
            case FormAttributeType.Decimal:
              {
                fa.value = fa.value.map(v => parseFloat(v).toString());
              }
              break;

            case FormAttributeType.DateTime:
              {
                const format =
                  fa.input === FormAttributeInput.Date
                    ? environment.format.date
                    : environment.format.dateTime;
                fa.value = fa.value.map(v =>
                  moment
                    .utc(v)
                    .local()
                    .format(format)
                );
              }
              break;

            case FormAttributeType.Media:
              {
                fa.value = fa.value.map(v =>
                  this.mediaService
                    .read(parseInt(v))
                    .pipe(map(media => media.original_file_url))
                );
              }
              break;
          }
          return fa;
        });
    };
    const orderValues = (values: FormAttributeEx[]): FormAttributeEx[] => {
      return values.sort((fa0, fa1) =>
        fa0.priority === fa1.priority ? 0 : fa1.priority < fa0.priority ? 1 : -1
      );
    };
    return {
      ...post,
      values: orderValues(formatValues(post.values, formAttributes))
    };
  }

  private updatePost() {
    this.postService.update(this._post).subscribe(post => {
      this._post = post;
      this.store.dispatch({
        type: ECustomActions.UpdatedPost,
        payload: post
      });
      this.store.dispatch({
        type: ECustomActions.ShowPostDetail,
        payload: post
      });
    });
  }

  public onChangeStatusClick() {
    this._post.status =
      this._post.status === PostStatus.Verified
        ? PostStatus.Pending
        : PostStatus.Verified;
    this.updatePost();
  }

  public onEditClick() {
    this.router.navigateByUrl(
      EDIT_PAGE_URI.replace(':id', this.post.id.toString())
    );
  }

  public onDeleteClick() {
    this.showDeleteConfirmation = true;
  }

  public onDeleteConfirmationClick() {
    this.postService.delete(this.post).subscribe(() => {
      this.showDeleteConfirmation = false;
      this.onDeleted.emit();
      this.store.dispatch({
        type: ECustomActions.DeletedPost,
        payload: this.post
      });
    });
  }
}

interface FormAttributeEx extends FormAttribute {
  value: any;
}

interface PostEx extends Post {
  values: FormAttributeEx[];
}
