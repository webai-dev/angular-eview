import { Component, Input, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Post, PostPriority } from '@eview/core/domain/post/post';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ECustomActions,
  ShowPostDetail,
  UpdatedPost
} from '../../custom.store';
import { FormFields } from '@eview/core/domain/filters/filterCriteria';
import { FormAttributes, FormAttributeType } from '@eview/core/domain/form/form-attribute';
import { selectFormAttributes } from '@eview/core/store/selectors/form-attributes.selector';

@Component({
  selector: 'eview-post',
  templateUrl: 'post.component.html',
  styleUrls: ['post.component.scss']
})
export class PostComponent implements OnInit, OnDestroy {

  formAttributes: FormAttributes;
  constructor(private store: Store<AppState>, private actions$: Actions) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.subs.add(
      this.actions$
        .pipe(ofType<UpdatedPost>(ECustomActions.UpdatedPost))
        .subscribe(action => {
          this.post =
            action.payload.id === this.post.id ? action.payload : this.post;
        })
    );

    this.store
      .select(selectFormAttributes)
      .subscribe(
        formAttributes =>
          (this.formAttributes = formAttributes)
      );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  @Input() public post: Post;
  @Output() public onShowLinkedPostClick: EventEmitter<Object> = new EventEmitter();

  PostPriority = PostPriority;

  FormFields = FormFields;

  activePostId$: Observable<number> = this.actions$.pipe(
    ofType<ShowPostDetail>(ECustomActions.ShowPostDetail),
    map(action => (action.payload ? action.payload.id : null))
  );

  active$: Observable<boolean> = this.activePostId$.pipe(
    map(id => id === this.post.id)
  );

  private subs: Subscription;

  onClick() {
    this.store.dispatch({
      type: ECustomActions.ShowPostDetail,
      payload: this.post
    });
  }

  onShowLinkedClick(post: Post) {
    event.stopPropagation();
    this.onShowLinkedPostClick.emit({id : post.id, title: post.title});
  }

  getValueByLabel(postValue: Object, label: string) {
    let value = 0;
    const searchField = this.formAttributes.results.filter(fa => fa.type === FormAttributeType.Int);
    if (searchField && searchField.length > 0) {
      const attrKey = searchField[0].key;
      value = (postValue && postValue[attrKey]) ? postValue[attrKey][0] : 0;
    }
    return value;
  };
}
