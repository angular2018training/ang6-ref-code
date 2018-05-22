import * as _ from 'lodash';
import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Md5 } from 'ts-md5/dist/md5';
import { UtilitiesService } from 'app/services/utilities.service';
import { UserService, UserInfo } from "../services/user.service";
import { ValidateCustomService } from "../services/validate.service";
import { ValidateService } from 'app/services/validate.service';
import { StringService } from "../services/string.service";
import { PhoneNumberComponent } from "../phone-number/phone-number.component";
import { VARIABLES, PAGES, MESSAGE } from '../constant';
import { OperatorService } from 'app/api-service/operator.service';
import { AuthorizationService } from 'app/api-service/authorization.service';
import { LoginService } from '../services/login.service';
import { LocalMessages } from '../message';
import { SharedService } from '../services/shared-service.service';


@Component({
  selector: 'operator-detail',
  templateUrl: './operator-detail.component.html',
  styleUrls: ['./operator-detail.component.scss']
})
export class OperatorDetailComponent implements OnInit {
  public isActive: boolean = true;
  public operatorID: number;
  public invalidPassword: string = LocalMessages.messages['7'];
  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  inputMaxUserName: number = VARIABLES.INPUT_MAX_USER_NAME;
  inputMaxPass: number = VARIABLES.INPUT_MAX_PASSWORD;
  inputMaxEmail: number = VARIABLES.INPUT_MAX_EMAIL;
  operatorDataGeneral = {
    id: null,
    userName: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    accountStatus: 1,
    usernameStatus: 1
  };
  operatorDetail = {
    userPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  };

  account: UserInfo = null;
  sourceDataGeneral;
  sourceDetail;
  
  compareData() {
    if (_.isEqual(this.sourceDataGeneral, this.operatorDataGeneral)){
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
    return false;
  }

  constructor(
    private sharedService: SharedService,
    public dialog: MatDialog,
    private _OperatorService: OperatorService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private _UtilitiesService: UtilitiesService,
    public _ValidateCustomService: ValidateCustomService,
    private _ValidateService: ValidateService,
    public _StringService: StringService,
    public _UserService: UserService,
    private _PhoneNumberComponent: PhoneNumberComponent,
  ) { }

  ngOnInit() {
    this.operatorID = this.activatedRoute.snapshot.queryParams["id"];
    this.account = this._UserService.getAuthorization();
    this.getDetailOperator();
  }

  trimForm(){
    this.operatorDataGeneral.firstName = _.trim(this.operatorDataGeneral.firstName);
    this.operatorDataGeneral.lastName = _.trim(this.operatorDataGeneral.lastName);
    this.operatorDataGeneral.email = _.trim(this.operatorDataGeneral.email);
  }

  validateDetail() {
    if (!this._ValidateService.checkValidInputName(this.operatorDataGeneral.firstName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }
    if (!this._ValidateService.checkValidInputName(this.operatorDataGeneral.lastName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }

    // let phone number module show message
    if (!this._PhoneNumberComponent.validate(this.operatorDataGeneral.phoneNumber)) {
      return false;
    }
    if (!this.operatorDataGeneral.email) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } else if (!this._ValidateService.validateEmail(this.operatorDataGeneral.email)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["4"]);
      return false;
    }

    return true;
  }
  initialOperatorGeneral(data) {
    this.operatorDataGeneral = {
      id: data.id,
      userName: data.userName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      accountStatus: data.accountStatus.toString(),
      usernameStatus: data.usernameStatus
    };
    this.sourceDataGeneral = _.cloneDeep(this.operatorDataGeneral);
  }
  initialOperatorDetail(data) {
    this.operatorDetail = {
      userPassword: data.userPassword,
      newPassword: '',
      confirmNewPassword: '',
    };
    this.sourceDetail = _.cloneDeep(this.operatorDetail);
  }

  checkRequiredField() {
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

  updateDetail() {
    if (!this.checkRequiredField()) {
      return;
    }
    this.trimForm();
    if (!this.validateDetail()) {
      return;
    }
    let request = {
      id: this.operatorID,
      firstName: this.operatorDataGeneral.firstName,
      lastName: this.operatorDataGeneral.lastName,
      phoneNumber: this.operatorDataGeneral.phoneNumber,
      email: this.operatorDataGeneral.email,
      accountStatus: this.operatorDataGeneral.accountStatus,
    };
    this.updateOperator(request);
  }

  //service
  getDetailOperator() {
    this._UtilitiesService.showLoading();
    this._OperatorService.getDetailOperator(this.operatorID).then(response => {
      if (response != undefined) {
        this.initialOperatorGeneral(response);
        this.initialOperatorDetail(response);
      } else {
        this.router.navigate([PAGES.OPERATOR.OPERATOR_MANAGEMENT]);
      }
      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();      
      setTimeout(() => {
        this.router.navigate([PAGES.OPERATOR.OPERATOR_MANAGEMENT]);
      }, 200);
    });
  }

  /**
   * Update operator detail to server
   * @param request 
   */
  updateOperator(request) {
    this._UtilitiesService.showLoading();
    this._OperatorService.updateOperator(request).then(response => {
      this.initialOperatorGeneral(this.operatorDataGeneral);
      this._UtilitiesService.showSuccess(LocalMessages.messages["11"]);
      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();

      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
    });
  }
}