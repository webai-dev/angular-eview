import { UserExtra } from '@eview/core/models/user-extra';

export interface UserExtraState {
  userExtra: UserExtra;
}

export const initialUserExtraState: UserExtraState = {
  userExtra: null
};
