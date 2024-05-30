import {
  Post,
  PostStatus,
  PostSource,
  PostPriority,
  PostManagementLevel
} from './post';
import { User } from '@eview/core/models/user';
import * as moment from 'moment';
import { MapContext } from '../../models/map';

const GetStatusLabel = (status: PostStatus) => {
  switch (status) {
    case PostStatus.Verified:
      return 'POST_STATUS_VERIFIED';
    case PostStatus.Unverified:
      return 'POST_STATUS_UNVERIFIED';
    case PostStatus.Responded:
      return 'POST_STATUS_RESPONDED';
    case PostStatus.Evaluated:
      return 'POST_STATUS_EVALUATED';
    case PostStatus.Pending:
      return 'POST_STATUS_PENDING';
    default:
      return 'POST_STATUS_ALL';
  }
};

const GetPostPriorityLabel = (priority: PostPriority) => {
  switch (priority) {
    case PostPriority.Urgent:
      return 'POST_PRIORITY_URGENT';
    default:
    case PostPriority.Standard:
      return 'POST_PRIORITY_STANDARD';
  }
};

const FormatStatus = (post: Post): string => GetStatusLabel(post.status);
const FormatSource = (post: Post): string => GetSourceLabel(post.source);

const FormatPriority = (post: Post): string => {
  switch (post.priority) {
    case PostPriority.Urgent:
      return 'POST_PRIORITY_URGENT';
    default:
    case PostPriority.Standard:
      return 'POST_PRIORITY_STANDARD';
  }
};

const FormatDate = (post: Post, date: keyof Post, format: string) =>
  moment(post[date]).format(format);

const ParseMgmtLevels = (
  actual: MapContext
): { mgmt_lev_1: string; mgmt_lev_2: string; mgmt_lev_3: string } => {
  if (!actual)
    return {
      mgmt_lev_1: null,
      mgmt_lev_2: null,
      mgmt_lev_3: null
    };
  const properties = actual.properties || {
    ADM1_NAME: null,
    ADM2_NAME: null,
    ADM3_NAME: null
  };
  return {
    mgmt_lev_1: properties['REGION'],
    mgmt_lev_2: properties['DEPARTMNT'],
    mgmt_lev_3: properties['SOUS_PREF']
  };
};

const FormatMgmtLevels = (post: Post): { key: string; value: string }[] => {
  return [
    {
      key: 'POST_MGMT_LEV_1',
      value: post ? post.mgmt_lev_1 || 'INCONNU' : 'INCONNU'
    },
    {
      key: 'POST_MGMT_LEV_2',
      value: post ? post.mgmt_lev_2 || 'INCONNU' : 'INCONNU'
    },
    {
      key: 'POST_MGMT_LEV_3',
      value: post ? post.mgmt_lev_3 || 'INCONNU' : 'INCONNU'
    }
  ];
};

const GetSourceLabel = (source: PostSource) => {
  switch (source) {
    case PostSource.SMS:
      return 'POST_SOURCE_SMS';
    case PostSource.Twitter:
      return 'POST_SOURCE_TWITTER';
    case PostSource.Email:
      return 'POST_SOURCE_EMAIL';
    default:
    case PostSource.Web:
      return 'POST_SOURCE_WEB';
  }
};

const GetMgmtLevLabel = (mgmtLev: PostManagementLevel): string => {
  switch (mgmtLev) {
    case PostManagementLevel.Subregional:
      return 'POST_MGMT_LEV_OPT_1';
    case PostManagementLevel.Regional:
      return 'POST_MGMT_LEV_OPT_2';
    case PostManagementLevel.National:
      return 'POST_MGMT_LEV_OPT_3';
  }
  return 'POST_MGMT_LEV_OPT_0';
};


const FormatMgmtLev = (post: Post): string => GetMgmtLevLabel(post.mgmt_lev);

const FormatUser = (user_id: number, users: User[]): string => {
  const user = users ? users.find(u => u.id == user_id) : null;
  return user ? '"' + user.realname + '"' : '';
};

export const PostHelpers = {
  GetStatusLabel,
  GetSourceLabel,
  FormatStatus,
  FormatPriority,
  FormatSource,
  FormatDate,
  ParseMgmtLevels,
  FormatMgmtLevels,
  GetMgmtLevLabel,
  FormatMgmtLev,
  FormatUser,
  GetPostPriorityLabel
};
