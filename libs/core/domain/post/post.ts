import {
  BaseModel,
  BaseModelArray,
  BaseModelPagedArray,
  BaseModelPagedRequest
} from '@eview/core/base/base-model';
import { User } from '@eview/core/models/user';
import { Form } from '../form/form';

export interface Post extends BaseModel {
  id: number;
  user: User;
  parent_id: number;
  parent: { id: number };
  form: Form;
  message: string;
  color: string;
  type: PostType;
  title: string;
  slug: string;
  content: string;
  author_email: string;
  author_realname: string;
  status: PostStatus;
  created: Date;
  updated: Date;
  locale: string;
  values: any;
  post_date: Date;
  tags: any[];
  published_to: any[];
  completed_stages: any[];
  sets: any[];
  linked_posts: number;
  lock: PostLock;
  source: PostSource;
  contact: any;
  data_source_message_id: number;
  import_post_id: number;

  priority: PostPriority;
  mgmt_lev_1: string;
  mgmt_lev_2: string;
  mgmt_lev_3: string;
  mgmt_lev: PostManagementLevel;
  icon: string;
  isEditing?: boolean;
}

export interface Posts extends BaseModelPagedArray<Post> {}

export interface PostLock extends BaseModel {
  user: User;
  post_id: number;
  expires: number;
}

export interface PostLocks extends BaseModelArray<PostLock> {}

export enum PostType {
  Report = 'report'
}

export enum PostStatus {
  All = 'all',
  Pending = 'draft',
  Verified = 'published',
  Unverified = 'archived',
  Responded = 'responded',
  Evaluated = 'evaluated'
}

export enum PostSource {
  Web = 'web',
  SMS = 'sms',
  Twitter = 'twitter',
  Email = 'email'
}

export enum PostPriority {
  Standard = 'standard',
  Urgent = 'urgent'
}

export enum PostManagementLevel {
  Unknown = 0,
  Subregional = 1,
  Regional = 2,
  National = 3
}

export enum PostFilters {
  Status = 'status',
  Priority = 'priority',
  Mgmt_Level = 'mgmt_lev',
  Region = 'mgmt_lev_1',
  Zone = 'mgmt_lev_2',
  Woreda = 'mgmt_lev_3',
  Categories = 'tags',
}

export interface ListPostOptions extends BaseModelPagedRequest {
  status: PostStatus;
  form?: number;
  has_location?: string;
  source?: PostSource;
  tags?: number;
  parent?: any;
  post_id?: number;
  created_before?: Date;
  created_after?: Date;
  parent_id?: number;
  formId?: number;
}

export interface FilterOptions {
  mgmt_level: string;
  start_date: Date;
  end_date: Date;
  category: string;
}

export interface FilterItem {
  label: string,
  queryParam: string,
  values: any[]
}