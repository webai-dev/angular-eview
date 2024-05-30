import { Component, OnInit, OnDestroy } from '@angular/core';
import { BaseComponent } from '@eview/core';
import {
  TagHelpers,
  TagWithChildren
} from '@eview/core/domain/tags/tag.helpers';
import { ListTags } from '@eview/core/store/actions/tags.actions';
import { selectTags } from '@eview/core/store/selectors/tags.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { TagDeleted, ETagEditorActions } from './tag-editor.component';
import { Router, ActivationStart } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'eview-tags-page',
  templateUrl: 'tags-page.component.html',
  styleUrls: ['tags-page.component.scss']
})
export class TagsPageComponent extends BaseComponent
  implements OnInit, OnDestroy {
  constructor(
    private store: Store<AppState>,
    private actions$: Actions,
    private router: Router
  ) {
    super();

    this.subs = new Subscription();
  }

  ngOnInit() {
    this.store.dispatch(new ListTags());
    this.store.select(selectTags).subscribe(tags => {
      this.tags = TagHelpers.ProcessForRendering(tags);
    });

    this.subs.add(
      this.actions$
        .pipe(ofType<TagDeleted>(ETagEditorActions.Deleted))
        .subscribe(action => {
          this.tags = this.tags.filter(t => t.id !== +action.payload);
        })
    );

    this.subs.add(
      this.router.events.subscribe(event => {
        if (!(event instanceof ActivationStart)) return;
        this.store.dispatch(new ListTags());
      })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  tags: TagWithChildren[];

  get isAdding(): boolean {
    return this.tags.some(t => !t.id);
  }

  private subs: Subscription;

  onAddClick() {
    this.tags.push({ id: 0, tag: null, type: 'category', children: [] });
  }

  onRefreshClick() {
    this.store.dispatch(new ListTags());
  }
}
