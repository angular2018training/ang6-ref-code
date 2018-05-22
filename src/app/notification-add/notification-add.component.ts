import { Component, OnInit, Inject, ElementRef } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationSettingService } from '../api-service/notification-setting.service'
import { LoginService } from 'app/services/login.service';
import { UtilitiesService } from 'app/services/utilities.service';
import { LocalMessages } from 'app/message';
import { NotificationSettingComponent } from 'app/notification-setting/notification-setting.component';
import { PhoneNumberComponent } from '../phone-number/phone-number.component';
import { ValidateService } from 'app/services/validate.service';
import { StringService } from "../services/string.service";
import { VARIABLES} from '../constant';
import * as _ from 'lodash';

// component dialog add
@Component({
  selector: 'notification-add-dialog',
  templateUrl: 'notification-add-dialog.html',
  styleUrls: ['./notification-add.component.scss']
})
export class NotificationAddDialog {
  createData: any = {};

  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;

  currentUser;

  constructor(
    public dialogRef: MatDialogRef<NotificationAddDialog>,
    private _ValidateService: ValidateService,
    private _PhoneNumberComponent: PhoneNumberComponent,
    private _UtilitiesService: UtilitiesService,
    private _StringService: StringService,
    private _NotificationSettingService: NotificationSettingService,
    private _LoginService: LoginService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  types = [
    {
      id: 0,
      label: "SMS"
    },
    {
      id: 1,
      label: "Email"
    }
  ];
  ngOnInit() {
    this.data.type = this.types[0].id;
    this.currentUser = this._LoginService.getUserInfo();
  }

  formValidattion() {
    if (this.data.type === 1 && !this.data.phoneEmail) {
      return true;
    }
    if (this.data.type === 0 && !this.validatePhoneNumber(this.data.phoneEmail)) {
      return true;
    }
    return false;
  }

  validatePhoneNumber(phoneNumber) {
    if (phoneNumber) {
      let phoneValue = phoneNumber.split('/');
      if (phoneValue.length === 2) {
        if (this._StringService.isEmpty(phoneValue[1])) {
          return false;
        } else if (phoneValue[0] === '') {
          return false;
        }
        return true;
      }
    }
    return false;
  }

  addNotificationSetting() {
    if (this.data) {
      if (this.data.type === 1 && !this._ValidateService.validateEmail(this.data.phoneEmail)) {
        this._UtilitiesService.showWarning(LocalMessages.messages['4']);
        return false;
      }
      if (this.data.type === 0) {
        let phoneNumber = this.data.phoneEmail;
        if (!this._PhoneNumberComponent.validate(phoneNumber)) {
          return false;
        }
      }
      let userid = this.currentUser.userID;

      this.createData = this.data;
      this.createData.userId = userid;
      this.createData.setPointNotification = (_.isNil(this.data.setPointNotification)) ? false : (this.data.setPointNotification);
      this.createData.reportNotification = (_.isNil(this.data.reportNotification)) ? false : (this.data.reportNotification);
      this.createNotificationSetting(this.createData);
    }
    return true;
  }

  createNotificationSetting(createData) {
    return this._NotificationSettingService.createNotificationSetting(createData).then(result => {
      if (result) {
        this.dialogRef.close();
        if (this.createData.type === 0) {
          this.showPhoneCreateSuccess();
        };
        if (this.createData.type === 1) {
          this.showEmailCreateSuccess();
        };
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  showPhoneCreateSuccess() {
    this._UtilitiesService.showSuccess(LocalMessages.messages['123']);
  }

  showEmailCreateSuccess() {
    this._UtilitiesService.showSuccess(LocalMessages.messages['125']);
  }

  changeType(type) {
    this.data.phoneEmail = '';
    console.log(type)
  }
}
