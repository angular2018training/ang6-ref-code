import { Component, OnInit, Inject, ElementRef, Input } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { NotificationSettingService } from '../api-service/notification-setting.service'
import { LoginService } from 'app/services/login.service';
import { UtilitiesService } from 'app/services/utilities.service';
import { LocalMessages } from 'app/message';
import { ValidateService } from 'app/services/validate.service';
import { NotificationSettingComponent } from 'app/notification-setting/notification-setting.component';
import { PhoneNumberComponent } from '../phone-number/phone-number.component';
import { StringService } from "../services/string.service";
import * as _ from 'lodash';
import { VARIABLES} from '../constant';

@Component({
  selector: 'notification-update-dialog',
  templateUrl: 'notification-update-dialog.html',
  styleUrls: ['./notification-update.component.scss']
})
export class NotificationUpdateDialog implements OnInit {
  dataOld: any = {};

  updateData;

  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;

  updateNotificationModel = {
    phoneEmail: null,
    setPointNotification: false,
    reportNotification: false,
    type: 0,
    id: -1,
    userId: -1
  }

  currentUser;

  constructor(
    public dialogRef: MatDialogRef<NotificationUpdateDialog>,
    private _ValidateService: ValidateService,
    private _PhoneNumberComponent: PhoneNumberComponent,
    private _NotificationSettingService: NotificationSettingService,
    private _StringService: StringService,
    private _UtilitiesService: UtilitiesService,
    private _LoginService: LoginService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (this.data.type === 0) {
      this.data.phoneEmail = this.getUpdatePhoneNumber(this.data.phoneEmail);
    }
    this.dataOld = _.cloneDeep(this.data);
    this.currentUser = this._LoginService.getUserInfo();
  }

  types = [
    { id: 0, label: 'SMS' },
    { id: 1, label: 'Email' },
  ];

  compareData() {
    if (_.isEqual(this.data, this.dataOld)) {
      return true;
    }
    return false;
  }

  updateNoti() {
    if (this.data) {
      this.updateData = _.cloneDeep(this.updateNotificationModel);
      let userid = this.currentUser.userID;

      if (this.data.type === 1 && !this.validateEmail(this.data.phoneEmail)) {
        return false;
      }
      if (this.data.type === 0) {
        let phoneNumber = this.data.phoneEmail;
        if (!this._PhoneNumberComponent.validate(phoneNumber)) {
          return false;
        }
      }
      if (this.data) {
        this.updateData.userId = userid;
        this.updateData.id = this.data.id;
        this.updateData.type = this.data.type;
        this.updateData.phoneEmail = this.data.phoneEmail;
        this.updateData.reportNotification = this.data.reportNotification;
        this.updateData.setPointNotification = this.data.setPointNotification;

        this.updateNotificationSetting(this.updateData);
      }
    }
    return true;
  }

  getUpdatePhoneNumber(phoneNumber) {
    if (!this._StringService.isEmpty(phoneNumber)) {
      let arrPhone = phoneNumber.split(' ');
      if (arrPhone.length == 2) {
        return arrPhone[0] + '/' + arrPhone[1];
      }
    }
    return phoneNumber;
  }

  changeCountry(event) { }

  validateEmail(email) {
    if (!email) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } else if (!this._ValidateService.validateEmail(email)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["4"]);
      return false;
    }
    return true;
  }

  updateNotificationSetting(updateData) {
    return this._NotificationSettingService.updateNotificationSetting(updateData).then(result => {
      if (result) {
        this.showUpdateSuccess();
        this.dialogRef.close(true);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  showUpdateSuccess() {
    this._UtilitiesService.showSuccess(LocalMessages.messages['11']);
  }

  changeType(type) {
    this.data.phoneEmail = '';
    console.log(type)
  }
}