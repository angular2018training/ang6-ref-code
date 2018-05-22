import * as _ from 'lodash';

import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Md5 } from 'ts-md5/dist/md5';

import { UtilitiesService } from 'app/services/utilities.service';
import { UserService, UserInfo } from "app/services/user.service";
import { ValidateCustomService } from "app/services/validate.service";
import { ValidateService } from 'app/services/validate.service';
import { StringService } from "app/services/string.service";
import { PhoneNumberComponent } from "app/phone-number/phone-number.component";

import { VARIABLES, PAGES, MESSAGE } from 'app/constant';

import { OperatorService } from 'app/api-service/operator.service';
import { AuthorizationService } from 'app/api-service/authorization.service';
import { LoginService } from 'app/services/login.service';
import { LocalMessages } from '../../message';

@Component({
  selector: 'dialog-operator-edit',
  templateUrl: './dialog-operator-edit.component.html',
  styleUrls: ['./dialog-operator-edit.component.scss']
})
export class DialogOperatorEdit implements OnInit {
  public invalidPassword: string = LocalMessages.messages['7'];
  isDisabled: boolean = false;
  maxPhoneNumber: number = VARIABLES.MAX_PHONE_NUMBER;
  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;

  operatorDataGeneral = {
    userID: null,
    role: null,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    accountStatus: 1,
    usernameStatus: 1
  };
  operatorDetail = {
    userName: '',
    usernameStatus: 1,
    oldPassword: '',
    oldPasswordDisplay: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };
  sourceDataGeneral;
  sourceDetail;

  account: UserInfo = {
    userID: null,
    username: null,
    password: null,
    passwordDisplay: null,
    isRemember: false,
    role: null,
  }

  public compareData = _.isEqual;

  constructor(
    public dialogRef: MatDialogRef<DialogOperatorEdit>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public _UserService: UserService,
    public _ValidateCustomService: ValidateCustomService,
    private _ValidateService: ValidateService,
    private _UtilitiesService: UtilitiesService,
    private _StringService: StringService,
    private _PhoneNumberComponent: PhoneNumberComponent,

    public _AuthorizationService: AuthorizationService,
    private _OperatorService: OperatorService,
    private _LoginService: LoginService,
  ) { }
  ngOnInit(): void {
    this.account = this._UserService.getAuthorization();

    this.operatorDataGeneral.userID = this.account.userID;
    this.operatorDetail.userName = this.account.username;
    this.operatorDataGeneral.role = this.account.role;
    this.operatorDetail.oldPassword = this.account.password;
    this.operatorDetail.oldPasswordDisplay = this.account.passwordDisplay;

    this._OperatorService.getDetailOperator(this.operatorDataGeneral.userID).then(response => {
      if (response != null && response != undefined) {
        this.operatorDataGeneral = {
          userID: this.account.userID,
          role: this.account.role,
          firstName: response.firstName,
          lastName: response.lastName,
          email: response.email,
          phoneNumber: response.phoneNumber,
          accountStatus: response.accountStatus.toString(),
          usernameStatus: response.usernameStatus
        };
        this.sourceDataGeneral = _.cloneDeep(this.operatorDataGeneral);

        this.operatorDetail = {
          userName: this.account.username,
          usernameStatus: response.usernameStatus,
          oldPassword: this.account.password,
          oldPasswordDisplay: this.account.passwordDisplay,
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        };
        this.sourceDetail = _.cloneDeep(this.operatorDetail);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  validateGeneralInfo() {
    if (!this._ValidateService.checkValidInputName(this.operatorDataGeneral.firstName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } else if (!this._ValidateService.checkValidInputName(this.operatorDataGeneral.lastName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } else if (!this._PhoneNumberComponent.validate(this.operatorDataGeneral.phoneNumber)) {
      return false;
    } else if (!this.operatorDataGeneral.email) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } else if (!this._ValidateService.validateEmail(this.operatorDataGeneral.email)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["4"]);
      return false;
    }
    return true;
  }

  validateUserInfo() {
    if (this.operatorDataGeneral.accountStatus == 0 && !this._ValidateService.checkValidInputName(this.operatorDetail.userName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } if (!this._ValidateService.checkValidPassword(this.operatorDetail.currentPassword)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } else if (this.operatorDetail.currentPassword != this.operatorDetail.oldPasswordDisplay) {
      this._UtilitiesService.showWarning(LocalMessages.messages["116"]);
      return false;
    } if (this.isCanChangeUsername() && this.isChangeUsername() && this.operatorDetail.newPassword == '' && this.operatorDetail.confirmNewPassword == '') {
      return true;
    } else if (this.operatorDetail.newPassword.length < 8 || this.operatorDetail.confirmNewPassword.length < 8) {
      this._UtilitiesService.showWarning(LocalMessages.messages["7"]);
      return false
    } else if (!this._ValidateService.checkValidPassword(this.operatorDetail.newPassword) || !this._ValidateService.checkValidPassword(this.operatorDetail.confirmNewPassword)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } else if (this.operatorDetail.newPassword != this.operatorDetail.confirmNewPassword) {
      this._UtilitiesService.showWarning(LocalMessages.messages["8"]);
      return false;
    }
    return true;
  }

  isCanChangeUsername() {
    return this.operatorDetail.usernameStatus == 0;
  }
  isChangeUsername() {
    return this.operatorDetail.usernameStatus == 0 && this.operatorDetail.userName != this.account.username;
  }
  isChangePassword() {
    return this.operatorDetail.newPassword != this.operatorDetail.oldPasswordDisplay;
  }

  //view
  updateDetail() {
    if (!this.checkRequiredFieldGeneralInfo()) {
      return;
    }
    this.trimForm();
    if (!this.validateGeneralInfo()) {
      return;
    }

    let request = {
      id: this.operatorDataGeneral.userID,
      firstName: this.operatorDataGeneral.firstName,
      lastName: this.operatorDataGeneral.lastName,
      phoneNumber: this.operatorDataGeneral.phoneNumber,
      email: this.operatorDataGeneral.email,
      accountStatus: this.operatorDataGeneral.accountStatus,
    };
    this.updateOperator(request);
  }

  checkRequiredFieldGeneralInfo() {
    if (!this.operatorDataGeneral.firstName) {
      this._UtilitiesService.showWarning(LocalMessages.messages["15"]);
      return false;
    }
    if (!this.operatorDataGeneral.lastName) {
      this._UtilitiesService.showWarning(LocalMessages.messages["15"]);
      return false;
    }
    if (!this.operatorDataGeneral.email) {
      this._UtilitiesService.showWarning(LocalMessages.messages["15"]);
      return false;
    }
    return true;
  }

  trimForm() {
    this.operatorDataGeneral.firstName = _.trim(this.operatorDataGeneral.firstName);
    this.operatorDataGeneral.lastName = _.trim(this.operatorDataGeneral.lastName);
    this.operatorDataGeneral.email = _.trim(this.operatorDataGeneral.email);
  }

  resetPassword() {
    if (!this.validateUserInfo()) {
      return;
    }

    let newPassword = null;
    if (!this.operatorDetail.newPassword) {
      newPassword = this.operatorDetail.oldPassword;
    } else {
      newPassword = Md5.hashStr(this.operatorDetail.newPassword).toString();
    }
    let request = {
      id: this.operatorDataGeneral.userID,
      loginId: this.account.userID,
      userName: this.operatorDetail.userName,
      userPassword: newPassword
    }
    this._OperatorService.resetPassword(request).then(response => {
      this._UtilitiesService.showSuccess(LocalMessages.messages['16']);

      //update account info
      this.account.isRemember = false;
      if (this.isChangeUsername()) {
        this.account.username = this.operatorDetail.userName;
        this._UserService.changeUsername(this.account.username);
      } else if (this.isChangePassword()) {
        this.account.password = newPassword;
        this.account.passwordDisplay = this.operatorDetail.newPassword;
      }
      this._UserService.setAuthorization(this.account);
      this.dialogRef.close(true);
      this._LoginService.logout();
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }
  isDisabledChangePassword() {
    if (this.isCanChangeUsername() && this.operatorDetail.userName === this.account.username && !this.operatorDetail.newPassword && !this.operatorDetail.confirmNewPassword) {
      return true;
    }
    let temp = this.isCanChangeUsername();
    return (
      _.isEqual(this.sourceDetail, this.operatorDetail) ||
      !this.operatorDetail.currentPassword ||
      (!this.isCanChangeUsername() && (!this.operatorDetail.newPassword || !this.operatorDetail.confirmNewPassword)) ||
      (
        this.isCanChangeUsername() &&
        (
          (this.operatorDetail.newPassword != '' && !this.operatorDetail.confirmNewPassword) ||
          (!this.operatorDetail.newPassword && this.operatorDetail.confirmNewPassword != '')
        )
      )
    );
  }

  //service
  updateOperator(request) {
    this._OperatorService.updateOperator(request).then(response => {
      this.sourceDataGeneral = _.cloneDeep(this.operatorDataGeneral);
      this._UtilitiesService.showSuccess(LocalMessages.messages['11']);
      this.dialogRef.close(true);
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }
}