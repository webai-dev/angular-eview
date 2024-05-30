import {
  Component,
  Input,
  Output,
  OnInit,
  OnDestroy,
  EventEmitter,
  AfterViewInit
} from '@angular/core';
import { AppState } from '@eview/core/store/states/app.state';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { FormAttributes, FormAttribute } from '@eview/core/domain/form/form-attribute';
import { PostHelpers } from '@eview/core/domain/post/post.helpers';
import { FilterHelpers } from '@eview/core/domain/filters/filters.helper';
import {
  FilterItem,
  PostFilters
} from '@eview/core/domain/post/post';

import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { selectTags } from '@eview/core/store/selectors/tags.selector';
import { selectMap } from '@eview/core/store/selectors/map.selector';
import { selectFormAttributes } from '@eview/core/store/selectors/form-attributes.selector';
import { Tag, Tags } from '@eview/core/domain/tags/tag';
import {
  TagWithChildren,
  TagHelpers
} from '@eview/core/domain/tags/tag.helpers';
import {
  ETagSelectorActions,
  TagSelectorChange,
  TagSelectorSetById
} from '../post-editor/tag-selector/tag-selector.component';
import { FilterService } from './filters.service';
import * as Lodash from 'lodash';


@Component({
  selector: 'eview-filters',
  templateUrl: 'filters.component.html',
  styleUrls: ['filters.component.scss']
})
export class FiltersComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isLoadAllReport: boolean;
  @Output() onApply: EventEmitter<Object> = new EventEmitter();
  @Output() onCancel: EventEmitter<Boolean> = new EventEmitter();

  subs: Subscription;
  applyDisabled = true;
  selectedTagId: number;
  tag: TagWithChildren;
  formAttributesFilters: FormAttribute[];
  PostHelpers = PostHelpers;
  selectedPostFilters: PostFilters[] = [];
  selectedFormFilters: PostFilters[] = [];

  constructor(private store: Store<AppState>,
              private actions$: Actions,
              private filterService: FilterService
            ) {
    this.subs = new Subscription();
  }

  tags$: Observable<Tags> = this.store.select(selectTags);

  formAttributes: FormAttributes;

  mapRegions: any = [];

  filters: FilterItem[] = [];

  selectedRegion: any = [];

  availableTags$: Observable<Tag[]> = this.tags$.pipe(
    map(tags => tags.results as Tag[])
  );

  nestedTags$: Observable<TagWithChildren[]> = this.tags$.pipe(
    map(tags =>
      tags && tags && tags.results ? TagHelpers.ProcessForRendering(tags) : null
    )
  );

  ngAfterViewInit() {
    if (this.selectedTagId > 0) {
      setTimeout(() => {
        this.store.dispatch(new TagSelectorSetById(this.selectedTagId));
      });
    }
  }

  ngOnInit() {
    this.subs.add(
      this.store
        .select(selectFormAttributes)
        .subscribe(formAttributes => (this.formAttributes = formAttributes))
    );

    this.subs.add(this.store.select(selectMap).subscribe(res => {
      if (res) {
        this.mapRegions = res.regions;
        this.filters = FilterHelpers.GetFilters(this.mapRegions);
      }
    })
    );

    const prefetchFilters = this.filterService.filterOptions;
    if (!Lodash.isEmpty(prefetchFilters)) {
      this.selectedPostFilters = prefetchFilters.postFilters;
      this.selectedFormFilters = prefetchFilters.formFilters;
      if (prefetchFilters.tagId > 0) {
        this.selectedTagId = prefetchFilters.tagId;
      }
      if (this.selectedPostFilters[PostFilters.Region]) {
        this.onChange(PostFilters.Region);
      }
    }
    this.subs.add(
      this.actions$
        .pipe(ofType<TagSelectorChange>(ETagSelectorActions.Change))
        .subscribe(action => {
          if (action.payload) {
            this.selectedTagId = action.payload.id;
            this.applyDisabled = false;
          }
        })
    );
    if (this.formAttributes.results.length > 0) {
      this.formAttributesFilters =
      this.formAttributes.results.filter(item => item.type === 'varchar' && (item.input === 'radio' || item.input === 'select'));
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
    this.selectedTagId = 0;
  }

  setFilterValues(keyToBeSet: string, values: string[]) {
    this.filters.map((item) => {
        if (item.queryParam === keyToBeSet) {
          item.values = values;
        }
        return item;
      });
  }

  isFiltersSelected() {
    this.applyDisabled = true;
    for (const option in this.selectedPostFilters) {
      if ( parseInt(this.selectedPostFilters[option], 10) !== -1) {
        this.applyDisabled = false;
      }
    }
    for (const option in this.selectedFormFilters) {
      if ( parseInt(this.selectedFormFilters[option], 10) !== -1) {
        this.applyDisabled = false;
      }
    }
  }

  onChange(optionSelected: string) {
    if (optionSelected === PostFilters.Region) {
      this.selectedRegion = this.selectedPostFilters[optionSelected];
      if (this.selectedRegion !== '-1') {
        const temp = [], zones = [];
        this.mapRegions[this.selectedRegion].forEach(element => {
          if (Lodash.indexOf(temp, element.district) === -1) {
            temp.push(element.district);
            zones.push({name: element.district, value: element.district});
          }
        });
        this.setFilterValues(PostFilters.Zone, zones);
      }
    }

    if (optionSelected === PostFilters.Zone) {
      const woredas = [];
      const region = this.mapRegions[this.selectedRegion];
      if (region !== '-1') {
        const zones = region.filter(item => (item.district === this.selectedPostFilters[PostFilters.Zone]));
        if (zones) {
          zones.map((item) => {
            woredas.push({name: item.suos_pref, value: item.suos_pref});
          });
        }
        this.setFilterValues(PostFilters.Woreda, woredas);
      }
    }
    this.isFiltersSelected();
  }

  onApplyClick() {
    const collection = [];
    this.filterService.filterOptions = {
      postFilters: this.selectedPostFilters,
      formFilters: this.selectedFormFilters,
      tagId: this.selectedTagId || 0
    };
    if (this.selectedPostFilters) {
      for (const option in this.selectedPostFilters) {
        if ( this.selectedPostFilters.hasOwnProperty(option) && this.selectedPostFilters[option].toString() !== '-1' ) {
          collection[option] = this.selectedPostFilters[option];
        }
      }
    }
    if (this.selectedFormFilters) {
      for (const key in this.selectedFormFilters) {
        if ( this.selectedPostFilters.hasOwnProperty(key) && this.selectedPostFilters[key].toString() !== '-1') {
          collection['values[' + key + ']'] = this.selectedFormFilters[key];
        }
      }
    }
    if (this.selectedTagId > 0) {
      const tags = 'tags';
      collection[tags] = this.selectedTagId;
    }
    this.onApply.emit(collection);
    this.applyDisabled = true;
  }

  onCancelClick() {
    this.selectedFormFilters = [];
    this.selectedPostFilters = [];
    this.filterService.filterOptions = [];
    this.applyDisabled = true;
    this.onCancel.emit(false);
  }
}
