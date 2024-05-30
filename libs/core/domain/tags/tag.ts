import { BaseModel, BaseModelArray } from '../../base/base-model';

export interface Tag extends BaseModel {
  id: number;
  parent?: { id: number };
  parent_id?: number;
  tag: string;
  slug?: string;
  type: string;
  color?: string;
  icon?: string;
  description?: string;
  priority?: number;
  created?: Date;
  role?: string;
  children?: { id: number }[];
}

export interface Tags extends BaseModelArray<Tag> {}
