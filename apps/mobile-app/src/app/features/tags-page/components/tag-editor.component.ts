import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import {
  TagWithChildren,
  TagHelpers
} from '@eview/core/domain/tags/tag.helpers';
import { TagService } from '@eview/core/domain/tags/tag.service';
import { environment } from '@eview/core/environments/environment';
import { isEmpty, cloneDeep } from 'lodash';
import { Action, Store } from '@ngrx/store';
import { Actions, ofType } from '@ngrx/effects';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'eview-tag-editor',
  templateUrl: 'tag-editor.component.html',
  styleUrls: ['tag-editor.component.scss']
})
export class TagEditorComponent implements OnInit, OnDestroy {
  constructor(
    private tagService: TagService,
    private store: Store<void>,
    private actions$: Actions
  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.isEditing = !this.tag.id;
    this.subs.add(
      this.actions$
        .pipe(ofType<TagDeleted>(ETagEditorActions.Deleted))
        .subscribe(action => {
          this.tag.children = this.tag.children.filter(
            t => t.id !== +action.payload
          );
        })
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  @Input() public tag: TagWithChildren;
  private _tag: TagWithChildren;

  isEditing: boolean;
  color: string = environment.defaults.tagColor;
  showDeleteConfirmation: boolean;
  icon: string = environment.defaults.tagIcon;
  fallbackIcon = environment.defaults.tagIcon;

  get tagIsInvalid(): boolean {
    return !this.tag.tag;
  }

  private subs: Subscription;

  onAddClick() {
    this.tag.children.push({
      parent_id: this.tag.id,
      id: 0,
      tag: null,
      color: null,
      icon: null,
      type: 'category',
      children: []
    });
  }

  onColorCodeChange(colorCode: string) {
    if (!isEmpty(colorCode)) {
      this.tag.color = colorCode;
    }
  }

  onEditClick() {
    this.isEditing = true;
    this._tag = cloneDeep(this.tag);
  }

  onDeleteClick() {
    this.showDeleteConfirmation = true;
  }

  onDeleteConfirmationClick() {
    forkJoin([
      this.tagService.delete(this.tag),
      ...(TagHelpers.FlatifyChildren([this.tag])[0]
        .children as number[]).map(id => this.tagService.delete({ id }))
    ]).subscribe(all => {
      this.store.dispatch(new TagDeleted(this.tag.id));
      this.showDeleteConfirmation = false;
    });
  }

  onSaveClick() {
    (this.tag.id
      ? this.tagService.update(this.tag)
      : this.tagService.create(this.tag)
    ).subscribe(tag => {
      this.tag.id = tag.id;
      this.isEditing = false;
    });
  }

  onCancelClick() {
    if (this.showDeleteConfirmation) {
      this.showDeleteConfirmation = false;
      return;
    }
    if (!this.tag.id) {
      this.tag.id = -1;
      return;
    }
    this.tag = this._tag;
    this.isEditing = false;
  }

  onIconPickerSelect(newIcon: string): void {
    this.tag.icon = this.icon = newIcon;
  }
}

export enum ETagEditorActions {
  Deleted = '[TagEditor] Deleted'
}

export class TagDeleted implements Action {
  readonly type = ETagEditorActions.Deleted;
  constructor(public payload: number) {}
}
