import { Injectable } from '@angular/core';
import { BaseService } from '@eview/core/base/base-service';
import { Observable } from 'rxjs';
import { Users, ListUserOptions, UserRegistration, Permission, Contacts } from '../models/user';
import { Roles, RoleItem } from '../models/roles';
// import { Notifications } from '../domain/notifications/notification';

@Injectable({
  providedIn: 'root'
})
export class UserService extends BaseService {
  readonly uris = {
    list: 'users',
    user_extra: 'users/extra',
    register: 'register',
    add_role: 'roles',
    update_role: 'roles/:id',
    delete_role: 'roles/:id',
    update_user: 'users/:id',
    delete_user: 'users/:id',
    add_permission: 'permissions',
    update_permission: 'permissions/:id',
    delete_permission: 'permissions/:id',
    add_contact: 'contacts',
    delete_contact: 'contacts/:id',
    update_contact: 'contacts/:id'
  };

  list(options: ListUserOptions = null): Observable<Users> {
    return this.http.get<Users>(this.getUrl(this.uris.list), {
      params: this.getParamsFromObject(options)
    });
  }

  register(body: UserRegistration = null): Observable<Users> {
    return this.http.post<Users>(this.getUrl(this.uris.register), body);
  }

  updateRoles(body: RoleItem, id: number): Observable<Roles> {
    return this.http.put<Roles>(
       this.getUrl(this.uris.update_role).replace(':id', id.toString()), body);
  }

  addRoles(body: RoleItem): Observable<Roles> {
    return this.http.post<Roles>(
       this.getUrl(this.uris.add_role), body);
  }

  deleteRole(id: number): Observable<Users> {
    return this.http.delete<Users>(
       this.getUrl(this.uris.delete_role).replace(':id', id.toString()));
  }

  updateUser(body: Users, id: number): Observable<Users> {
    return this.http.put<Users>(
       this.getUrl(this.uris.update_user).replace(':id', id.toString()), body);
  }
  
  deleteUser(id: number): Observable<Users> {
    return this.http.delete<Users>(
       this.getUrl(this.uris.delete_user).replace(':id', id.toString()));
  }

  addPermissions(body: Permission): Observable<Permission> {
    return this.http.post<Permission>(
       this.getUrl(this.uris.add_permission), body);
  }

  updatePermissions(body: Users, id: number): Observable<Users> {
    return this.http.put<Users>(
       this.getUrl(this.uris.update_permission).replace(':id', id.toString()), body);
  }
  
  deletePermission(id: number): Observable<Users> {
    return this.http.delete<Users>(
       this.getUrl(this.uris.delete_permission).replace(':id', id.toString()));
  }

  addContacts(body: Contacts): Observable<Contacts> {
    return this.http.post<Contacts>(
       this.getUrl(this.uris.add_contact), body);
  }

  deleteContact(id: number): Observable<Users> {
    return this.http.delete<Users>(
       this.getUrl(this.uris.delete_contact).replace(':id', id.toString()));
  }

  updateContact(body: Contacts, id: number): Observable<Contacts> {
    return this.http.put<Contacts>(
       this.getUrl(this.uris.update_contact).replace(':id', id.toString()), body);
  }
}
