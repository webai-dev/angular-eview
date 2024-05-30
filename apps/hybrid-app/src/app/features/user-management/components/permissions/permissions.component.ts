import {
  Component,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Store } from '@ngrx/store';
import { Permissions } from '@eview/core/models/permissions';
import { selectPermissions } from '@eview/core/store/selectors/permissions.selector';
import { AppState } from '@eview/core/store/states/app.state';
import {
  FormGroup,
  FormBuilder,
  Validators
} from '@angular/forms';
import { AuthHelpers } from '@eview/core/auth';
import { AllowedPriviledge } from '@eview/core/auth/auth';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserService } from '@eview/core/users/user.service';
import { GetPermissions } from '@eview/core/store/actions/auth.actions';

@Component({
  selector: 'eview-permissions-management',
  templateUrl: 'permissions.component.html',
  styleUrls: ['permissions.component.scss']
})
export class PermissionsComponent implements OnInit, OnDestroy {
  constructor(
    private store: Store<AppState>,
    private userService: UserService,
    private formBuilder: FormBuilder
  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    this.createpermissionForm();
  }

  createpermissionForm() {
    this.permissionForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  onCancelClick() {
    this.isEditing = false;
    this.isAddUserClick = false;
    this.permissionForm.reset();
  }

  onEditClick(id: number) {
    this.isEditing = true;
    this.permissions$.pipe(
      map(data => data.results),
      ).subscribe((item) => {
      const permission = item[id];
      if (permission) {
        this.editId = permission.id;
        this.permissionForm.patchValue({
            name: permission.name,
            description: permission.description
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

  onConfirmClick(permissionId: number) {
    if (permissionId) {
      this.userService.deletePermission(permissionId).subscribe(() => {
        this.selectedId = -1;
        this.store.dispatch(new GetPermissions());
      });
    }
  }

  onSubmitClick() {
    const reqBody = this.permissionForm.value;
    if (!this.isEditing) {
      this.userService.addPermissions(reqBody).subscribe(results => {
        this.isAddUserClick = false;
        this.permissionForm.reset();
        this.store.dispatch(new GetPermissions());
      });
    } else {
      this.userService.updatePermissions(reqBody, this.editId).subscribe(results => {
        this.isEditing = false;
        this.permissionForm.reset();
        this.store.dispatch(new GetPermissions());
      });
    }
     
  }

  subs: Subscription;

  AuthHelpers = AuthHelpers;

  permissionForm: FormGroup;

  AllowedPriviledge = AllowedPriviledge;

  isAddUserClick: boolean = false;

  selectedId: number = -1;

  editId: number = -1;

  isEditing: boolean = false;

  permissions$: Observable<Permissions> = this.store.select(selectPermissions);
}
