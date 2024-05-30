import {
  Input,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  FormAttributeInput,
  FormAttributeType,
  FormAttributeConfigAction,
  FormAttributeConfig
} from '@eview/core/domain/form/form-attribute';
import { Tag, Tags } from '@eview/core/domain/tags/tag';
import { selectMap } from '@eview/core/store/selectors/map.selector';
import { selectTags } from '@eview/core/store/selectors/tags.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Store, Action } from '@ngrx/store';
import { Observable, Subscription, of } from 'rxjs';
import {
  map,
  debounceTime,
  take,
  filter,
  tap,
  switchMap,
  catchError
} from 'rxjs/operators';
import { MediaService } from '@eview/core/domain/media/media.service';
import { FormAttributeEx } from './post-editor-base.component';
import {
  UserClickedMap,
  SimulateUserClickedMap,
  EMapActions
} from '@eview/core/store/actions/map.actions';
import * as moment from 'moment';
import {
  TagWithChildren,
  TagHelpers
} from '@eview/core/domain/tags/tag.helpers';
import { GeocodingService } from '@eview/core/domain/geocoding/geocoding.service';
import { Actions, ofType } from '@ngrx/effects';
import { MapContext } from '@eview/core/models/map';
import { MapComponent } from '@eview/features/ui/map/map.component';

const MAP_ZOOM_CITY = 14;
const MAP_ZOOM_MAX = 22;

export class FormAttributeBaseComponent
  implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    public store: Store<AppState>,
    private actions: Actions,
    private geocodingService: GeocodingService,
    private mediaService: MediaService
  ) {
    this.subs1 = new Subscription();
  }

  public searchFailed: boolean = false;

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
          this.resetMapToDefault();
          return false;
        }
      }),
      switchMap(address => {
        return this.geocodingService.forward(address).pipe(
          map(data => {
            if (data) {
              this.searchFailed = false;
              return data.map(res => res);
            } else {
              this.searchFailed = address === '' ? false : true;
              return [];
            }
          }),
          catchError(err => {
            this.searchFailed = true;
            this.isSearchingByAddress = false;
            return of([]);
          })
        );
      }),
      tap(() => (this.isSearchingByAddress = false))
    );

  resetMapToDefault() {
    if (this.initialPositionView) {
      this.mapComponent.map.setView(
        [this.initialPositionView.lat, this.initialPositionView.lon],
        this.initialPositionView.zoom
      );
      this.store.dispatch(new SimulateUserClickedMap({ actual: null }));
    }
  }

  onValueSelected(result) {
    const position = result && result.item ? result.item : [];
    if (position) {
      position.zoom = MAP_ZOOM_MAX;
      if (position.type === 'town' || position.type === 'city') {
        position.zoom = MAP_ZOOM_CITY;
      }
      this.mapComponent.map.setView(
        [position.lat, position.lon],
        position.zoom
      );
    }
    setTimeout(() => {
      this.store.dispatch(new SimulateUserClickedMap({ actual: position }));
    });
  }

  ngOnInit() {
    this.value = this.initValue();
    this.bindValue();
    this.handleConfig();

    setTimeout(() => {
      this.store.dispatch(
        new AttributeChanged({
          key: this.FormAttribute.key,
          value: this.FormAttribute.value
        })
      );
    });

    this.store.select(selectMap).subscribe(map => {
      if (!map || !map.actual) return;
      this.initialPositionView = map.defaults;
      this.onValueChange();
    });
  }

  ngAfterViewInit() {
    if (this.FormAttribute.type === FormAttributeType.Point) {
      const searchByAddress: Element = document.getElementById(
        'search-by-address'
      );

      this.subs1.add(
        this.actions
          .pipe(ofType<UserClickedMap>(EMapActions.UserClickedMap))
          .subscribe(action => {
            if (!(action && action.payload.actual))
              (searchByAddress as HTMLInputElement).value = '';
          })
      );
    }
  }

  ngOnDestroy() {
    this.subs1.unsubscribe();
  }

  @Input() FormAttribute: FormAttributeEx;

  FormAttributeInput = FormAttributeInput;
  FormAttributeType = FormAttributeType;

  tags$: Observable<Tags> = this.store.select(selectTags);

  availableTags$: Observable<Tag[]> = this.tags$.pipe(
    map(tags => tags.results as Tag[])
  );

  nestedTags$: Observable<TagWithChildren[]> = this.tags$.pipe(
    map(tags =>
      tags && tags && tags.results ? TagHelpers.ProcessForRendering(tags) : null
    )
  );

  value: any;
  selectedValues = [];

  initialPositionView: MapContext;

  @ViewChild(MapComponent, { static: false }) mapComponent;

  isSearchingByAddress: boolean = false;
  noResultsFromAddress: boolean;

  private subs1: Subscription;

  show: boolean = true;

  private initValue(): any {
    switch (this.FormAttribute.type) {
      case FormAttributeType.Point: {
        return { lat: null, lon: null };
      }

      case FormAttributeType.DateTime: {
        return {
          date: { year: 0, month: 0, day: 0 },
          time: { hour: 0, minute: 0, second: 0 }
        };
      }
    }
    return null;
  }

  private bindValue(): any {
    if (this.FormAttribute.value) {
      this.value = this.FormAttribute.value;

      if (this.FormAttribute.type === FormAttributeType.Tags) {
        this.selectedValues = this.value.reduce((sv: boolean[], v: string) => {
          sv[+v] = true;
          return sv;
        }, []);
      }

      if (this.FormAttribute.input === FormAttributeInput.Checkbox) {
        this.selectedValues = this.FormAttribute.options.map(o => {
          return [...this.value].includes(o);
        });
      }

      if (
        this.FormAttribute.input === FormAttributeInput.Radio ||
        this.FormAttribute.input === FormAttributeInput.Select ||
        this.FormAttribute.input === FormAttributeInput.Number
      )
        this.value = this.value[0];
    }

    if (this.FormAttribute.type === FormAttributeType.Point) {
      if (this.FormAttribute.value) {
        this.store.dispatch(
          new UserClickedMap({
            actual: { ...this.value[0] }
          })
        );
      }
      this.store.select(selectMap).subscribe(map => {
        if (!map || !map.actual) return;
        this.value = map.actual;
        this.onValueChange();
      });
    }

    if (
      this.FormAttribute.type == FormAttributeType.DateTime &&
      this.FormAttribute.value
    ) {
      const datetime = moment.utc(this.value[0]).local();
      this.value.date = {
        year: datetime.year(),
        month: datetime.month() + 1,
        day: datetime.date()
      };
      this.value.time = {
        hour: datetime.hour(),
        minute: datetime.minute(),
        second: datetime.second()
      };
    }

    if (
      this.FormAttribute.type == FormAttributeType.Media &&
      this.value &&
      this.value.length > 0
    ) {
      this.mediaService
        .read(this.value)
        .pipe(take(1))
        .subscribe(res => {
          this.value.name = res.caption;
        });
    }
  }

  onValueChange() {
    const getTypePerCase = (formAttribute): FormAttributeType => {
      if (
        formAttribute.type === FormAttributeType.Varchar &&
        formAttribute.input === FormAttributeInput.Checkbox
      ) {
        return FormAttributeType.Checkbox;
      } else {
        return formAttribute.type;
      }
    };
    switch (getTypePerCase(this.FormAttribute)) {
      case FormAttributeType.Tags:
        this.FormAttribute.value = this.selectedValues
          .map((v, i) => {
            if (!v) return;
            return i;
          })
          .filter(i => i);
        break;

      case FormAttributeType.Title:
      case FormAttributeType.Description:
      case FormAttributeType.Content:
        {
          this.FormAttribute.value = this.value;
        }
        break;

      case FormAttributeType.DateTime:
        {
          const { year, month, day } = this.value.date;
          const { hour, minute, second } = this.value.time;
          //fix for saving blank date
          if(year === 0 && hour === 0){
             this.FormAttribute.value = [];   
          }else{
            this.FormAttribute.value = [
               new Date(year, month - 1, day, hour, minute, second)
            ];
          }
        }
        break;

      case FormAttributeType.Checkbox:
        {
          this.FormAttribute.value = this.selectedValues
            .map((v, i) => {
              if (!v) return;
              return this.FormAttribute.options[i];
            })
            .filter(i => i);
        }
        break;

      case FormAttributeType.Media:
        {
          this.FormAttribute.value = this.value;
        }
        break;
      default:
        this.FormAttribute.value = this.value ? [this.value] : null;
    }

    this.store.dispatch(
      new AttributeChanged({
        key: this.FormAttribute.key,
        value: this.FormAttribute.value
      })
    );
  }

  onDeleteConfirmationClick() {
    this.value = null;
    this.onValueChange();
  }

  onMediaSelect(event: { target: { files: any } }) {
    this.value = (event.target.files || [])[0];
    this.onValueChange();
  }

  private handleConfig() {
    if (
      !this.FormAttribute.config ||
      (this.FormAttribute.config && this.FormAttribute.config.length === 0)
    )
      return;
    this.subs1.add(
      this.actions
        .pipe(
          ofType<AttributeChanged>(EFormAttributeActions.AttributeChanged),
          filter(action => action.payload.key !== this.FormAttribute.key)
        )
        .subscribe(action => {
          const evaluate = (
            config: FormAttributeConfig[],
            action: FormAttributeConfigAction,
            attributeChanged: { key: string; value: any }
          ): boolean => {
            switch (action) {
              case FormAttributeConfigAction.Show:
                if (!config.find(c => c.action)) {
                  return true;
                }
            }
            const matchingConfigs = config.filter(
              c => c.action === action && c.target.key === attributeChanged.key
            );
            if (matchingConfigs && matchingConfigs.length > 0) {
              const matchingValues = matchingConfigs.map(c => c.target.value);
              if (!Array.isArray(attributeChanged.value))
                attributeChanged.value = [attributeChanged.value];
              if (attributeChanged.value.length === 0) return false;
              return attributeChanged.value
                .map(
                  v => {
                    if (action === FormAttributeConfigAction.Hide) {
                      return !(matchingValues.includes(v) || matchingValues.includes('' + v));
                    }
                    return (matchingValues.includes(v) || matchingValues.includes('' + v));
                  }
                )
                .reduce((e, i) => (e = e || i), false);
            }
            return undefined;
          };
          const e = evaluate(
            this.FormAttribute.config,
            this.FormAttribute.config[0].action,
            action.payload
          );
          
          if (!(typeof e === 'undefined')) {
            this.show = e;
            if (!this.show) {
              this.value = null;
              this.onValueChange();
            }
          }
        })
    );
  }
}

export enum EFormAttributeActions {
  UnresolvedAddress = '[FormAttribute] Unresolved address',
  AttributeChanged = '[FormAttribute] Changed'
}

export class FormAttributeUnresolvedAddress implements Action {
  readonly type = EFormAttributeActions.UnresolvedAddress;
}

export class AttributeChanged implements Action {
  readonly type = EFormAttributeActions.AttributeChanged;
  constructor(public payload: { key: string; value: any }) {}
}
