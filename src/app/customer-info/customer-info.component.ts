import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UtilitiesService } from '../services/utilities.service';
import { ValidateCustomService } from '../services/validate.service';
import { StringService } from '../services/string.service';
import { ValidateService } from '../services/validate.service';
import { CustomerService } from '../api-service/customer.service';
import { UserService, UserInfo } from "../services/user.service";
import { Customer } from '../model/customer';
import { ROLES, LANGUAGES, MESSAGE, VARIABLES } from '../constant';
import { Md5 } from 'ts-md5/dist/md5';
import * as _ from 'lodash';
import { PhoneNumberComponent } from "../phone-number/phone-number.component";
import { LocalMessages } from '../message';
import { SharedService } from '../services/shared-service.service';

@Component({
  selector: 'customer-info',
  templateUrl: './customer-info.component.html',
  styleUrls: ['./customer-info.component.scss']
})

export class CustomerInfoComponent implements OnInit {
  account: UserInfo;
  data = new Customer();
  updateData = new Customer();
  customerId = null;
  countries = [];
  provinces = [];
  selectedCountry;
  selectedProvince;

  timeZones = [];
  selectedTabIndex = 0;
  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;
  inputMaxEmail: number = VARIABLES.INPUT_MAX_EMAIL;
  inputMaxUserName: number = VARIABLES.INPUT_MAX_USER_NAME;
  inputMaxPass: number = VARIABLES.INPUT_MAX_PASSWORD;
  constructor(
    private sharedService: SharedService,
    private _PhoneNumberComponent: PhoneNumberComponent,
    private activatedRoute: ActivatedRoute,
    public _UserService: UserService,

    private customerService: CustomerService,

    private _UtilitiesService: UtilitiesService,
    private _ValidateCustomService: ValidateCustomService,
    public _ValidateService: ValidateService,
    private _StringService: StringService,
  ) { }

  ngOnInit() {
    this.account = this._UserService.getAuthorization();
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.customerId = params['id'];
      }
      if (params['selectedTabIndex']) {
        this.selectedTabIndex = params['selectedTabIndex']
      }
    });
    this.getTimeZOne();
    this.loadCutomerInformation();

    // init data
    this.updateData.provinceId = -1;
    this.updateData.provinceId = -1;
    this.data.provinceId = -1;
    this.data.provinceId = -1;
  }

  /**
   * Load customer information
   */
  loadCutomerInformation() {
    this._UtilitiesService.showLoading();
    this.getCustomerInfomation().then(() => {
      this.getListCountries();
      this._UtilitiesService.stopLoading();
    });
  }

  /**
   * Get list country from server
   */
  getListCountries() {
    return this.customerService.getCountry().then(result => {
      if (result) {
        this.countries = result.content;
        this.getListProvinceByCountryId();
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  /**
   * Get customer infomation from server
   */
  getCustomerInfomation() {
    let requestParam = {
      id: this.customerId
    };
    return this.customerService.getCustomerDetail(requestParam).then(result => {
      if (result) {
        this.data = result;
        this.handleCountryProvince();
        this.updateData = _.clone(this.data);
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
      if (element.id === this.data.countryId) {
        this.provinces = element.provinces;
      }
    });
  }

  /**
   * Change country
   */
  changeCountry(countryId) {
    this.updateData.provinceId = -1;
    if (this.updateData.countryId > 0) {
      this.provinces = this.countries.filter((o) => {
        return o.id == this.updateData.countryId;
      })[0].provinces;
    } else {
      this.provinces = [];
    }
  }

  // defaul value country and province is -1
  handleCountryProvince() {
    if (!this.data.countryId) {
      this.data.countryId = -1;
      this.data.provinceId = -1;
    } else if (!this.data.provinceId) {
      this.data.provinceId = -1;
    }
  }

  trimForm() {
    this.updateData.customerName = _.trim(this.updateData.customerName);
    this.updateData.address = _.trim(this.updateData.address);
    this.updateData.email = _.trim(this.updateData.email);
    this.updateData.userName = _.trim(this.updateData.userName);
    this.updateData.password = _.trim(this.updateData.password);
    this.updateData.confirmPassword = _.trim(this.updateData.confirmPassword);
  }

  isValidForm() {
    // check valid input
    if (!this._ValidateService.checkValidInputName(this.updateData.customerName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }

    if (!this.updateData.email) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } else if (!this._ValidateService.validateEmail(this.updateData.email)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["4"]);
      return false;
    }

    // let phone number module show message
    if (!this._PhoneNumberComponent.validate(this.updateData.phoneNumber)) {
      return false;
    }
    return true;
  }

  checkRequiredField() {
    if (!this.updateData.customerName) {
      this._UtilitiesService.showWarning(LocalMessages.messages["15"]);
      return false;
    }
    if (!this.updateData.email) {
      this._UtilitiesService.showWarning(LocalMessages.messages["15"]);
      return false;
    }
    return true;
  }

  handleUpdateCustomerInfo() {
    if (!this.checkRequiredField()) {
      return;
    }
    this.trimForm();
    if (!this.isValidForm()) {
      return;
    }
    this.updateCustomerInfo();
  }

  /**
   * Update customer info to server
   * @param item 
   */
  updateCustomerInfo() {
    this._UtilitiesService.showLoading();
    const request = this.prepareUpdateData(this.updateData);
    return this.customerService.updateCustomer(request).then(result => {
      if (result) {
        this.data = _.cloneDeep(this.updateData);
        this._UtilitiesService.stopLoading();
        this._UtilitiesService.showSuccess(LocalMessages.messages["11"]);
      }
    }, error => {
      this._UtilitiesService.stopLoading();
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
    });
  }
  prepareUpdateData(item) {
    let request = {
      id: item.id,
      customerName: item.customerName,
      email: item.email,
      countryId: item.countryId,
      provinceId: item.provinceId,
      phoneNumber: item.phoneNumber,
      address: item.address,
      roleId: item.roleId,
      languageId: item.languageId,
      timezoneId: item.timezoneId,
    }
    if (request.countryId == -1) {
      request.countryId = null;
      request.provinceId = null;
    } else if (request.provinceId == -1) {
      request.provinceId = null;
    }
    return request
  }

  compareDataInfo() {
    if (!_.isEqual(this.data.customerName, this.updateData.customerName)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
      return false;
    } else if (!_.isEqual(this.data.email, this.updateData.email)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
      return false;
    } else if (!_.isEqual(this.data.countryId, this.updateData.countryId)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
      return false;
    } else if (!_.isEqual(this.data.provinceId, this.updateData.provinceId)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
      return false;
    } else if (!_.isEqual(this.data.address, this.updateData.address)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
      return false;
    } else if (!_.isEqual(this.data.phoneNumber, this.updateData.phoneNumber)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
      return false;
    } else if (!_.isEqual(this.data.timezoneId, this.updateData.timezoneId)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
      return false;
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
    return true;
  }

  getTimeZOne() {
    this.customerService.getTimeZone().then(response => {
      this.timeZones = response;
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  ngOnDestroy() {
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
  }
}