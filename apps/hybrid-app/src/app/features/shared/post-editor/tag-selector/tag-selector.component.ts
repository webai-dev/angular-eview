import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  TagHelpers,
  TagWithChildren
} from '@eview/core/domain/tags/tag.helpers';
import { Actions, ofType } from '@ngrx/effects';
import { Action, Store } from '@ngrx/store';
import { Subscription } from 'rxjs';

@Component({
  selector: 'eview-tag-selector',
  templateUrl: 'tag-selector.component.html',
  styleUrls: ['tag-selector.component.scss']
})
export class TagSelectorComponent implements OnInit, OnDestroy, OnChanges {
  constructor(
    private store: Store<TagSelectorState>,
    private actions$: Actions
  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.subs.add(
      this.actions$
        .pipe(ofType<TagSelectorSetById>(ETagSelectorActions.SetById))
        .subscribe(action => {
          const id = +action.payload;
          this.tag = this.nestedTags.find(t => t.id === id);
          if (!this.tag && id !== 0) {
            this.tag = this.nestedTags.find(t => {
              let tagId = TagHelpers.FlatifyChildren(this.nestedTags).find(t =>
                (t.children as number[]).includes(id)
              );
              return t.id === (tagId && tagId.id);
            });
            this.subs.unsubscribe();
            setTimeout(() => {
              this.store.dispatch(new TagSelectorSetById(id));
            });
          }
        })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.tag = null;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.tag && !this.nestedTags.includes(this.tag)) {
      this.tag = null;
      this.store.dispatch(new TagSelectorChange(this.tag));
    }
  }

  @Input() public nestedTags: TagWithChildren[];
  @Input() public isFilter: boolean;

  tag: TagWithChildren;

  private subs: Subscription;

  onChange() {
    if (this.tag && this.tag.children && this.tag.children.length > 0) return;
    this.store.dispatch(new TagSelectorChange(this.tag));
  }
}

export interface TagSelectorState {
  tag: TagWithChildren;
}

export enum ETagSelectorActions {
  Change = '[TagSelector] Change',
  SetById = '[TagSelector] Set by Id'
}

export class TagSelectorChange implements Action {
  readonly type = ETagSelectorActions.Change;
  constructor(public payload: TagWithChildren) {}
}

export class TagSelectorSetById implements Action {
  readonly type = ETagSelectorActions.SetById;
  constructor(public payload: number) {}
}
