import { BaseModel, BaseModelArray } from '@eview/core/base/base-model';

export interface Form extends BaseModel {
  id: number;
  name?: string;
  description?: string;
  type?: string;
  disabled?: boolean;
}

export interface Forms extends BaseModelArray<Form> {}
