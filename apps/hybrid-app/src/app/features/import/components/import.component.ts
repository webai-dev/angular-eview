import { Component, OnInit, EventEmitter, Output } from '@angular/core'
import { ImportService, CSVMap } from '@eview/core/import/import-service';
import { switchMap, catchError } from 'rxjs/operators';
import { AppState } from '@eview/core/store/states/app.state';
import { Store } from '@ngrx/store';
import {
  FormAttributes
} from '@eview/core/domain/form/form-attribute';
import { selectFormAttributes } from '@eview/core/store/selectors/form-attributes.selector';
import * as lodash from 'lodash';
import { of } from 'rxjs';

@Component({
  selector: 'eview-data-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  uploadedFiles: Array<File>;
  formAttributes: FormAttributes;
  @Output() modalFileUploadCloseEvent = new EventEmitter<string>();
  postColumnsMapping: object = {"post id" : "import_post_id", "post status" : "status", "created": "created", "updated": "updated", "post date": "post_date", "source": "source", "region": "mgmt_lev_1", "district": "mgmt_lev_2", "département": "mgmt_lev_3"}
  constructor (private importService: ImportService, 
  private store: Store<AppState> 
  ) {
  }

  ngOnInit () {
    this.store
      .select(selectFormAttributes)
      .subscribe(
        formAttributes =>
          (this.formAttributes = formAttributes)
      );
  }

  fileChange (element) {
    this.uploadedFiles = element.target.files;
  }

  fetchMapColumns(columns: string[]) {
    let defaultMapping: CSVMap = {columns: [], maps_to: [], fixed: {}};
    let mapsTo = [];  const fixed = {"form": 1, "published_to":["admin"]};

    if (columns && !lodash.isEmpty(columns)) {
      columns.forEach((attr, index) => {
        let value = attr.toLowerCase();        
        if (this.postColumnsMapping[value] !== undefined) {
          mapsTo.push(this.postColumnsMapping[value]);
        } else {
          let actualValue;
          const attributeArr = attr.split('.');
          let matchedAttribute = this.formAttributes.results.filter( item => (item.label === attributeArr[0]));
          if (!lodash.isEmpty(matchedAttribute)) {
            if (matchedAttribute[0].type === 'title') {
              actualValue = 'title';
            } else if (matchedAttribute[0].type === 'description') {
              actualValue = 'content';
            } else {
              actualValue = (attributeArr && attributeArr[1]) ? matchedAttribute[0].key + "." + attributeArr[1] : matchedAttribute[0].key;
            }
          } else {
            columns[index] = null;
            actualValue = null;
          }
          mapsTo.push(actualValue);
        }
      });
    }
    if (mapsTo.length === columns.length) {
      defaultMapping = {
        columns: columns,
        maps_to: mapsTo,
        fixed: fixed
      }
    }
    return defaultMapping;
  }

  uploadFile () {
    let formData = new FormData();
    
    for (var i = 0; i < this.uploadedFiles.length; i++) {
     formData.append(
        'file', 
        this.uploadedFiles[i],
        this.uploadedFiles[i].name
      )
    }
    //make http call
    this.importService.upload(formData).pipe(
      switchMap(result => {
        if (result && result.id) {
          const data = this.fetchMapColumns(result.columns);
          return this.importService.mapAttributes(data, result.id);
        }
        return of(null);
      }),
      switchMap(result => this.importService.importCSV(result.id)),
      catchError(() => {
        this.modalFileClose(false);
        return of(null);
      })
      )
      .subscribe((response) => {
      this.modalFileClose(true);
    });
  }

  modalFileClose(param) {
      this.modalFileUploadCloseEvent.emit(param);
  }
}
