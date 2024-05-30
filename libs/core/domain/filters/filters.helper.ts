import * as moment from 'moment';
import { isEmpty, cloneDeep, groupBy } from 'lodash';
import { environment } from '../../environments/environment';
import { ReportRecordType, FormFields } from '@eview/core/domain/filters/filterCriteria';
import { PostHelpers } from '@eview/core/domain/post/post.helpers';
import {
  PostStatus,
  PostPriority,
  PostManagementLevel,
  PostFilters,
  FilterItem
} from '@eview/core/domain/post/post';
import { TranslateService } from '@ngx-translate/core';

const GetStartEndDates = (options: Object) => {
  let startDate, endDate, dateFormat = 'YYYY-MM-DD';

  endDate = moment(new Date()).format(dateFormat);
  switch (parseInt(options['duration'])) {
    case 1:
      startDate = moment(new Date()).subtract('1', 'day').format(dateFormat);
      endDate = moment(new Date()).format(dateFormat);
      break;
    case 2:
      startDate = moment(new Date())
        .subtract('7', 'days').format(dateFormat);
      break;
    case 3:
      startDate = moment(new Date())
        .subtract('30', 'days').format(dateFormat);
      break;
    case 4:
      let fromDate = options['fromdate']
        ? options['fromdate']
        : options['startDate'];
      let todate = options['todate'] ? options['todate'] : options['endDate'];

      if (fromDate && todate) {
        startDate = moment(
          new Date(
            fromDate.year + '-' + fromDate.month + '-' + fromDate.day
          )
        ).format(dateFormat)

        endDate = moment(
          new Date(
            todate.year + '-' + todate.month + '-' + todate.day
          )
        ).add('1', 'day').format(dateFormat);
      }
      break;
    default:
      startDate = moment(new Date()).format();
      endDate = moment(new Date()).format();
  }
  return { startdate: startDate, enddate: endDate };
};

const CreateMetaData = (infoData: any, configFilters: object) => {
  if (!infoData) {
    return '';
  }
  const config = configFilters['config'];
  const formAttributes = configFilters['formAttributes'];

  const durationType = cloneDeep(
    config[1].values.filter(item => {
      return item.id == infoData['duration'];
    })
  );
  // get region of management level is regional
  const mgmtLabel = config[0].values.filter(ele => {
    return ele.id == infoData.management_level;
  });
  const region = infoData['region'] ? infoData['region'] + ' - ' : '';
  const firstPart = mgmtLabel[0].name + ' : ' + region.toUpperCase();
  // check type category selected
  const category = formAttributes.results.filter(item => {
    return item.key === infoData['category'];
  });
  const secondPart =
    category[0] && category[0].label ? category[0].label + ' ' : '';
  // Format custom date to show range
  if (parseInt(infoData['duration']) === 4) {
    const startDate = moment(
      new Date(
        infoData.startDate.year +
        '-' +
        infoData.startDate.month +
        '-' +
        infoData.startDate.day
      )
    ).format(environment.format.date);
    const endDate = moment(
      new Date(
        infoData.endDate.year +
        '-' +
        infoData.endDate.month +
        '-' +
        infoData.endDate.day
      )
    ).format(environment.format.date);
    durationType[0].name = startDate + ' - ' + endDate;
  }
  const thirdPart = durationType[0] ? '(' + durationType[0].name + ')' : '';
  return { 'title': firstPart + secondPart + thirdPart, 'category': secondPart };
};

const CreateGraph = (data: any, type: number) => {
  if (type === 2 || type === 4) {
    const reportData = data.map(record => {
      if (record) {
        return {
          name: record.label,
          value: record.total
        };
      }
    });
    return reportData;
  } else if (type === 3) {
    let processedData: any = [];
    let temp = groupBy(data, 'label');
    if (!isEmpty(temp)) {
      Object.keys(temp).forEach(record => {
        let series: object[] = [];
        temp[record].map(rec => {
          series.push({
            value: rec.total,
            name: moment(new Date(rec.time_label * 1000))
          });
        });
        processedData.push({ name: record, series: series });
      });
    }
    return processedData;
  }
};

const GetPostRequestOptions = (criteria: any) => {
  let options;
  const dates = GetStartEndDates(criteria);
  options = {
    startDate: dates.startdate,
    endDate: dates.enddate,
    formId: (criteria) ? criteria.formId : environment.form.id
  };
  return options;
};

const CreateTable = (data: any) => {
  if (data.length > 0) {
    const reportData = data.map(record => {
      if (record) {
        return {
          name: record.label,
          value: record.total
        };
      }
    });
    return reportData;
  }
};

const GetAllReportColumns = (mapRegions, tags) =>  {
    if (mapRegions) {
      let processedData: ReportRecordType[] = [], i = 1;
      // Adding data type first
    let temp: ReportRecordType = {} as any;
    for (let key in FormFields) {
        temp[FormFields[key]] = {"type": "string"};
    }
    temp[FormFields.CASUALTY] = {"type": "number"};
    processedData.push(temp);

    for (let region in mapRegions) {
      let temp: ReportRecordType = {} as any;
      for (let key in FormFields) {
        temp[FormFields[key]] = '';
        if (key === 'REGION') {
          temp[FormFields['REGION']] = region;
        }
      }
      const categories = Object.values(tags);
      temp[FormFields['TYPE_OF_INCIDENT']] = (categories[i]) ? categories[i] : '';
      i++;
      processedData.push(temp);
    };
    return processedData;
  }
}

const GetAllColumnData = (params) =>  {
    const {reportItem, tags, attributes, formId, translate }  = params;
    if (reportItem && reportItem !== undefined) {
      let individualItem: any = {};
        if (formId === 1) {
          individualItem[FormFields.PRIORITY] = reportItem.priority;
          individualItem[FormFields.DATE] = moment(reportItem.post_date).format(environment.format.date);
        }
        individualItem[FormFields.TITLE] = reportItem.title;

        if (reportItem && !isEmpty(reportItem.mgmt_lev_1)) {
          individualItem[FormFields.REGION] = reportItem.mgmt_lev_1;
        }
        if (reportItem && !isEmpty(reportItem.mgmt_lev_2)) {
          individualItem[FormFields.ZONE] = reportItem.mgmt_lev_2;
        }
        if (reportItem && !isEmpty(reportItem.mgmt_lev_3)) {
          individualItem[FormFields.WOREDA] = reportItem.mgmt_lev_3;
        }
        if (reportItem && !isEmpty(reportItem.status)) {
          individualItem[FormFields.INCIDENT_STATUS] = translate.instant(PostHelpers.GetStatusLabel(reportItem.status));
        }

        if (reportItem && reportItem.values) {
          Object.keys(reportItem.values).map(category => {
            if (attributes && attributes.length > 0) {
              const keyFound = attributes.filter(item => {
              return item.key === category;
              });
              if (!isEmpty(keyFound)) {
                const val = reportItem.values[category][0];
                individualItem[keyFound[0].label] =
                  keyFound[0].type === 'tags' ? tags[val] : val;
              }
            }
            
          });
        }
      return individualItem;
    }
}


const GetReport = (results, criteriaList, configAttributes: object) => {
  let allReports = [];
  if (results.length > 0) {
    results.forEach((value, index) => {
      if (value && criteriaList[index]) {
        let report: any = {};
        const metadata = CreateMetaData(criteriaList[index], configAttributes);
        report.title = metadata['title'];
        report.category = metadata['category'];
        if (value) {
          const reportType = parseInt(criteriaList[index]['format']);
          report.type = reportType;
          if (reportType && reportType === 1) {
            report.data = CreateTable(value);
          } else {
            report.data = CreateGraph(value, reportType);
          }
        }
        allReports.push(report);
      }
    });
    return allReports;
  }
};

const GetFilterLabels = (label: string): string => {
  if (label) {
    switch (label) {
      case PostFilters.Status:
        return 'FILTER_LABEL_STATUS';
      case PostFilters.Priority:
        return 'FILTER_LABEL_PRIORITY';
      case PostFilters.Mgmt_Level:
        return 'FILTER_LABEL_MGMT_LEV';
      case PostFilters.Region:
        return 'FILTER_LABEL_MGMT_LEV_1';
      case PostFilters.Zone:
        return 'FILTER_LABEL_MGMT_LEV_2';
      case PostFilters.Woreda:
        return 'FILTER_LABEL_MGMT_LEV_3';
      case PostFilters.Categories:
        return 'FILTER_TAGS';
      default: return '';
    }
  }
};

const GetEnumValues = (enumVal: any) => {
  if (enumVal) {
    let temp = [];
    Object.keys(enumVal).forEach((value) => {
      temp.push(enumVal[value]);
    });
    return temp;
  }
  return [];
};

const GetFilterOptionsByKey = (name: string, regions: object[]): string[] => {

  let keys, values;
  switch (name) {
    case PostFilters.Status:
      keys = GetEnumValues(PostStatus);
      values = [];
      keys.forEach((item: PostStatus) => {
        const obj = {
          name: PostHelpers.GetStatusLabel(item),
          value: item
        }
        values.push(obj);
      });
      return values;
    case PostFilters.Priority:
      keys = GetEnumValues(PostPriority);
      values = [];
      keys.forEach((item: PostPriority) => {
        const obj = {
          name: PostHelpers.GetPostPriorityLabel(item),
          value: item
        }
        values.push(obj);
      });
      return values;
    case PostFilters.Mgmt_Level:
      keys = [PostManagementLevel.Unknown, PostManagementLevel.Subregional, PostManagementLevel.Regional, PostManagementLevel.National];
      values = [];
      keys.forEach((item) => {
        const obj = {
          name: PostHelpers.GetMgmtLevLabel(item),
          value: item
        }
        values.push(obj);
      });
      return values;
    case PostFilters.Region:
      values = [];
      Object.keys(regions).forEach((item) => {
        const obj = {
          name: item,
          value: item
        }
        values.push(obj);
      });
      return values;
    case PostFilters.Zone:
      return [];
    case PostFilters.Woreda:
      return [];
    case PostFilters.Categories:
      return [];
    default: return [];
  }
};

const GetModifiedRegionName = (name: string, actualName: string): string => {
  let region = '';
  if (name === 'DISTRICT AUTONOME ABIDJAN' || name === 'DISTRICT AUTONOME D\'ABIDJAN') {
    region = 'DISTRICT AUTONOME D\'ABIDJAN';
  } else if (name === 'DISTRICT AUTONOME YAMOSSOUKRO' || name === 'DISTRICT AUTONOME DE YAMOUSSOUKRO') {
    region = 'DISTRICT AUTONOME DE YAMOUSSOUKRO';
  }
  else if (name === 'NZI' || name === 'N\'ZI') {
    region = 'N\'ZI';
  }
  else {
    const nameToCompare = actualName.replace(/\'/g, "");
    if (name === nameToCompare) {
      region = actualName;
    } else {
      region = name.replace(/\s+/g, "-");
    }
  }
  return region || '';
}

const GetFilters = (regions): any => {
  let filters: FilterItem[] = [];
  const filterKeys = GetEnumValues(PostFilters);
  if (filterKeys && filterKeys.length > 0) {
    filterKeys.forEach((key) => {
      const filterItem: FilterItem = {
        label: GetFilterLabels(key),
        queryParam: key,
        values: GetFilterOptionsByKey(key, regions)
      }
      filters.push(filterItem);
    });
  }
  return filters;
};

const GetFormattedMapData = (posts): any => {
  const regionDataGroup = groupBy(posts.results, 'mgmt_lev_1');
  const zoneDataGroup = groupBy(posts.results, 'mgmt_lev_2');
  const woredaDataGroup = groupBy(posts.results, 'mgmt_lev_3');

  let regionGroup = [],
    zoneGroup = [], woredaGroup = [];
  for (let area in regionDataGroup) {
    regionGroup.push({ name: area, count: regionDataGroup[area].length });
  }
  for (let area in zoneDataGroup) {
    zoneGroup.push({ name: area, count: zoneDataGroup[area].length });
  }
  for (let area in woredaDataGroup) {
    woredaGroup.push({ name: area, count: woredaDataGroup[area].length });
  }
  return [woredaGroup, zoneGroup, regionGroup];
};
const GetAllowedAttributes = [];
for (let i in FormFields) {
  GetAllowedAttributes.push(FormFields[i].toLowerCase());
}

const GetDateFromObject = (datePassed: any) => {
  const { year, month, day } = datePassed;
  return moment(new Date(year, month - 1, day)).format('YYYY-MM-DD');
}

export const FilterHelpers = {
  GetStartEndDates,
  GetReport,
  GetPostRequestOptions,
  GetAllReportColumns,
  GetAllowedAttributes,
  GetFilters,
  GetFormattedMapData,
  GetModifiedRegionName,
  GetDateFromObject,
  GetAllColumnData
};
