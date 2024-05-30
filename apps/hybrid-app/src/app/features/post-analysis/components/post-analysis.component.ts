import { Component, OnDestroy, OnInit, Inject, ViewContainerRef, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { FormAttributes, FormAttributeType } from '@eview/core/domain/form/form-attribute';
import { FilterCriteria, FormFields } from '@eview/core/domain/filters/filterCriteria';
import { FilterHelpers } from '@eview/core/domain/filters/filters.helper';
import { selectMap } from '@eview/core/store/selectors/map.selector';
import { selectTags } from '@eview/core/store/selectors/tags.selector';
import { PostService } from '@eview/core/domain/post/post.service';
import { selectConfig } from '@eview/core/store/selectors/config.selector';
import { GetConfig } from '@eview/core/store/actions/config.actions';
import { ConfigService } from '@eview/core/config/config.service';
import { environment } from '@eview/core/environments/environment';
import { AppState } from '@eview/core/store/states/app.state';
import { selectFormAttributes } from '@eview/core/store/selectors/form-attributes.selector';
import { ToastType } from '../../toast/toast.component';
import { ToastService } from '../../toast/toast.service';
import { Subscription } from 'rxjs';
import { includes, omit, isEmpty } from 'lodash';
import { PostHelpers } from '@eview/core/domain/post/post.helpers';
import { NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { ngbDateCustomFmt } from '../../shared/ngb-date-custom-fmt';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  ListPostOptions,
  PostStatus,
  Posts
} from '@eview/core/domain/post/post';
import * as moment from 'moment';
import { Tags } from '@eview/core/domain/tags/tag';
import { FlexMonsterConfig as ReportJson } from '../../post-filters/components/report-format';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import html2canvas from 'html2canvas';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { ListFormAttributes } from '@eview/core/store//actions/form-attributes.actions';

@Component({
  selector: 'eview-post-analysis',
  templateUrl: 'post-analysis.component.html',
  styleUrls: ['post-analysis.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: ngbDateCustomFmt }]
})
export class PostAnalysisComponent implements OnInit, OnDestroy {
  private subs: Subscription;
  private formAttributes: FormAttributes;
  private filterCategory;
  savedReportsList: any[] = [];
  private mapRegions: any[] = [];
  selectedReport: any;
  private updatedReport: any;
  private isDeleted: boolean = false;
  showReport: boolean = false;
  public graphType: number = 4;
  private regionalMapData: any = [];
  posts: Posts = { count: 0, results: [] };
  private filterCriteria: FilterCriteria[] = [];
  private mapReports: any = ReportJson;
  private tags: Tags[] = [];
  private reportData: any = [];
  protected fromdate: Date;
  protected todate: Date;
  private formId: number = environment.form.id;
  @ViewChild('content', { static: false }) myModal;
  private licenseKey: string = (environment.flexmonster) ? environment.flexmonster.licenseKey : '';
  PostHelpers = PostHelpers;
  protected active: number = 1;

  constructor(
    private store: Store<AppState>,
    private postService: PostService,
    private configService: ConfigService,
    @Inject(ViewContainerRef) private viewContainerRef: ViewContainerRef,
    private toast: ToastService,
    private modalService: NgbModal,
    private translate: TranslateService
  ) {
    this.subs = new Subscription();
    toast.setViewContainerRef(viewContainerRef);
    const currentLang = this.translate.currentLang;
    this.mapReports.localization = `/assets/i18n/flexmonster-localization-${currentLang}.json`
  }

  ngOnInit() {
    this.getFormFields();
    this.subs.add(
      this.translate.onLangChange.subscribe((langChangeEvent: LangChangeEvent) => {
        this.mapReports.localization = `/assets/i18n/flexmonster-localization-${langChangeEvent.lang}.json`

      })
    )

    this.filterCategory = this.formAttributes.results.filter(item => {
      let category = item.label.trim().toLowerCase();
      return includes(FilterHelpers.GetAllowedAttributes, category);
    });

    this.subs.add(this.store.select(selectTags).subscribe((tags: any) => {
      tags.results.forEach(item => {
        this.tags[item.id] = item.tag;
      });
    })
    );
    this.subs.add(this.store.select(selectMap).subscribe(map => {
      if (map) {
        this.mapRegions = map.regions;
      }
    })
    );

    this.subs.add(this.store.select(selectConfig).subscribe((config: any) => {
      const filterData = config.results.filter(item => {
        return item.id === 'filters';
      });
      // format data for view
      this.filterCriteria = filterData && filterData[0] ? filterData[0] : [];
      this.filterCriteria = omit(this.filterCriteria, ['filters', 'allowed_privileges', 'id', 'url']);
      for (let i in this.filterCriteria) {
        if (this.filterCriteria[i] && !this.filterCriteria[i].formId) {
          this.filterCriteria[i]['formId'] = 1;
        }
      }
    })
    );
    this.onShowReport();
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
            if (this.formId === 1) {
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

  deleteReport() {
    this.modalService.open(this.myModal, { centered: true });
  }

  generatePdf() {
    this.toast.show(ToastType.Success, 'DOWNLOAD_MSG');
    setTimeout(() => {
      const chart = document.getElementById('report-cluster');
      html2canvas(chart, {
        height: 1500,
        width: 1000,
        scale: 5,
        backgroundColor: null,
        logging: false,
        onclone: document => {
          document.getElementById('report-cluster').style.visibility = 'visible';
          document.getElementById('fm-toolbar-wrapper').style.display = 'none';
          chart.style.visibility = 'visible';
          chart.style.alignContent = 'center';
        }
      }).then(canvas => {
        const chartData = canvas.toDataURL();
        const docDefinition = {
          content: [],
          styles: {
            subheader: {
              fontSize: 10,
              bold: true,
              alignment: 'center'
            }
          },
          defaultStyle: {
            alignment: 'center'
          }
        };
        const title = { text: 'Analysis Report', style: 'subheader' };
        docDefinition.content.push(title);
        docDefinition.content.push({ image: chartData, width: 500 });
        pdfMake.createPdf(docDefinition).download('analysis-report' + '.pdf');
      });
    }, 500);
  }

  getFormatReportData() {
    if (this.posts) {
      // let processedData = FilterHelpers.GetAllReportColumns(this.mapRegions, this.tags);
      let processedData = (this.formId === 1) ? FilterHelpers.GetAllReportColumns(this.mapRegions, this.tags) : [];
      this.posts.results.forEach(reportItem => {
        let params = {
          reportItem: reportItem,
          tags: this.tags,
          attributes: this.filterCategory,
          formId: this.formId,
          translate: this.translate
        }
        const individualItem = FilterHelpers.GetAllColumnData(params);
        processedData.push(individualItem);
      });
      return processedData;
    }
  }

  onCustomizeToolbar(toolbar) {
    let tabs = toolbar.getTabs();
    toolbar.getTabs = function () {
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
          title: "Update",
          handler: "onUpdateReport",
          icon: '<img width="36" height="36" style="border: 1px solid darkgrey;padding: 2px;margin-bottom: 7px;border-radius: 5px;" src="/assets/images/update.svg" />'
        },
        {
          id: "fm-tab-maptab",
          title: "Remove",
          handler: "onDeleteReport",
          icon: '<img width="36" height="36" style="border: 1px solid darkgrey;padding: 2px;margin-bottom: 7px;border-radius: 5px;" src="/assets/images/cross-remove-sign.svg" />'
        }
      ];
      tabs = tabs.slice(3, 4);
      tabs.splice(1, 1, mapTab[1]);
      return tabs;
    };
    toolbar.onUpdateReport = () => {
      this.onUpdateReportClick();
    }
    toolbar.onDeleteReport = () => {
      this.modalService.open(this.myModal, { centered: true });
    }
  }

  onShowMap() {
    this.regionalMapData = FilterHelpers.GetFormattedMapData(this.posts);
  }

  onConfirmClick() {
    this.isDeleted = true;
    this.modalService.dismissAll();
    this.onUpdateReportClick();
  }

  onReportReady(data: any) {
    if (data) {
      this.updatedReport = data;
      this.reportData.push(data);
    }
  }

  onUpdateReportClick() {
    let messageType = ToastType.Success;
    let message = 'TOAST_FILTER_UPDATED';
    let temp = [];
    const requestOption = this.filterCriteria[this.selectedReport];
    if (!isEmpty(this.reportData)) {
      this.reportData.forEach((report) => {
        const settings = report.getReport();
        settings.dataSource.data = '';
        temp.push(settings);
      });
      requestOption.reportConfig = temp;
    }

    if (this.isDeleted) {
      requestOption.isDelete = true;
      messageType = ToastType.Success;
      message = 'TOAST_FILTER_DELETED';
      this.showReport = false;
      this.savedReportsList = this.savedReportsList.filter(report => (report !== this.selectedReport));
    }
    const reqBody = new Object();
    reqBody[this.selectedReport] = requestOption;
    this.subs.add(this.configService
      .update('filters', reqBody)
      .subscribe(results => {
        if (results) {
          this.store.dispatch(new GetConfig());
          this.toast.show(messageType, message);
        }
      })
    );
  }

  getAllReportsData() {
    this.reportData = [];
    if (this.selectedReport) {
        const seletedValue = this.filterCriteria[this.selectedReport];
        seletedValue.startDate = (this.fromdate) ? this.fromdate : seletedValue.startDate;
        seletedValue.endDate = (this.todate) ? this.todate : seletedValue.endDate
        const request = FilterHelpers.GetPostRequestOptions(seletedValue);
        let requestOptions: ListPostOptions = {
          status: PostStatus.All,
          created_after: request.startDate,
          created_before: request.endDate,
          form: this.formId
        };
        if (seletedValue.isReport) {
          requestOptions.parent = null;
        }
        this.showReport = false;
        this.postService.list(requestOptions).subscribe(results => {
          if (results && results.count > 0) {
            this.posts = results;
            this.mapReports = seletedValue.reportConfig;
            if (this.mapReports.length > 0) {
              this.mapReports.map((report) => {
                report.dataSource.data = [...this.getFormatReportData()];
                return report;
              });
            }
            this.showReport = true;
            if (seletedValue.isMapShow) {
              setTimeout(() => {
                this.onShowMap();
              }, 500);
            }
          }
        });
    }
  }

  onShowReport() {
    if (this.filterCriteria) {
      const keys = Object.keys(this.filterCriteria);
      this.savedReportsList = keys.filter(fa => this.filterCriteria[fa].formId === this.formId);
      this.getAllReportsData();     
    } else {
      console.log('No criteria found for analysis creation.');
    }
  }

  onFormChange(selectedFormId: number) {
    this.formId = selectedFormId;
    const keys = Object.keys(this.filterCriteria);
    this.savedReportsList = keys.filter(fa => this.filterCriteria[fa].formId === this.formId);
    this.store.dispatch(new ListFormAttributes({ id: selectedFormId }));
    this.getFormFields();    
  }
}
