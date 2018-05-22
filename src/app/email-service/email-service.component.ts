import { ActivatedRoute, Params } from '@angular/router';
import { Input, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { EmailServiceService } from 'app/api-service/email-service.service';
import { ValidateService } from 'app/services/validate.service';
import { LocalMessages } from '../message';
import * as _ from 'lodash';
import { VARIABLES } from '../constant';
import { SharedService } from '../services/shared-service.service';

@Component({
  selector: 'email-service',
  templateUrl: './email-service.component.html',
  styleUrls: ['./email-service.component.scss']
})
export class EmailServiceComponent implements OnInit {

  data: any;
  tempData: any;
  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;
  constructor(
    private sharedService: SharedService,
    private _UtilitiesService: UtilitiesService,
    private _EmailServiceService: EmailServiceService,
    private _ValidateService: ValidateService, ) {
  }

  ngOnInit() {
    this.data = {
      serviceType: 0,
      encrytionType: 0
    };
    this._UtilitiesService.showLoading();
    this.reloadData().then(() => {
      this._UtilitiesService.stopLoading();
    });
  }

  reloadData() {
    let requestParam = {};
    return this._EmailServiceService.getEmailServiceDetail(requestParam).then(result => {
      if (result) {
        this.data = result;
        if (!this.data.encrytionType) {
          this.data.encrytionType = 0;
        }
        this.tempData = _.cloneDeep(this.data);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null)
    });
  }
  // execute test account
  testAccount() {
    const errorList = this.checkValidattionEmail();
    if (errorList.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorList);
    } else {
      this._UtilitiesService.showLoading();
      let requestData = this.prepareDataTestSMTP();
      this.testAccountAction(requestData).then(() => {
        this._UtilitiesService.stopLoading();
      });;
    }
  }
  prepareDataTestSMTP() {
    let requestData = {
      id: this.data.id,
      port: this.data.port,
      hostName: this.data.hostName,
      email: this.data.email,
      password: this.data.password,
      encrytionType: this.data.encrytionType,
      serviceType: this.data.serviceType
    };
    return requestData;
  }
  // execute test account
  testAccountAction(requestData) {
    return this._EmailServiceService.testSMPTService(requestData).then(result => {
      this._UtilitiesService.showSuccess(result.message);
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null)
    });
  }
  // check validate
  checkValidattionEmail() {
    let errorList = [];
    if (this.data.serviceType == 0) {
      if (!this.data.accessKeyId || !this.data.secretAccessKey) {
        errorList.push(LocalMessages.messages["15"]);
      } else {
        if (!this._ValidateService.checkValidInputName(this.data.accessKeyId, true)) {
          errorList.push(LocalMessages.messages["66"]);
        }
        // if (!this._ValidateService.checkValidPassword(this.data.secretAccessKey)) {
        //   errorList.push(LocalMessages.messages["72"]);
        // }
      }
    } else {
      if (!this.data.hostName || !this.data.port || !this.data.email || !this.data.password) {
        errorList.push(LocalMessages.messages["15"]);
      } else {
        if (!this._ValidateService.validateHostName(this.data.hostName)) {
          errorList.push(LocalMessages.messages["114"]);
        }
        if (this.data.port < 0 || this.data.port > 9999) {

          errorList.push(LocalMessages.messages["1"]);
        }
        if (!this._ValidateService.validateEmail(this.data.email)) {
          errorList.push(LocalMessages.messages["4"]);
        }
        if (!this.data.password) {
          errorList.push(LocalMessages.messages["72"]);
        }
      }
    }
    return errorList;
  }
  integerInput(event) {
    return event.charCode >= 48 &&
      event.charCode <= 57
  }
  // test key
  onTestKeyClick() {
    const errorList = this.checkValidattionEmail();
    if (errorList.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorList);
    } else {
      this._UtilitiesService.showLoading();
      let requestData = this.prepareDataTestSES();
      this.testKeyAction(requestData).then(() => {
        this._UtilitiesService.stopLoading();
      });;
    }
  }
  prepareDataTestSES() {
    let requestData = {
      id: this.data.id,
      accessKeyId: this.data.accessKeyId,
      secretAccessKey: this.data.secretAccessKey,
      serviceType: this.data.serviceType
    };
    return requestData;
  }
  // execute test key
  testKeyAction(requestData) {
    return this._EmailServiceService.testSESService(requestData).then(result => {
      this._UtilitiesService.showSuccess(result.message);
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null)
    });
  }

  // handle disable buttom
  disableButtom() {
    if (this.data.serviceType == 0) {
      if (!this.data.accessKeyId || !this.data.secretAccessKey) {
        this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
        return true;
      } else {
        this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
        return false;
      }
    } else {
      if (!this.data.port || !this.data.hostName || !this.data.email
        // || !this.data.encrytionType
        || !this.data.password) {
        this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
        return true;
      } else {
        this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
        return false;
      }
    }
  }

  // save
  onSaveClick() {
    let requestData = {};
    const errorList = this.checkValidattionEmail();
    if (errorList.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorList);
    } else {
      this._UtilitiesService.showLoading();
      if (this.data.serviceType == 0) {
        requestData = this.prepareDataTestSES();
      } else {
        requestData = this.prepareDataTestSMTP();
      }
      this.saveAction(requestData).then(() => {
        this._UtilitiesService.stopLoading();
      });
    }
  }
  saveAction(requestData) {
    return this._EmailServiceService.updateEmailService(requestData).then(result => {
      this.reloadData();
      this._UtilitiesService.showSuccess(result.message);
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null)
    });
  }
  compareData() {
    if (_.isEqual(this.data, this.tempData)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    } else if (!_.isEqual(this.data, this.tempData)) {
      return this.disableButtom();
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
    return false;
  }
}

