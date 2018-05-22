import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Md5 } from 'ts-md5/dist/md5';
import { PAGES, MESSAGE, VARIABLES } from '../constant';
import { COUNTRY_CODE } from '../operator-list/operator-data.component';
import { UtilitiesService } from 'app/services/utilities.service';
import { StringService } from '../services/string.service';
import { ValidateCustomService } from "../services/validate.service";
import { ValidateService } from 'app/services/validate.service';
import { PhoneNumberComponent } from "../phone-number/phone-number.component";
import { OperatorService } from 'app/api-service/operator.service';
import {LocalMessages} from '../message';
import * as _ from 'lodash';

@Component({
  selector: 'operator-add',
  templateUrl: './operator-add.component.html',
  styleUrls: ['./operator-add.component.scss']
})
export class OperatorAddComponent implements OnInit {

  countryCodes = COUNTRY_CODE;
  countryCode: string = COUNTRY_CODE[0].code;
  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  inputMaxUserName: number = VARIABLES.INPUT_MAX_USER_NAME;
  inputMaxPass: number = VARIABLES.INPUT_MAX_PASSWORD;
  inputMaxEmail: number = VARIABLES.INPUT_MAX_EMAIL;

  public isActive: boolean = true;
  public invalidPassword: string = LocalMessages.messages['7'];
  paddingLeft: number = 30;

  public ROUTERLINK = {
    OPERATOR_LIST: PAGES.OPERATOR.OPERATOR_LIST
  }
  public operator = {
    firstName: '',
    lastName: '',
    email: '',
    userName: '',
    phoneNumber: '',
    accountStatus: 0,
    statusDisplay: 0,
    newPassword: '',
    confirmNewPassword: '',
    newPasswordDisplay: '',
    confirmNewPasswordDisplay: '',
  }
  constructor(
    private router: Router,

    private _OperatorService: OperatorService,

    private _UtilitiesService: UtilitiesService,
    public _ValidateCustomService: ValidateCustomService,
    private _ValidateService: ValidateService,
    public _StringService: StringService,
    private _PhoneNumberComponent: PhoneNumberComponent,
  ) { }

  ngOnInit() {
  }

  trimForm() {
    this.operator.firstName = _.trim(this.operator.firstName);
    this.operator.lastName = _.trim(this.operator.lastName);
    this.operator.email = _.trim(this.operator.email);
    this.operator.userName = _.trim(this.operator.userName);
  }

  isValidForm() {
    if (!this._ValidateService.checkValidInputName(this.operator.firstName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }

    if (!this._ValidateService.checkValidInputName(this.operator.lastName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }
    if (!this.operator.email) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } else
    if (!this._ValidateService.validateEmail(this.operator.email)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["4"]);
      return false;
    }

    //let phonenumber module show message
    if (!this._PhoneNumberComponent.validate(this.operator.phoneNumber)) {
      return false;
    }

    if (!this._ValidateService.checkValidInputName(this.operator.userName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }

    if (this.operator.newPasswordDisplay.length < 8 || this.operator.confirmNewPasswordDisplay.length < 8) {
      this._UtilitiesService.showWarning(LocalMessages.messages["7"]);
      return false
    }
    if (!this._ValidateService.checkValidPassword(this.operator.newPasswordDisplay)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }
    if (!this._ValidateService.checkValidPassword(this.operator.confirmNewPasswordDisplay)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }
    if (this.operator.newPasswordDisplay != this.operator.confirmNewPasswordDisplay) {
      this._UtilitiesService.showWarning(LocalMessages.messages["8"]);
      return false;
    }
    return true;
  }

  //view
  save() {
    this.trimForm();
    if (!this.isValidForm()) {
      return;
    }

    let request = {
      firstName: this.operator.firstName,
      lastName: this.operator.lastName,
      email: this.operator.email,
      userName: this.operator.userName,
      userPassword: null,
      phoneNumber: this.operator.phoneNumber,
      accountStatus: this.operator.statusDisplay,
    }
    request.userPassword = Md5.hashStr(this.operator.newPasswordDisplay).toString();
    this.createOperator(request);
  }

  //service
  createOperator(request) {
    this._OperatorService.createOperator(request).then(response => {
      this._UtilitiesService.showSuccess(_.replace(LocalMessages.messages["18"],"%s",'Operater'));
      this.router.navigate([PAGES.OPERATOR.OPERATOR_LIST]);
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    })
  }
  checkMissingField(data) {
    if (!data.firstName || !data.lastName || !data.email || !data.phoneNumber || !data.userName || !data.newPasswordDisplay || !data.confirmNewPasswordDisplay) {
      return true;
    } else {
      return false;
    }
  }
}