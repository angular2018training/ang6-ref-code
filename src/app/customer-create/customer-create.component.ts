import { Component, OnInit, OnDestroy } from '@angular/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { ValidateService } from 'app/services/validate.service';
import { CustomerService } from '../api-service/customer.service';
import { Customer } from '../model/customer';
import { MESSAGE, ROLES, LANGUAGES, VARIABLES} from '../constant';
import { Md5 } from 'ts-md5/dist/md5';
import { Router } from '@angular/router';
import { PAGES } from '../constant';
import { PhoneNumberComponent } from "../phone-number/phone-number.component";
import { StringService } from "../services/string.service";
import {LocalMessages} from '../message';
import * as _ from 'lodash';
import { SharedService } from "../services/shared-service.service";

@Component({
  selector: 'customer-create',
  templateUrl: './customer-create.component.html',
  styleUrls: ['./customer-create.component.scss']
})

export class CustomerCreateComponent implements OnInit {
  required = MESSAGE.ERROR.REQUIRED;
  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;
  inputMaxEmail: number = VARIABLES.INPUT_MAX_EMAIL;
  inputMaxUserName: number = VARIABLES.INPUT_MAX_USER_NAME;
  inputMaxPass: number = VARIABLES.INPUT_MAX_PASSWORD;

  constructor(
    private sharedService: SharedService,
    private _PhoneNumberComponent: PhoneNumberComponent,
    private customerService: CustomerService,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
    private _StringService: StringService,
    private router: Router) { }

  ngOnInit() {
    this.getListCountries();
    this.getTimeZOne();
  }
  countries = [];
  timeZones = [];
  customerID = '';
  customerName;
  selectedCountry = -1;
  selectedProvince = -1;
  selectedTimeZone = -1;
  provinces;
  address;
  email;
  phoneNumber;
  userName;
  password;
  confirmPassword;
  isCreated = false;
  selectedTabIndex = 0;
  
  /**
   * Get drop down list province by selected country 
   */
  getListProvinceByCountryId() {
    this.countries.forEach(element => {
      if (element.id === this.selectedCountry) {
        this.provinces = element.provinces;
      }
    });
  }

  /**
   * Change country event handle
   * @param event 
   */
  changeCountry(event) {
    this.selectedCountry = event.value;
    this.getListProvinceByCountryId();
    // change country -> clear selected province
    this.selectedProvince = -1;
  }

  /**
   * Change province
   * @param event 
   */
  changeProvince(event) {
    this.selectedProvince = event.value;
  }

  /**
   * Get list countries from server
   */
  getListCountries() {
    return this.customerService.getCountry().then(result => {
      if (result) {
        this.countries = result.content;
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  /**
   * Send request create customer
   */
  createCustomer(request) {
    return this.customerService.createCustomer(request).then(result => {
      this.isCreated = true;
      this._UtilitiesService.showSuccess(_.replace(LocalMessages.messages["18"], '%s', 'Customer'));
      let customerID = result.id;
      if (customerID) {
        this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
        this.router.navigate(['/customer-management/customer-list/customer-detail'], { queryParams: { id: customerID, selectedTabIndex: 1 } });
      } else {
        this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
        this.router.navigate([PAGES.OPERATOR.CUSTOMER_LIST]);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  trimForm() {
    this.customerName = _.trim(this.customerName);
    this.address = _.trim(this.address);
    this.userName = _.trim(this.userName);
    this.email = _.trim(this.email);
  }

  isValidForm() {
    if (!this._ValidateService.checkValidInputName(this.customerName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }
    if (!this.email) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    } else if (!this._ValidateService.validateEmail(this.email)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["4"]);
      return false;
    }
    //let phonenumber module show message
    if (!this._PhoneNumberComponent.validate(this.phoneNumber)) {
      return false;
    }

    if (!this._ValidateService.checkValidInputName(this.userName, true)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }
    if (this.password.length < 8 || this.confirmPassword.length < 8) {
      this._UtilitiesService.showWarning(LocalMessages.messages["7"]);
      return false;
    }
    if (!this._ValidateService.checkValidPassword(this.password)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }
    if (!this._ValidateService.checkValidPassword(this.confirmPassword)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return false;
    }
    if (this.password != this.confirmPassword) {
      this._UtilitiesService.showWarning(LocalMessages.messages["8"]);
      return false;
    }
    return true;
  }

  /**
   * Handle save customer button
   */
  saveCustomer() {
    this.trimForm();
    if (!this.isValidForm()) {
      return;
    }
    let request = new Customer();
    request.customerName = this.customerName;
    if (this.selectedCountry != -1) {
      request.countryId = this.selectedCountry;
    }
    if (this.selectedProvince != -1) {
      request.provinceId = this.selectedProvince;
    }
    request.address = this.address;
    request.email = this.email;
    request.phoneNumber = this.phoneNumber;
    request.timezoneId = this.selectedTimeZone;
    request.roleId = ROLES.CUSTOMER_ROLE_ID;
    request.languageId = LANGUAGES.CUSTOMER_LANGUAGE_ID;
    request.userName = this.userName
    request.userPassword = Md5.hashStr(this.password).toString();
    this.createCustomer(request);
  }


  /**
   * Get list timezone from server
   */
  getTimeZOne() {
    this.customerService.getTimeZone().then(response => {
      this.timeZones = response;
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  /**
   * Check data to disable save button
   */
  checkMissingField() {
    if (!this.customerName || !this.email || !this.phoneNumber || this.selectedTimeZone ===-1 || !this.userName || !this.password || !this.confirmPassword) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    } else {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
      return false;
    }
  }
}