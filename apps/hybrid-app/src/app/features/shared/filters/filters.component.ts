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
import { User, ListUserOptions } from '@eview/core/models/user';
import { UserService } from '@eview/core/users/user.service';
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
import { OrderSort } from '@eview/core/models/commons';
import {
  debounceTime,
  filter,
  tap,
  switchMap,
  catchError
} from 'rxjs/operators';
import { Observable, Subscription, of } from 'rxjs';
import { NgbDate, NgbCalendar, NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';

const PAGE_SIZE = 20;

@Component({
  selector: 'eview-filters',
  templateUrl: 'filters.component.html',
  styleUrls: ['filters.component.scss']
})
export class FiltersComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() isLoadAllReport: boolean;
  @Input() formID: number;
  @Input() resetFilters: Observable<boolean>;
  @Output() onApply: EventEmitter<Object> = new EventEmitter();
  @Output() onCancel: EventEmitter<Boolean> = new EventEmitter();

  subs: Subscription;
  model: string;
  
  applyDisabled: boolean = true;
  selectedTagId: number;
  tag: TagWithChildren;
  formAttributesFilters: FormAttribute[];
  PostHelpers = PostHelpers;
  selectedPostFilters: PostFilters[] = [];
  selectedFormFilters: PostFilters[] = [];
  listOption: ListUserOptions;
  users: User[];  
  limit: number = PAGE_SIZE;
  public searchFailed: boolean = false;
  public isSearchingByAddress: boolean = false;
  public total_count: number = 0;
  public formatter = (result: any) => result.realname;

  hoveredDate: NgbDate | null = null;

  fromDate: NgbDate | null;
  toDate: NgbDate | null;

  onDateSelection(date: NgbDate) {
    if (!this.fromDate && !this.toDate) {
      this.fromDate = date;
    } else if (this.fromDate && !this.toDate && date && date.after(this.fromDate)) {
      this.toDate = date;
    } else {
      this.toDate = null;
      this.fromDate = date;
    }
    this.selectedPostFilters['fromDate'] = this.fromDate;
    this.selectedPostFilters['toDate'] = this.toDate;
    this.applyDisabled = !(this.fromDate || this.toDate);
  }

  isHovered(date: NgbDate) {
    return this.fromDate && !this.toDate && this.hoveredDate && date.after(this.fromDate) && date.before(this.hoveredDate);
  }

  isInside(date: NgbDate) {
    return this.toDate && date.after(this.fromDate) && date.before(this.toDate);
  }

  isRange(date: NgbDate) {
    return date.equals(this.fromDate) || (this.toDate && date.equals(this.toDate)) || this.isInside(date) || this.isHovered(date);
  }

  validateInput(currentValue: NgbDate | null, input: string): NgbDate | null {
    const parsed = this.formatterDate.parse(input);
    return parsed && this.calendar.isValid(NgbDate.from(parsed)) ? NgbDate.from(parsed) : currentValue;
  }


  constructor(private store: Store<AppState>, 
              private actions$: Actions,
              private filterService: FilterService,
              private userService: UserService,
              private calendar: NgbCalendar, 
              public formatterDate: NgbDateParserFormatter
            ) {
    this.subs = new Subscription();
  }

  tags$: Observable<Tags> = this.store.select(selectTags);

  formAttributes: FormAttributes;

  mapRegions:any = [];

  filters: FilterItem[] = [];

  selectedRegion:any = [];

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

    this.subs.add(
      this.resetFilters.subscribe((flag) => {
        if (flag) {
          this.resetFilterValues();
        }
      })
    );

    this.subs.add(this.store.select(selectMap).subscribe(map => {
      if (map) {
        this.mapRegions = map.regions;
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
      if (this.selectedPostFilters[PostFilters.Zone]) {
        this.onChange(PostFilters.Zone);
      }
      this.fromDate = this.selectedPostFilters['fromDate'];
      this.toDate = this.selectedPostFilters['toDate'];
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
      this.formAttributesFilters = this.formAttributes.results.filter(item => item.type === 'varchar' && (item.input === 'radio' || item.input === 'select'));
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
    for(let option in this.selectedPostFilters) {
      if (parseInt(this.selectedPostFilters[option]) !== -1) {
        this.applyDisabled = false;
      }
    };
    for(let option in this.selectedFormFilters) {
      if (parseInt(this.selectedFormFilters[option]) !== -1) {
        this.applyDisabled = false;
      }
    };
  }

  onChange(optionSelected: string) {
    if (optionSelected === PostFilters.Region) {
      this.selectedRegion = this.selectedPostFilters[PostFilters.Region];
      if (this.selectedRegion !== '-1') {
        let temp = [], zones = [];
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
      let woredas = [];
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
    let collection = [];
    this.filterService.filterOptions = {
      postFilters: this.selectedPostFilters,
      formFilters: this.selectedFormFilters,
      tagId: this.selectedTagId | 0
    };
    if (this.selectedPostFilters) {
      for(const key in this.selectedPostFilters) {
        let val = (this.selectedPostFilters[key]) ? this.selectedPostFilters[key].toString() : '';
        if (val !== '-1')
          collection[key] = this.selectedPostFilters[key];
      }
    }
    if (this.selectedFormFilters) {
      for(const key in this.selectedFormFilters) {
        let val = (this.selectedFormFilters[key]) ? this.selectedFormFilters[key].toString() : '';
        if (val !== '-1')
          collection['values[' + key + ']'] = this.selectedFormFilters[key];
      }
    }
    if (this.selectedTagId > 0) {
      collection['tags'] = this.selectedTagId;
    }
    if (this.selectedPostFilters['author']) {
      collection['user'] = (this.selectedPostFilters['author']) ? this.selectedPostFilters['author'].id : 0;
    }
    if (this.fromDate) {
      collection['created_after'] = FilterHelpers.GetDateFromObject(this.fromDate);
      collection['created_before'] = FilterHelpers.GetDateFromObject(this.calendar.getNext(this.fromDate, 'd', 1));
    }
     if (this.toDate) {
      collection['created_before'] = FilterHelpers.GetDateFromObject(this.calendar.getNext(this.toDate, 'd', 1));
     }
    delete collection['author'];
    delete collection['fromDate'];
    delete collection['toDate'];
    this.onApply.emit(collection);
    this.applyDisabled = true;
  }

  onValueSelected(result) {
    const selectedUser = result && result.item ? result.item : [];
    this.users = this.users.filter(user => (user.realname === selectedUser.realname));
    this.applyDisabled = this.users.length === 0 || false;
  }

  resetFilterValues() {
    this.selectedFormFilters = [];
    this.selectedPostFilters = [];
    this.filterService.filterOptions = [];
  }

  onCancelClick() {
    this.resetFilterValues();
    this.applyDisabled = true;
    this.onCancel.emit(false);
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      tap(() => {
        this.searchFailed = false;
        this.isSearchingByAddress = true;
      }),
      filter(term => {
        if (term.length >= 2) {
          return true;
        } else {
          this.isSearchingByAddress = false;
          return this.isSearchingByAddress;
        }
      }),
      switchMap(address => {
        this.listOption = {
          offset: 0,
          limit: this.limit,
          orderby: 'realname',
          order: OrderSort.Asc,
          q: address
        };

        return this.userService.list(this.listOption).pipe(
          map(data => {
            if (data) {
              this.searchFailed = false;
              this.total_count = data.total_count;
              return data.results.map(res => res);
            } else {
              this.searchFailed = address === '' ? false : true;
              return [];
            }
          }),
          catchError(err => {
            this.searchFailed = true;
            this.isSearchingByAddress = false;
            return of(null);
          })
        )
      }),
      tap((data) => {
        this.users = data;
        this.isSearchingByAddress = false;
        return this.isSearchingByAddress;
      })
    );
}
