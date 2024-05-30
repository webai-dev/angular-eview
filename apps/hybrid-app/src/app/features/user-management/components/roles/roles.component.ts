import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Roles } from '@eview/core/models/roles';
import { selectRoles } from '@eview/core/store/selectors/roles.selector';
import { AppState } from '@eview/core/store/states/app.state';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { AuthHelpers } from '@eview/core/auth';
import { AllowedPriviledge } from '@eview/core/auth/auth';
import { Observable, Subscription } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { UserService } from '@eview/core/users/user.service';
import { GetRoles } from '@eview/core/store/actions/auth.actions';

@Component({
  selector: 'eview-roles-management',
  templateUrl: 'roles.component.html',
  styleUrls: ['roles.component.scss']
})
export class RolesComponent implements OnInit, OnDestroy {
  constructor(
    private store: Store<AppState>,
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.createRoleForm();
  }

  createRoleForm() {
    this.roleForm = this.formBuilder.group({
      name: ['', Validators.required],
      display_name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  onCancelClick() {
    this.isEditing = false;
    this.isAddUserClick = false;
    this.roleForm.reset();
  }

  onEditClick(id: number) {
    this.isEditing = true;
    this.roles$.pipe(
      map(data => data.results),
      ).subscribe((item) => {
      const role = item[id];
      if (role) {
        this.editId = role.id;
        this.roleForm.patchValue({
            name: role.name,
            display_name: role.display_name,
            description: role.description
        });
      }
    })
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  onDeleteClick(index: number) {
    this.selectedId = index;
  }

  onConfirmClick(roleId: number) {
    if (roleId) {
      this.userService.deleteRole(roleId).subscribe(() => {
        this.selectedId = -1;
        this.store.dispatch(new GetRoles());
      });
    }
  }

  onSubmitClick() {
    const reqBody = this.roleForm.value;
    if (!this.isEditing) {
      this.userService.addRoles(reqBody).subscribe(results => {
        this.isAddUserClick = false;
        this.roleForm.reset();
        this.store.dispatch(new GetRoles());
      });
    } else {
      this.userService.updateRoles(reqBody, this.editId).subscribe(results => {
        this.isEditing = false;
        this.roleForm.reset();
        this.store.dispatch(new GetRoles());
      });
    }
     
  }

  subs: Subscription;

  AuthHelpers = AuthHelpers;

  roleForm: FormGroup;

  AllowedPriviledge = AllowedPriviledge;

  isAddUserClick: boolean = false;

  selectedId: number = -1;

  editId: number = -1;

  isEditing: boolean = false;

  roles$: Observable<Roles> = this.store.select(selectRoles);
}
