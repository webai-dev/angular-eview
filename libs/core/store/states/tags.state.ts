import { Tags } from '@eview/core/domain/tags/tag';

export interface TagsState {
  tags: Tags;
}

export const initialTagsState: TagsState = {
  tags: null
};
