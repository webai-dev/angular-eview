import { PostComment } from './post-comment';

import * as moment from 'moment';

const FormatDate = (
  comment: PostComment,
  date: keyof { created: Date; updated: Date },
  format: string
) => moment(comment[date]).format(format);

export const PostCommentHelpers = { FormatDate };
