import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Tag } from '@eview/core/domain/tags/tag';
import { TagService } from '@eview/core/domain/tags/tag.service';
import { Store } from '@ngrx/store';
import { AppState } from '@eview/core/store/states/app.state';
import * as lodash from 'lodash';

@Component({
  selector: 'eview-tag-editor',
  templateUrl: 'tag-editor.component.html'
})
export class TagEditorComponent implements OnInit {
  constructor(private store: Store<AppState>, private tagService: TagService) {}

  ngOnInit() {
    this.isEditing = !this.tag.id;
  }

  @Input() public tag: Tag;
  private _tag: Tag;

  @Output() onAddCanceled: EventEmitter<void> = new EventEmitter();
  @Output() onUpdated: EventEmitter<Tag> = new EventEmitter();
  @Output() onDeleted: EventEmitter<Tag> = new EventEmitter();

  public isEditing: boolean;

  public showDeleteConfirmation: boolean;

  public get tagIsInvalid(): boolean {
    return !this.tag.tag;
  }

  onEditClick() {
    this.isEditing = true;
    this._tag = lodash.cloneDeep(this.tag);
  }

  onDeleteClick() {
    this.showDeleteConfirmation = true;
  }

  onDeleteConfirmationClick() {
    this.tagService.delete(this.tag).subscribe(() => {
      this.showDeleteConfirmation = false;
      this.onDeleted.emit(this.tag);
    });
  }

  onSaveClick() {
    (this.tag.id
      ? this.tagService.update(this.tag)
      : this.tagService.create(this.tag)
    ).subscribe(tag => {
      this.tag = tag;
      this.isEditing = false;
      this.onUpdated.emit(this.tag);
    });
  }

  onCancelClick() {
    if (!this.tag.id) {
      this.onAddCanceled.emit();
      return;
    }
    this.tag = this._tag;
    this.isEditing = false;
  }
}
