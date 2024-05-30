import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewContainerRef,
  ViewChild, ComponentFactoryResolver, ViewRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import {
  FormAttributes,
  FormAttribute,
  FormAttributeType
} from '@eview/core/domain/form/form-attribute';
import {
  FilterCriteria, FormFields
} from '@eview/core/domain/filters/filterCriteria';
import { FilterHelpers } from '@eview/core/domain/filters/filters.helper';
import {
  ListPostOptions,
  Posts,
  PostStatus  
} from '@eview/core/domain/post/post';
import { Form } from '@eview/core/domain/form/form';
import { selectMap } from '@eview/core/store/selectors/map.selector';
import { PostService } from '@eview/core/domain/post/post.service';
import { GetConfig } from '@eview/core/store/actions/config.actions';
import { selectConfig } from '@eview/core/store/selectors/config.selector';
import { selectTags } from '@eview/core/store/selectors/tags.selector';
import { ConfigService } from '@eview/core/config/config.service';
import { selectFormAttributes } from '@eview/core/store/selectors/form-attributes.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { environment } from '@eview/core/environments/environment';
import { isEmpty, includes } from 'lodash';
import { Subscription } from 'rxjs';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ngbDateCustomFmt } from '../../shared/ngb-date-custom-fmt';
import { ToastType } from '../../toast/toast.component';
import { ToastService } from '../../toast/toast.service';
import {FlexMonsterConfig as ReportJson} from './report-format';
import { Tags } from '@eview/core/domain/tags/tag';
import { PostHelpers } from '@eview/core/domain/post/post.helpers';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FlexmonsterComponent } from './flexmonster.component';
import { selectForms } from '@eview/core/store/selectors/forms.selector';
import * as moment from 'moment';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ListFormAttributes } from '@eview/core/store//actions/form-attributes.actions';

@Component({
  selector: 'eview-post-filters'  ,
  templateUrl: 'post-filters.component.html',
  styleUrls: ['post-filters.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: ngbDateCustomFmt }]
})
export class PostFiltersComponent implements OnInit, OnDestroy {
  @ViewChild('chartsContainer', {static: true}) private fmpivot: any;
  private subs: Subscription;
  private formAttributes: FormAttributes;
  public filterCategory: FormAttribute[];
  configFilters = [];
  private isDisabled: boolean = true;
  public showChartsBtn: boolean = false;
  private reportIndex: number = 0;
  private regionalMapData: any = [];
  private reportTitle: string = '';
  selectedFilters: any = [];
  private mapRegions: any[] = [];
  private showReport: boolean = false;
  private filterCriteria: FilterCriteria[] = [];
  public graphType: number = 4;
  posts: Posts = { count: 0, results: [] };
  mapReports: any = ReportJson;
  private updatedReport: any = [];
  private tags: Tags[] = [];
  viewRef: ViewRef[] = [];
  private isReportChecked: number = 0;
  private isShowMapClicked: boolean = false;
  protected formList: Form[] = [];
  protected formId: number = environment.form.id;
  private requestOptions: ListPostOptions = {
      status: PostStatus.All,
      created_after: null,
      created_before: null,
      formId: 1
    };
  PostHelpers = PostHelpers;

  constructor(
    private store: Store<AppState>,
    private configService: ConfigService,
    @Inject(ViewContainerRef) private viewContainerRef: ViewContainerRef,
    private toast: ToastService,
    private postService: PostService,
    private modalService: NgbModal,
    private componentFactoryResolver: ComponentFactoryResolver,
    private translate: TranslateService

  ) {
    this.subs = new Subscription();
    this.selectedFilters['formId'] = this.formId;
    toast.setViewContainerRef(viewContainerRef);
    const currentLang = this.translate.currentLang;
    this.mapReports.localization = `/assets/i18n/flexmonster-localization-${currentLang}.json`
  }

  ngOnInit() {
    this.subs.add(
      this.translate.onLangChange.subscribe((langChangeEvent:LangChangeEvent) =>{
        this.mapReports.localization = `/assets/i18n/flexmonster-localization-${langChangeEvent.lang}.json`
  
      }) 
    )
    this.subs.add(
        this.store
        .select(selectForms)
        .subscribe(
          forms => {
            this.formList = forms.results.filter(form => !form.disabled);
          }
      )
    );
    this.getFormFields();
    this.store.select(selectTags).subscribe((tags: any) => {
      tags.results.forEach(item => {
        this.tags[item.id] = item.tag;
      });
    });

    this.store.select(selectMap).subscribe(map => {
      if (map) {
        this.mapRegions = map.regions;
      }
    });
    this.store.select(selectConfig).subscribe((config: any) => {
      const filterData = config.results.filter(item => {
        return item.id === 'filters';
      });
      this.filterCriteria =
        filterData && filterData[0].criteria ? filterData[0].criteria : [];
      const result = filterData ? filterData[0].filters : [];

      for (let prop in result) {
        let obj = result[prop].value,
          values = [];
        for (let key in result[prop].value) {
          values.push({ id: key, name: obj[key] });
        }
        this.configFilters.push({
          key: prop,
          name: result[prop].label,
          values: values
        });
      }
    });
    
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  getFormFields() {
    this.formAttributes = null;
    this.subs.add(
      this.store
      .select(selectFormAttributes)
      .subscribe((formAttributes) => {
        this.formAttributes = formAttributes;
        if (this.formAttributes && this.formAttributes.count > 0) {
          this.filterCategory = this.formAttributes.results.filter(item => {
            if (this.selectedFilters && this.selectedFilters['formId'] === this.formId) {
              let category = item.label.trim().toLowerCase();
              return includes(FilterHelpers.GetAllowedAttributes, category);
            } else if (item.type === FormAttributeType.Point) {
              return false;
            } else {
              return true;
            }
          });
        }
      })
    );    
  }


  onFormChange(selectedFormId: number) {
    this.selectedFilters['formId'] = selectedFormId;
    this.store.dispatch(new ListFormAttributes({ id: selectedFormId }));
    this.resetFlexCharts();
    this.getFormFields();
  }

  onFilterValueChanges(reportId) {
    this.selectedFilters['duration'] = reportId;
    if (this.selectedFilters['duration'] && this.isReportChecked !== 0) {
      this.isDisabled = false;
      this.onReportTypeChange(this.isReportChecked);
    }
  }

  onReportTypeChange(val) {
   if (parseInt(val) === 2) {
     this.requestOptions.parent = null;
   } else {
     delete this.requestOptions.parent;
   }
  }

  getSelectedFilters() {
    const { duration, fromdate, todate, formId } = this.selectedFilters;
    let request: FilterCriteria = {
      duration: duration
    };
    if (duration == 4) {
      request.startDate = fromdate;
      request.endDate = todate;
    }
    if (this.isReportChecked === 2) {
     request.isReport = true;
    }
    request.formId = formId;
    return request;
  }

  onCustomizeToolbar(toolbar, id) {
    let tabs = toolbar.getTabs();
    toolbar.getTabs = function() {
      // add new tab
      const mapTab = [
        {
          id: 'fm-tab-maptab',
          title: 'Map',
          handler: 'onShowMap',
          icon:
            '<img width="36" height="36" style="border: 1px solid darkgrey;padding: 2px;margin-bottom: 7px;border-radius: 5px;" src="/assets/images/world.png" />'
        },
        {
          id: "fm-tab-maptab",
          title: "Remove",
          handler: "onDeleteReport",
          icon: '<img width="36" height="36" style="border: 1px solid darkgrey;padding: 2px;margin-bottom: 7px;border-radius: 5px;" src="/assets/images/cross-remove-sign.svg" />'
        }
      ];
      tabs = tabs.slice(3, 12);
      tabs.splice(4, 0, mapTab[1]);
      return tabs;
    };
    toolbar.onDeleteReport = () => {
      this.removeFlexChart(id);
    }
  }

  onShowMap() {
    this.isShowMapClicked = true;
    this.regionalMapData = FilterHelpers.GetFormattedMapData(this.posts);
  }

  onReportReady(data: any) {
    if (data) {
      this.updatedReport.push(data);
    }
}

  onReportSaveClick(content) {
    this.modalService.open(content, { centered: true });
  }

  onSaveFilterClick() {
    const requestOption = this.getSelectedFilters();
    if (!isEmpty(this.updatedReport)) {
      let reportList = [];
      
      this.updatedReport.forEach(report => {
        const data = report.getReport();
        data.dataSource.data = '';
        reportList.push(data);
      });
      requestOption.reportConfig = reportList;
      requestOption.isMapShow = this.isShowMapClicked;
    }
    const reqBody = new Object();
    reqBody[this.reportTitle] = requestOption;
    this.modalService.dismissAll();
    this.configService.update('filters', reqBody).subscribe(results => {
      if (results) {
        this.store.dispatch(new GetConfig());
        this.selectedFilters = [];
        this.isDisabled = true;
        this.showReport = false;
        this.isReportChecked =  0;
        this.resetFlexCharts();
        this.reportTitle = '';
        this.toast.show(ToastType.Success, 'TOAST_FILTER_SAVED');
      }
    });
  }

  getFormattedData() {
    if (this.posts) {
      let processedData = (this.selectedFilters['formId'] === this.formId) ? FilterHelpers.GetAllReportColumns(this.mapRegions, this.tags) : [];
      this.posts.results.forEach(reportItem => {
        let params = {
          reportItem: reportItem,
          tags: this.tags,
          attributes: this.filterCategory,
          formId: this.selectedFilters['formId'],
          translate: this.translate
        }
        const individualItem = FilterHelpers.GetAllColumnData(params);
        processedData.push(individualItem);
      });
      this.mapReports.dataSource.data = [...processedData];
      this.resetFlexCharts();
      this.loadFlexchart();
    }
  }

  createFlexComponent() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(FlexmonsterComponent);
    const component = factory.create(this.fmpivot);
    const pivotComponent = <FlexmonsterComponent>component.instance;
    const viewRef = this.viewContainerRef.insert(component.hostView);
    this.viewRef.unshift(viewRef);
    return pivotComponent;
  }

  loadFlexchart() {
    const component = this.createFlexComponent();
    this.scrollWindow();
    component.mapReports = this.mapReports;
    component.reportIndex = this.reportIndex;
    component.beforetoolbarcreated.subscribe((result) => {
      this.onCustomizeToolbar(result.data, result.reportId);
    });
    component.ready.subscribe(($event) => {
      this.onReportReady($event);
    });
    component.removeReport.subscribe(($event) => {
      this.removeFlexChart($event);
    });
  }

  removeFlexChart(index: number) {
    if (this.viewRef && this.viewRef.length > 0) {
      this.viewRef[index].destroy();
    }
    delete this.updatedReport[index];
  }

  resetFlexCharts() {
    if (this.viewRef && this.viewRef.length > 0) {
      for(let index in this.viewRef) {
        this.viewRef[parseInt(index)].destroy();
      };
    }
    this.updatedReport = [];
  }

  getAllReportsData() {
    const request = FilterHelpers.GetPostRequestOptions(this.selectedFilters);
    this.requestOptions.created_after = request.startDate;
    this.requestOptions.created_before = request.endDate;
    this.requestOptions.form = request.formId;
    this.showReport = false;
    this.postService.list(this.requestOptions).subscribe(results => {
      if (results && results.count > 0) {
        this.posts = results;
        this.getFormattedData();
      }
      if (this.isShowMapClicked) {
        this.onShowMap();
      }
      this.showReport = true;
    });
  }

  scrollWindow() {
    setTimeout(() => {
      window.scrollTo(0, 1200);
    }, 200);
  }
}
