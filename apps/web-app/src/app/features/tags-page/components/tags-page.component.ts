import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@eview/core';
import { Tag } from '@eview/core/domain/tags/tag';
import { ListTags } from '@eview/core/store/actions/tags.actions';
import { selectTags } from '@eview/core/store/selectors/tags.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';

@Component({
  selector: 'eview-tags-page',
  templateUrl: 'tags-page.component.html',
  styleUrls: ['tags-page.component.scss']
})
export class TagsPageComponent extends BaseComponent implements OnInit {
  constructor(private store: Store<AppState>) {
    super();
  }

  ngOnInit() {
    this.store.dispatch(new ListTags());
    this.store.select(selectTags).subscribe(tags => (this.tags = tags.results));
  }

  public tags: Tag[];

  public get isAdding(): boolean {
    return this.tags.some(t => !t.id);
  }

  onAddClick() {
    this.tags.push({ id: 0, tag: null, type: 'category' });
  }

  onRefreshClick() {
    this.store.dispatch(new ListTags());
  }

  onTagAddCanceled(tag: Tag) {
    this.tags = this.tags.filter(t => t.id);
  }

  onTagUpdated(tag: Tag) {
    this.store.dispatch(new ListTags());
  }

  onTagDeleted(tag: Tag) {
    this.store.dispatch(new ListTags());
  }
}
