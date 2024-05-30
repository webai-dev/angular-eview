import { Users, User } from '../models/user';
import { Roles, RoleItem } from '../models/roles';

const FindUserById = (users: Users, id: number): User =>
  users && users.results ? users.results.find(u => u.id === id) || null : null;

const FormatUserRealname = (user: User): string =>
  user ? user.realname : null;

const GetRoleDisplayname = (roles: RoleItem[], name: string): RoleItem =>
  roles && roles ? roles.find(role => role.name === name) || null : null;

export const UsersHelpers = {
  FindUserById,
  FormatUserRealname,
  GetRoleDisplayname
};
