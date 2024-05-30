import { BaseModel, BaseModelArray } from '@eview/core/base/base-model';
import { User } from '@eview/core/models/user';
import { PostStatus } from '../post/post';

export interface ExportJobRequest {
  entity_type: ExportEntityType;
  filters?: {
    status?: string[] | PostStatus[];
  };
}

export interface ExportJob extends BaseModel {
  id: number;
  user: User;
  status: ExportJobStatus;
  url_expiration: number;
}

export interface ExportJobs extends BaseModelArray<ExportJob> {}

export enum ExportJobStatus {
  Pending = 'PENDING',
  Queued = 'QUEUED',
  Success = 'SUCCESS'
}

export enum ExportEntityType {
  Post = 'post'
}
