import { Injectable } from '@angular/core';
import { environment } from '@eview/core';
import {
  NgbDateParserFormatter,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
@Injectable()
export class ngbDateCustomFmt extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct {
    if (value) {
      const date = moment(value);
      return {
        year: date.year(),
        month: date.month() + 1,
        day: date.date()
      };
    }
    return null;
  }

  format(date: NgbDateStruct): string {
    if (!date) return null;
    return moment()
      .year(date.year)
      .month(date.month - 1)
      .date(date.day)
      .format(environment.format.date);
  }
}
