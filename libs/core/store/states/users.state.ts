import { UserState } from './user.state';
import { Users } from '@eview/core/models/user';

export interface UsersState {
  users: Users;
}

export const initialUsersState: UsersState = {
  users: null
};
