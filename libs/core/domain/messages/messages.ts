
import {
  BaseModel,
  BaseModelArray,
  BaseModelPagedArray,
  BaseModelPagedRequest
} from '@eview/core/base/base-model';

export interface Message {
  id: number;
  contact_id: number;
  user_id: number;
  post_id: number;
  contact: string;
  direction: string;
  type: string;
  data_source: string
}

export interface Messages extends BaseModelPagedArray<Message> {}

export interface MessagesOptions extends BaseModelPagedRequest {
  status?: string;
  data_source?: string;
  post?: number;
  contact?: number;
  created?: Date;
  parent_id?: number;
  box?: string;
}