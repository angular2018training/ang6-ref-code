import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';

import { UserService, UserInfo } from "../services/user.service";

import { VARIABLES, PAGES } from '../constant';

import { DialogOperatorEdit } from '../operator-detail/dialog-operator-edit/dialog-operator-edit.component';
import { DialogCustomerEdit } from '../customer-detail/dialog-customer-edit/dialog-customer-edit.component';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-heading',
  templateUrl: './heading.component.html',
  styleUrls: ['./heading.component.scss']
})
export class HeadingComponent implements OnInit {
  userName;
  role;

  constructor(
    private _LoginService: LoginService,
    private dialog: MatDialog,
    private router: Router,
    private _UserService: UserService,
  ) { }

  ngOnInit() {
    let account = this._UserService.getAuthorization();
    this.userName = account.username;
    this.role = account.role;

    this._UserService.getStatus().subscribe(message => {
      this.userName = message.userName;
    });
  }

  //view
  logout() {
    this._LoginService.logout();
  }
  updateDetail() {
    let roleTitle: string = '';
    let dialogRef;

    if (this.role == 'operator') {
      roleTitle = 'Operator';
    } else if (this.role == 'customer') {
      roleTitle = 'Customer';
    }

    if (roleTitle === 'Operator') {
      dialogRef = this.dialog.open(DialogOperatorEdit, {
        width: '50%',
        height: '90%',
        data: {
          title: 'Edit ' + roleTitle + ' Information'
        }
      });
    } else if (roleTitle === 'Customer') {
      dialogRef = this.dialog.open(DialogCustomerEdit, {
        width: '50%',
        height: '90%',
        data: {
          // title: 'Edit ' + roleTitle + ' Information'
          title: 'Edit ' + ' Information'
        }
      });
    } else {
      return;
    }
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //   }
    // });
  }
}