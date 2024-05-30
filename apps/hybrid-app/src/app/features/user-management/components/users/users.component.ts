import {
  Component,
  OnDestroy,
  OnInit,
  Inject,
  ViewContainerRef
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Roles, RoleItem } from '@eview/core/models/roles';
import { Post } from '@eview/core/domain/post/post';
import { User, Users, Contacts, ListUserOptions } from '@eview/core/models/user';
import { selectRoles } from '@eview/core/store/selectors/roles.selector';
import { AppState } from '@eview/core/store/states/app.state';
import { Permission } from '@eview/core/auth/permission';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { AuthHelpers } from '@eview/core/auth';
import { AllowedPriviledge } from '@eview/core/auth/auth';
import { PostHelpers } from '@eview/core/domain/post/post.helpers';
import { ContactType } from '@eview/core/models/user';
import { Observable, Subscription, of } from 'rxjs';
import { selectUser } from '@eview/core/store/selectors/user.selector';
import { UserService } from '@eview/core/users/user.service';
import { ListUsers } from '@eview/core/store/actions/users.actions';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastType } from '../../../toast/toast.component';
import { ToastService } from '../../../toast/toast.service';
import { UsersHelpers } from '@eview/core/users/users.helpers';
import { OrderSort } from '@eview/core/models/commons';
import {
  map,
  debounceTime,
  filter,
  tap,
  switchMap,
  catchError
} from 'rxjs/operators';

const PAGE_SIZE = 20;

@Component({
  selector: 'eview-users-management',
  templateUrl: 'users.component.html',
  styleUrls: ['users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  model: string
  subs: Subscription;

  AuthHelpers = AuthHelpers;

  userForm: FormGroup;

  contactForm: FormGroup;

  contactTypes: string[] = [];

  AllowedPriviledge = AllowedPriviledge;

  isAddUserClick: boolean = false;

  selectedId: number = -1;

  selectedContactId: number = -1;

  editId: number = -1;

  editContactId: number = -1;

  Permission = Permission;

  post: Post;

  listOption: ListUserOptions;

  contacts: Contacts[];

  PostHelpers = PostHelpers;

  isEditing: boolean = false;

  showContact: boolean = false;

  userId: number;

  users: User[];

  roles: RoleItem[];

  loggedinUser: User;

  UsersHelpers = UsersHelpers;

  currentPage: number = 0;

  offset: number = 0;

  limit: number = PAGE_SIZE;

  user$: Observable<User> = this.store.select(selectUser);

  roles$: Observable<Roles> = this.store.select(selectRoles);

  public searchFailed: boolean = false;

  public isSearchingByAddress: boolean = false;

  public total_count: number = 0;

  public formatter = (result: any) => result.realname;

  constructor(
    private store: Store<AppState>,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private modalService: NgbModal,
    private toast: ToastService,
    @Inject(ViewContainerRef) private viewContainerRef: ViewContainerRef,
  ) {
    this.subs = new Subscription();
    toast.setViewContainerRef(viewContainerRef);
  }

  ngOnInit() {
    this.subs.add(
      this.user$.subscribe((userDetails) => {
        this.loggedinUser = userDetails;
      })
    );
    this.subs.add(
      this.roles$.subscribe((data) => {
        this.roles = data.results;
      })
    );
    this.getUsersList();
    this.createUserForm();
  }

  getUsersList() {
    this.listOption = {
      offset: this.offset,
      limit: this.limit,
      orderby: 'realname',
      order: OrderSort.Asc
    };
    this.subs.add(
      this.userService.list(this.listOption).subscribe((data) => {
        this.users = data.results;
        this.total_count = data.total_count;
      })
    );
  }

  createUserForm() {
    this.userForm = this.formBuilder.group({
      realname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(7)]],
      role: ['', Validators.required]
    });
  }

  createContactForm() {
    this.contactTypes = Object.keys(ContactType);
    this.contactForm = this.formBuilder.group({
      type: ['', Validators.required],
      contact: ['', [Validators.required]]
    });
  }

  onContactClick(user) {
    this.contacts = user.contacts;
    this.userId = user.id;
    this.isAddUserClick = true;
  }

  onAddContactClick(content) {
    this.showContact = true;
    this.createContactForm();
    this.modalService.open(content, { centered: true });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onDeleteClick(index: number) {
    this.selectedId = index;
  }

  onCancelClick() {
    this.isEditing = false;
    this.userForm.reset();
  }

  onConfirmClick(userId: number) {
    if (userId) {
      this.userService.deleteUser(userId).subscribe(() => {
        this.selectedId = -1;
        this.store.dispatch(new ListUsers());
      });
    }
  }

  onAddUserClick(content) {
    this.userForm.reset();
    this.modalService.open(content, { centered: true });
  }

  onEditClick(content, id) {
    this.isEditing = true;
    const user = this.users[id];
    if (user) {
      this.editId = user.id;
      this.userForm.patchValue({
        realname: user.realname,
        email: user.email,
        role: user.role
      });
    }
    this.modalService.dismissAll();
    this.modalService.open(content, { centered: true });
  }

  onEditContactClick(content, i) {
    this.createContactForm();
    this.isEditing = true;
    const contact = this.contacts[i];
    if (contact) {
      this.editContactId = contact.id;
      this.contactForm.patchValue({
        type: contact.type,
        contact: contact.contact
      });
    }
    this.modalService.dismissAll();
    this.modalService.open(content, { centered: true });
  }

  onSubmitClick() {
    const reqBody = this.userForm.value;
    if (!this.isEditing) {
      this.userService.register(reqBody).subscribe(results => {
        this.userForm.reset();
        this.store.dispatch(new ListUsers());
        this.toast.show(ToastType.Success, 'TOAST_USER_SAVED');
      });
    } else {
      this.userService.updateUser(reqBody, this.editId).subscribe(results => {
        this.isEditing = false;
        this.userForm.reset();
        this.getUsersList();
        // this.store.dispatch(new ListUsers());
      });
    }
    this.modalService.dismissAll();
  }

  onContactConfirmClick(contactId: number, index: number) {
    if (contactId) {
      this.userService.deleteContact(contactId).subscribe(() => {
        this.selectedContactId = -1;
        this.store.dispatch(new ListUsers());
        this.contacts = this.contacts.filter((ele, i) => (i !== index));
        this.isAddUserClick = false;
        this.toast.show(ToastType.Success, 'TOAST_CONTACT_DELETED');
      });
    }
  }

  onContactSubmitClick() {
    const reqBody: Contacts = this.contactForm.value;
    reqBody.type = reqBody.type;
    reqBody.user_id = this.userId;
    reqBody.data_source = 'web';
    if (this.showContact) {
      this.userService.addContacts(reqBody).subscribe(results => {
        this.contactForm.reset();
        this.store.dispatch(new ListUsers());
        this.toast.show(ToastType.Success, 'TOAST_CONTACT_SAVED');
      });
    } else {
      this.userService.updateContact(reqBody, this.editContactId).subscribe(results => {
        this.isEditing = false;
        this.userForm.reset();
        this.store.dispatch(new ListUsers());
        this.toast.show(ToastType.Success, 'TOAST_CONTACT_UPDATED');
      });
    }
    this.isAddUserClick = false;
    this.modalService.dismissAll();
  }

  pageChanged(pageNumber) {
    this.currentPage = pageNumber;
    this.offset = (pageNumber > 0) ? (pageNumber - 1) * this.limit : 0;
    this.ngOnInit();
  }

  onValueSelected(result) {
    const selectedUser = result && result.item ? result.item : [];
    this.users = this.users.filter(user => (user.realname === selectedUser.realname));
  }

  search = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      tap(() => {
        this.searchFailed = false;
        this.isSearchingByAddress = true;
      }),
      filter(term => {
        if (term.length >= 2) {
          return true;
        } else {
          this.isSearchingByAddress = false;
          return this.isSearchingByAddress;
        }
      }),
      switchMap(address => {
        this.listOption = {
          offset: 0,
          limit: this.limit,
          orderby: 'realname',
          order: OrderSort.Asc,
          q: address
        };

        return this.userService.list(this.listOption).pipe(
          map(data => {
            if (data) {
              this.searchFailed = false;
              this.total_count = data.total_count;
              return data.results.map(res => res);
            } else {
              this.searchFailed = address === '' ? false : true;
              return [];
            }
          }),
          catchError(err => {
            this.searchFailed = true;
            this.isSearchingByAddress = false;
            return of(null);
          })
        )
      }),
      tap((data) => {
        this.users = data;
        this.isSearchingByAddress = false;
        return this.isSearchingByAddress;
      })
    );


}
