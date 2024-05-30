import { BaseModel, BaseModelArray } from '@eview/core/base/base-model';

export interface FormAttribute extends BaseModel {
  id: number;
  key?: string;
  label: string;
  instructions?: string;
  input: FormAttributeInput;
  type: FormAttributeType;
  required: boolean;
  default?: string | number;
  priority: number;
  options?: any[];
  cardinality?: number;
  config?: FormAttributeConfig[];
  form_stage_id: number;
  response_private?: boolean;
}

export interface FormAttributes extends BaseModelArray<FormAttribute> {}

export enum FormAttributeInput {
  Location = 'location',
  Text = 'text',
  Tags = 'tags',
  TextArea = 'textarea',
  Number = 'number',
  Date = 'date',
  DateTime = 'datetime',
  Select = 'select',
  Radio = 'radio',
  Checkbox = 'checkbox',
  Video = 'video',
  Upload = 'upload'
}

export enum FormAttributeType {
  Point = 'point',
  Title = 'title',
  Description = 'description',
  Tags = 'tags',
  // 'Content' is an alias for 'Description'.
  Content = 'description',
  Varchar = 'varchar',
  Text = 'text',
  Decimal = 'decimal',
  Int = 'int',
  DateTime = 'datetime',
  Media = 'media',
  Radio = 'radio',
  Select = 'select',

  // Custom entries, needed to handle common use cases.
  Checkbox = 'checkbox'
}

export const FormAttributeConfigs: {
  input: FormAttributeInput;
  type: FormAttributeType;
  text: string;
}[] = [
  {
    input: FormAttributeInput.Text,
    type: FormAttributeType.Title,
    text: 'POST_ATTRIBUTE_TYPE_TITLE'
  },
  {
    input: FormAttributeInput.Text,
    type: FormAttributeType.Description,
    text: 'POST_ATTRIBUTE_TYPE_DESCRIPTION'
  },
  {
    input: FormAttributeInput.Text,
    type: FormAttributeType.Varchar,
    text: 'POST_ATTRIBUTE_TYPE_SHORT_TEXT'
  },
  {
    input: FormAttributeInput.TextArea,
    type: FormAttributeType.Text,
    text: 'POST_ATTRIBUTE_TYPE_LONG_TEXT'
  },
  {
    input: FormAttributeInput.Number,
    type: FormAttributeType.Int,
    text: 'POST_ATTRIBUTE_TYPE_NUMBER_INTEGER'
  },
  {
    input: FormAttributeInput.Number,
    type: FormAttributeType.Decimal,
    text: 'POST_ATTRIBUTE_TYPE_NUMBER_DECIMAL'
  },
  {
    input: FormAttributeInput.Location,
    type: FormAttributeType.Point,
    text: 'POST_ATTRIBUTE_TYPE_LOCATION'
  },
  {
    input: FormAttributeInput.Date,
    type: FormAttributeType.DateTime,
    text: 'POST_ATTRIBUTE_TYPE_DATE'
  },
  {
    input: FormAttributeInput.DateTime,
    type: FormAttributeType.DateTime,
    text: 'POST_ATTRIBUTE_TYPE_DATETIME'
  },
  {
    input: FormAttributeInput.Select,
    type: FormAttributeType.Varchar,
    text: 'POST_ATTRIBUTE_TYPE_SELECT'
  },
  {
    input: FormAttributeInput.Radio,
    type: FormAttributeType.Varchar,
    text: 'POST_ATTRIBUTE_TYPE_RADIOBUTTONS'
  },
  {
    input: FormAttributeInput.Checkbox,
    type: FormAttributeType.Varchar,
    text: 'POST_ATTRIBUTE_TYPE_CHECKBOXES'
  },
  {
    input: FormAttributeInput.Upload,
    type: FormAttributeType.Media,
    text: 'POST_ATTRIBUTE_TYPE_MEDIA'
  },
  {
    input: FormAttributeInput.Video,
    type: FormAttributeType.Varchar,
    text: 'POST_ATTRIBUTE_TYPE_URL'
  },
  {
    input: FormAttributeInput.Tags,
    type: FormAttributeType.Tags,
    text: 'POST_ATTRIBUTE_TYPE_TAGS'
  }
];

export interface FormAttributeConfig {
  id: number;
  action: FormAttributeConfigAction;
  target: FormAttributeConfigTarget;
}

export enum FormAttributeConfigAction {
  Show = 'show',
  Hide = 'hide'
}

export const FormAttributeConfigActions: {
  action: FormAttributeConfigAction;
  text: string;
}[] = [
  {
    action: FormAttributeConfigAction.Show,
    text: 'POST_ATTRIBUTE_ACTION_SHOW'
  },
  {
    action: FormAttributeConfigAction.Hide,
    text: 'POST_ATTRIBUTE_ACTION_HIDE'
  }
];

export interface FormAttributeConfigTarget {
  key: string;
  value: any;
}
