import { User } from '@eview/core/models/user';

export interface UserState {
  user: User;
}

export const initialUserState: UserState = {
  user: null
};
