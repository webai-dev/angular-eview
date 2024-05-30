import {
  Component,
  OnDestroy,
  OnInit,
  Input,
  Output,
  EventEmitter
} from '@angular/core';
import { environment } from '@eview/core/environments/environment';


@Component({
  selector: 'eview-post-flexmonster',
  template: `
  <div class="mt-2">
    <fm-pivot
      [toolbar]="true"
      (beforetoolbarcreated)="onCustomizeToolbar($event)"
      (ready)="onReportReady($event)"
      [report]="mapReports"
      [licenseKey]="licenseKey"
    >
    </fm-pivot>
    </div>
  `
})

export class FlexmonsterComponent implements OnInit, OnDestroy {

  @Input() mapReports: any;
  @Input() reportIndex: number;
  @Output() ready: EventEmitter<any> = new EventEmitter();
  @Output() beforetoolbarcreated: EventEmitter<any> = new EventEmitter();
  @Output() removeReport: EventEmitter<number> = new EventEmitter();

  licenseKey: string = (environment.flexmonster)? environment.flexmonster.licenseKey : '';

  ngOnInit() {
  }

  onReportReady(event) {
    this.ready.emit(event);
  }

  onCustomizeToolbar(event) {
    this.beforetoolbarcreated.emit({data:event, reportId: this.reportIndex});
  }

  onRemoveReport(index) {
    this.removeReport.emit(index);
  }

  ngOnDestroy() {

  }
}