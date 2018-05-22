import * as _ from 'lodash';
import { Component, OnInit, Inject, HostBinding } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Md5 } from 'ts-md5/dist/md5';
import { UtilitiesService } from 'app/services/utilities.service';
import { UserService, UserInfo } from "app/services/user.service";
import { CustomerService } from '../../api-service/customer.service';
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
    selector: 'dialog-customer-edit',
    templateUrl: './dialog-customer-edit.component.html',
    styleUrls: ['./dialog-customer-edit.component.scss']
})
export class DialogCustomerEdit implements OnInit {
    public invalidPassword: string = LocalMessages.messages['7'];
    isDisabled: boolean = false;
    maxPhoneNumber: number = VARIABLES.MAX_PHONE_NUMBER;
    inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;
    inputMaxName: number = VARIABLES.INPUT_MAX_NAME;

    customerDataGeneral = {
        userID: null,
        role: null,
        customerName: '',
        email: '',
        countryId: -1,
        provinceId: -1,
        address: '',
        phoneNumber: '',
        accountStatus: 1,
        usernameStatus: 1
    };
    customerDetail = {
        userName: '',
        usernameStatus: 1,
        oldPassword: '',
        oldPasswordDisplay: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        countryId: -1,
        provinceId: -1,
    };
    sourceDataGeneral = {
        userID: null,
        role: null,
        customerName: '',
        email: '',
        countryId: -1,
        provinceId: -1,
        address: '',
        phoneNumber: '',
        accountStatus: 1,
        usernameStatus: 1
    };

    sourceDetail;

    countries = [];
    provinces = [];

    account: UserInfo = {
        userID: null,
        username: null,
        password: null,
        passwordDisplay: null,
        isRemember: false,
        role: null,
    }

    constructor(
        public dialogRef: MatDialogRef<DialogCustomerEdit>,
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

        private _CustomerService: CustomerService
    ) { }
    ngOnInit(): void {
        this.account = this._UserService.getAuthorization();

        this.customerDataGeneral.userID = this.account.userID;
        this.customerDetail.userName = this.account.username;
        this.customerDataGeneral.role = this.account.role;
        this.customerDetail.oldPassword = this.account.password;
        this.customerDetail.oldPasswordDisplay = this.account.passwordDisplay;

        let requestParam = {
            id: this.customerDataGeneral.userID
        };

        this._CustomerService.getCustomerDetail(requestParam).then(response => {
            if (response != null && response != undefined) {
                this.customerDataGeneral = {
                    userID: this.account.userID,
                    role: this.account.role,
                    customerName: response.customerName,
                    email: response.email,
                    countryId: response.countryId,
                    provinceId: response.provinceId,
                    address: response.address,
                    phoneNumber: response.phoneNumber,
                    accountStatus: response.accountStatus.toString(),
                    usernameStatus: response.usernameStatus
                };
                this.sourceDataGeneral = _.cloneDeep(this.customerDataGeneral);
                if (this.sourceDataGeneral.countryId == undefined) {
                    this.sourceDataGeneral.countryId = -1;
                }
                if (this.sourceDataGeneral.provinceId == undefined) {
                    this.sourceDataGeneral.provinceId = -1;
                }

                this.customerDetail = {
                    userName: this.account.username,
                    usernameStatus: response.usernameStatus,
                    oldPassword: this.account.password,
                    oldPasswordDisplay: this.account.passwordDisplay,
                    currentPassword: '',
                    newPassword: '',
                    confirmNewPassword: '',
                    countryId: -1,
                    provinceId: -1,
                };
                this.sourceDetail = _.cloneDeep(this.customerDetail);
                this.getListCountries();
                this.handleCountryProvince();
            }
        }, error => {
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }

    /**
   * Get list country from server
   */
    getListCountries() {
        return this._CustomerService.getCountry().then(result => {
            if (result) {
                this.countries = result.content;
                this.getListProvinceByCountryId();
            }
        }, error => {
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }

    /**
     * Get drop down list province by selected country 
     */
    getListProvinceByCountryId() {
        this.countries.forEach((element) => {
            if (element.id === this.customerDataGeneral.countryId) {
                this.provinces = element.provinces;
            }
        });
    }

    /**
     * Change country
     */
    changeCountry(countryId) {
        if (this.customerDataGeneral.countryId > 0) {
            this.provinces = this.countries.filter((o) => {
                return o.id == this.customerDataGeneral.countryId;
            })[0].provinces;
        } else {
            this.provinces = [];
            this.customerDataGeneral.provinceId = -1;
        }
    }

    compareData() {
        if (_.isEqual(this.customerDataGeneral, this.sourceDataGeneral)) {
            return true;
        } else {
            return false;
        }
    }

    // defaul value country and province is -1
    handleCountryProvince() {
        if (!this.customerDataGeneral.countryId) {
            this.customerDataGeneral.countryId = -1;
            this.customerDataGeneral.provinceId = -1;
        } else if (!this.customerDataGeneral.provinceId) {
            this.customerDataGeneral.provinceId = -1;
        }
    }

    validateGeneralInfo() {
        if (!this._ValidateService.checkValidInputName(this.customerDataGeneral.customerName, true)) {
            this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
            return false;
        } else if (!this._PhoneNumberComponent.validate(this.customerDataGeneral.phoneNumber)) {
            return false;
        } else if (!this.customerDataGeneral.email) {
          this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
          return false;
        } else if (!this._ValidateService.validateEmail(this.customerDataGeneral.email)) {
          this._UtilitiesService.showWarning(LocalMessages.messages["4"]);
          return false;
        }
        return true;
    }

    validateUserInfo() {
        if (this.customerDataGeneral.accountStatus == 0 && !this._ValidateService.checkValidInputName(this.customerDetail.userName, true)) {
          this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
          return false;
        } if (!this._ValidateService.checkValidPassword(this.customerDetail.currentPassword)) {
          this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
          return false;
        } else if (this.customerDetail.currentPassword != this.customerDetail.oldPasswordDisplay) {
          this._UtilitiesService.showWarning(LocalMessages.messages["116"]);
          return false;
        } if (this.isCanChangeUsername() && this.isChangeUsername() && this.customerDetail.newPassword == '' && this.customerDetail.confirmNewPassword == '') {
            return true;
        } else if (this.customerDetail.newPassword.length < 8 || this.customerDetail.confirmNewPassword.length < 8) {
          this._UtilitiesService.showWarning(LocalMessages.messages["7"]);
          return false
        } else if (!this._ValidateService.checkValidPassword(this.customerDetail.newPassword) || !this._ValidateService.checkValidPassword(this.customerDetail.confirmNewPassword)) {
          this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
          return false;
        } else if (this.customerDetail.newPassword != this.customerDetail.confirmNewPassword) {
          this._UtilitiesService.showWarning(LocalMessages.messages["8"]);
          return false;
        }
        return true;
    }

    isCanChangeUsername() {
        return this.customerDetail.usernameStatus == 0;
    }
    isChangeUsername() {
        return this.customerDetail.usernameStatus == 0 && this.customerDetail.userName != this.account.username;
    }
    isChangePassword() {
        return this.customerDetail.newPassword != this.customerDetail.oldPasswordDisplay;
    }

    checkRequiredField() {
      if (!this.customerDataGeneral.customerName) {
        this._UtilitiesService.showWarning(LocalMessages.messages["15"]);
        return false;
      }
      if (!this.customerDataGeneral.email) {
        this._UtilitiesService.showWarning(LocalMessages.messages["15"]);
        return false;
      }
      return true;
    }

    trimForm() {
      this.customerDataGeneral.customerName = _.trim(this.customerDataGeneral.customerName);
      this.customerDataGeneral.address = _.trim(this.customerDataGeneral.address);
      this.customerDataGeneral.email = _.trim(this.customerDataGeneral.email);
    }

    //view
    updateDetail() {
      if (!this.checkRequiredField()) {
          return;
        }
      this.trimForm();

      if (!this.validateGeneralInfo()) {
          return;
      }

        let request = {
            id: this.customerDataGeneral.userID,
            customerName: this.customerDataGeneral.customerName,
            countryId: this.customerDataGeneral.countryId,
            provinceId: this.customerDataGeneral.provinceId,
            address: this.customerDataGeneral.address,
            phoneNumber: this.customerDataGeneral.phoneNumber,
            email: this.customerDataGeneral.email,
            accountStatus: this.customerDataGeneral.accountStatus,
        };
        if (request.countryId === -1 || _.isNil(request.countryId)) {
            request.countryId = null;
        }
        if (request.provinceId === -1 || _.isNil(request.provinceId)) {
            request.provinceId = null;
        }
        this.updateCustomer(request);
    }

    resetPassword() {
        if (!this.validateUserInfo()) {
            return;
        }

        let newPassword = null;
        if (!this.customerDetail.newPassword) {
            newPassword = this.customerDetail.oldPassword;
        } else {
            newPassword = Md5.hashStr(this.customerDetail.newPassword).toString();
        }
        let request = {
            id: this.customerDataGeneral.userID,
            loginId: this.account.userID,
            userName: this.customerDetail.userName,
            userPassword: newPassword
        }
        this._OperatorService.resetPassword(request).then(response => {
            this._UtilitiesService.showSuccess(LocalMessages.messages['16']);

            //update account info
            this.account.isRemember = false;
            if (this.isChangeUsername()) {
                this.account.username = this.customerDetail.userName;
                this._UserService.changeUsername(this.account.username);
            } else if (this.isChangePassword()) {
                this.account.password = newPassword;
                this.account.passwordDisplay = this.customerDetail.newPassword;
            }
            this._UserService.setAuthorization(this.account);
            this.dialogRef.close(true);
            this._LoginService.logout();
        }, error => {
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }
    isDisabledChangePassword() {
      if (this.isCanChangeUsername() && this.customerDetail.userName === this.account.username && !this.customerDetail.newPassword && !this.customerDetail.confirmNewPassword) {
        return true;
      }
        let temp = this.isCanChangeUsername();
        return (
            _.isEqual(this.sourceDetail, this.customerDetail) ||
            !this.customerDetail.currentPassword ||
            (!this.isCanChangeUsername() && (!this.customerDetail.newPassword || !this.customerDetail.confirmNewPassword)) ||
            (
                this.isCanChangeUsername() &&
                (
                    (this.customerDetail.newPassword != '' && !this.customerDetail.confirmNewPassword) ||
                    (!this.customerDetail.newPassword && this.customerDetail.confirmNewPassword != '')
                )
            )
        );
    }

    //service
    updateCustomer(request) {
        if (request) {
            this._CustomerService.updateCustomer(request).then(response => {
                this.sourceDataGeneral = _.cloneDeep(this.customerDataGeneral);
                this._UtilitiesService.showSuccess(LocalMessages.messages['11']);
                this.dialogRef.close(true);
            }, error => {
                this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
            });
        }
    }
}