import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ValidateService } from 'app/services/validate.service';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { SmsServiceService } from 'app/api-service/sms-service.service';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import { FormControl, Validators } from '@angular/forms';
import { LocalMessages } from '../message';
import { VARIABLES } from '../constant';
import { SharedService } from '../services/shared-service.service';

@Component({
  selector: 'sms-service',
  templateUrl: './sms-service.component.html',
  styleUrls: ['./sms-service.component.scss']
})
export class SMSServiceComponent implements OnInit {
  data = {
    id: null,
    accessKey: null,
    secretKey: null
  };
  tempData: any;
  updateData: any;
  smsFormControl = new FormControl('', [
    Validators.required]);
  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;

  constructor(
    private sharedService: SharedService,
    private _UtilitiesService: UtilitiesService,
    private _SmsServiceService: SmsServiceService,
    private _ValidateService: ValidateService,
  ) { }

  ngOnInit() {
    this._UtilitiesService.showLoading();
    this.reloadData().then(() => {
      this._UtilitiesService.stopLoading();
    });
  }
  // get data sms service
  reloadData() {
    let requestParam = {};
    return this._SmsServiceService.getSMSServiceDetail(requestParam).then(result => {
      if (result) {
        this.data = result;
        this.tempData = _.cloneDeep(this.data);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }
  // execute save data
  updateSMSService(requestData) {
    return this._SmsServiceService.updateSMSService(requestData).then(result => {
      this._UtilitiesService.showSuccess(LocalMessages.messages['13']);
      this._UtilitiesService.stopLoading();
    }, error => {
      this._UtilitiesService.stopLoading();
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
    });
  }
  // check validate
  checkValidattionSMS() {
    let errorList = [];
    if (!this.data.accessKey || !this.data.secretKey) {
      errorList.push(LocalMessages.messages["15"]);
    } else if (!this._ValidateService.checkValidInputName(this.data.accessKey, true)) {
      errorList.push(LocalMessages.messages["66"]);
    }
    // if (!this.data.secretKey) {
    //   errorList.push(LocalMessages.messages["72"]);
    // }
    return errorList;
  }
  // click on test button
  onTestKeyClick() {
    const errorList = this.checkValidattionSMS();
    if (errorList.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorList);
    } else {
      this._UtilitiesService.showLoading();
      let requestData = this.prepareDataTest();
      this.testKeyAction(requestData).then(() => {
        this._UtilitiesService.stopLoading();
      });;
    }
  }
  prepareDataTest() {
    let requestData = {
      accessKey: this.data.accessKey,
      secretKey: this.data.secretKey,
    };
    return requestData;
  }
  testKeyAction(requestData) {
    return this._SmsServiceService.testSMSService(requestData).then(result => {
      this._UtilitiesService.showSuccess(result.message);
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }
  // click on save button
  onSaveClick() {
    const errorList = this.checkValidattionSMS();
    if (errorList.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorList);
    } else {
      this._UtilitiesService.showLoading();
      let requestData = this.prepareUpdateData();
      this.updateSMSService(requestData).then(() => {
        this._UtilitiesService.stopLoading();
      });
    }
  }
  prepareUpdateData() {
    let prepareData = {
      id: this.data.id,
      accessKey: this.data.accessKey,
      secretKey: this.data.secretKey,
    };
    return prepareData;
  }
  // handle disable buttom
  disableButtom() {
    if (!this.data.accessKey || !this.data.secretKey) {
      return true;
    } else {
      return false;
    }
  }
  compareData() {
    if (!this.data.accessKey || !this.data.secretKey) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    }
    if (_.isEqual(this.data, this.tempData)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
    return false;
  }
}