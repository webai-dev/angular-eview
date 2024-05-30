import { Injector, OnInit, OnDestroy, Input } from '@angular/core';
import { BaseComponent, environment } from '@eview/core';
import { AuthHelpers } from '@eview/core/auth';
import { AllowedPriviledge } from '@eview/core/auth/auth';
import { BaseModelArray } from '@eview/core/base/base-model';
import {
  FormAttribute,
  FormAttributeInput,
  FormAttributeType
} from '@eview/core/domain/form/form-attribute';
import { FormValue } from '@eview/core/domain/form/form-value';
import { FormHelpers } from '@eview/core/domain/form/form.helpers';
import { FormService } from '@eview/core/domain/form/form.service';
import { Media } from '@eview/core/domain/media/media';
import { MediaService } from '@eview/core/domain/media/media.service';
import { Post, PostPriority, PostStatus } from '@eview/core/domain/post/post';
import { PostHelpers } from '@eview/core/domain/post/post.helpers';
import { PostService } from '@eview/core/domain/post/post.service';
import { User } from '@eview/core/models/user';
import {
  EMapActions,
  UserClickedMap
} from '@eview/core/store/actions/map.actions';
import {
  SubmitPostFailure,
  SubmitPostSuccess
} from '@eview/core/store/actions/posts.actions';
import { selectFormAttributes } from '@eview/core/store/selectors/form-attributes.selector';
import { selectUsers } from '@eview/core/store/selectors/users.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { UsersHelpers } from '@eview/core/users/users.helpers';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { combineLatest, forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { selectMap } from '@eview/core/store/selectors/map.selector';

export class PostEditorBaseComponent extends BaseComponent
  implements OnInit, OnDestroy {
  @Input() public postId : any;
  formId: number = environment.form.id;
  constructor(public injector: Injector, private id: number) {
    super();
    this.store = injector.get(Store) as Store<AppState>;
    this.actions$ = injector.get(Actions) as Actions;
    this.formService = injector.get(FormService);
    this.mediaService = injector.get(MediaService);
    this.postService = injector.get(PostService);

    this.subs = new Subscription();
  }

  ngOnInit() {
    //when postId is passed on edit
    if (this.postId){
      this.id = this.postId;
    }
    this.user$ = this.store
      .select(selectUsers)
      .pipe(map(users => UsersHelpers.FindUserById(users, this.post.user.id)));

    combineLatest(
      this.store.select(selectFormAttributes).pipe(
        map(fas => {
          fas.results = fas.results.map(fa => ({
            ...fa,
            value: null
          })) as FormAttribute[];
          fas = FormHelpers.SortFormAttributes(fas);
          return fas as FormAttributesEx;
        })
      ),
      this.id ? this.postService.read(this.id) : of(null)
    ).subscribe(([fas, post]) => {
      this.isEditing = !!post;
      if (this.isEditing) this.post = post;
      else
        this.store.select(selectMap).subscribe(map => {
          this.post = {
            ...this.post,
            ...PostHelpers.ParseMgmtLevels(map.actual)
          };
        });
      this.formAttributesEx = this.bindPostValues(post, fas);
    });

    this.subs.add(
      this.actions$
        .pipe(ofType<UserClickedMap>(EMapActions.UserClickedMap))
        .subscribe(action => {
          if (
            !action ||
            !action.payload ||
            !action.payload.actual ||
            !action.payload.actual.properties
          )
            return;
          this.post = {
            ...this.post,
            ...PostHelpers.ParseMgmtLevels(action.payload.actual)
          };
        })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  store: Store<AppState>;
  actions$: Actions;
  formService: FormService;
  mediaService: MediaService;
  postService: PostService;

  formAttributesEx: FormAttributesEx;

  isEditing: boolean = false;
  post$: Observable<Post> = of(null);
  post: Post;

  PostHelpers = PostHelpers;
  UsersHelpers = UsersHelpers;
  AuthHelpers = AuthHelpers;
  AllowedPriviledge = AllowedPriviledge;
  PostStatus = PostStatus;
  PostPriority = PostPriority;

  format = environment.format;

  user$: Observable<User>;

  private subs: Subscription;

  get managementLevels() {
    return PostHelpers.FormatMgmtLevels(this.post);
  }

  isFormInvalid(): boolean {
    let isValidFlag = (
      this.formAttributesEx.results.filter(fa => {
          if ((fa.required && !fa.value)) {
            return true;
          }
          if (fa.input === FormAttributeInput.Location && (fa.value && fa.value[0].lat === null )) {
            return true;
          }
        }
      ).length > 0
    );

    return isValidFlag;
  }

  private getFormValue(formAttributesEx: FormAttributesEx): FormValue {
    const getFormAttributeByType = (
      formAttributes: FormAttributesEx,
      type: FormAttributeType
    ) =>
      formAttributes && formAttributes.results
        ? formAttributes.results.find(fa => fa.type === type)
        : null;
    const getValuesFromFormAttributes = (formAttributes: FormAttributesEx) =>
      formAttributes.results
        .filter(
          fa =>
            fa.type !== FormAttributeType.Title &&
            fa.type !== FormAttributeType.Content &&
            fa.value
        )
        .map(fa => ({ [fa.key]: fa.value }));
    const values = getValuesFromFormAttributes(formAttributesEx);
    let title = getFormAttributeByType(formAttributesEx, FormAttributeType.Title);
    let content = getFormAttributeByType(formAttributesEx, FormAttributeType.Content);
    return {
      title: title ? title.value : null,
      content: content ? content.value : null,
      values:
        values && values.length > 0
          ? values.reduce((values, value) => ({ ...values, ...value }))
          : {},
      form: { id: this.formId }
    };
  }

  private bindPostValues(
    post: Post,
    formAttributes: FormAttributesEx
  ): FormAttributesEx {
    if (!post) return formAttributes;
    const fas = { ...formAttributes };
    if (!(fas && fas.results)) {
      return null;
    }
    fas.results.find(fa => fa.type === FormAttributeType.Title).value =
      post.title;
    fas.results.find(fa => fa.type === FormAttributeType.Content).value =
      post.content;
    fas.results = fas.results.map(fa => {
      if (
        fa.type !== FormAttributeType.Title &&
        fa.type !== FormAttributeType.Content
      ) {
        fa.value = post.values[fa.key];
      }
      return fa;
    });
    return fas;
  }

  private handleMedias(
    formAttributesEx: FormAttributesEx
  ): Observable<MediaEx>[] | Observable<null> {
    const value = this.getFormValue(formAttributesEx);
    const medias = Object.keys(value.values)
      .map(key => ({ key, value: value.values[key] }))
      .filter(m => m.value.name && m.value.lastModified);
    if (!medias || medias.length === 0) return of(null);
    return medias.map(m =>
      this.mediaService
        .attach(m.value)
        .pipe(map(media => ({ ...media, key: m.key })))
    );
  }

  onFormSelectedChange(formId: number) {
    this.formId = formId;
  }

  onSubmitClick() {
    forkJoin(this.handleMedias(this.formAttributesEx))
      .pipe(
        switchMap(results => {
          const value = this.getFormValue(this.formAttributesEx);
          const medias = results as MediaEx[];
          if (medias[0]) {
            medias.forEach(m => {
              value.values[m.key] = [m.id];
            });
          }
          if (this.isEditing) {
            this.post.title = value.title;
            this.post.content = value.content;
            this.post.values = value.values;
            this.post.parent_id = (this.post.parent) ? this.post.parent.id : null;
            return this.postService.update(this.post);
          }
          const { mgmt_lev_1, mgmt_lev_2, mgmt_lev_3 } = this.post;
          return this.postService.create({
            ...value,
            mgmt_lev_1,
            mgmt_lev_2,
            mgmt_lev_3
          });
        }),
        catchError(() => of(null))
      )
      .subscribe((post: Post) => {
        if (post) {
          post['isEditing'] = this.isEditing;
        }
        this.store.dispatch(
          post ? new SubmitPostSuccess(post) : new SubmitPostFailure()
        );
      });
  }
}

export interface FormAttributeEx extends FormAttribute {
  value: any;
}

export interface FormAttributesEx extends BaseModelArray<FormAttributeEx> {}

export interface MediaEx extends Media {
  key: string;
}
