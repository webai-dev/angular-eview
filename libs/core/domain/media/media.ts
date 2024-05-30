import { BaseModel, BaseModelArray } from '../../base/base-model';

export interface Media extends BaseModel {
  user_id: number;
  caption: string;
  created: Date;
  updated: Date;
  mime: string;
  original_file_url: string;
  original_file_size: number;
  original_width: number;
  original_height: number;
}

export interface Medias extends BaseModelArray<Media> {}
