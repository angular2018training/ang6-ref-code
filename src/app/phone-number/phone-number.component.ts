import * as _ from 'lodash';

import { Component, OnInit, Input, forwardRef, ViewChild, ElementRef } from '@angular/core';
import { COUNTRY_CODE } from '../operator-list/operator-data.component';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { VARIABLES } from '../constant';

import { UtilitiesService } from '../services/utilities.service';
import { StringService } from "../services/string.service";
import { ValidateService } from '../services/validate.service';
import { LocalMessages } from '../message';

const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PhoneNumberComponent),
  multi: true
};

@Component({
  selector: 'phone-number',
  templateUrl: './phone-number.component.html',
  styleUrls: ['./phone-number.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class PhoneNumberComponent implements ControlValueAccessor {
  paddingLeft: number = 30;
  minPhoneNumber: number = VARIABLES.MIN_PHONE_NUMBER;
  maxPhoneNumber: number = VARIABLES.MAX_PHONE_NUMBER;

  required = LocalMessages.messages['2'];
  countryCodes = _.cloneDeep(COUNTRY_CODE);
  countryCode: string = this.countryCodes[0].code;

  private innerValue: any = '';

  $inputPhone = null;
  // @ViewChild("phoneF") phoneInput: ElementRef;
  // @ViewChild("inputPhone") inputPhone: ElementRef;

  constructor(
    private _UtilitiesService: UtilitiesService,
    private _StringService: StringService,
    private _ValidateService: ValidateService
  ) { }
  ngOnInit() {
    // console.log(this.phoneInput);
    // console.log(this.phoneInput['selectionStart']);
    // console.log(this.inputPhone['selectionStart']);
    // console.log($('.input_phone_number'));
  }
  ngAfterViewInit() {
    // console.log($('.input_phone_number'));
  }

  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  get value(): any {
    return this.innerValue;
  };

  set value(v: any) {
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(this.countryCode + '/' + v);
    }
  }

  onBlur() {
    this.onTouchedCallback();
  }

  writeValue(value: any) {
    if (value !== this.innerValue) {
      if (value != null) {
        let temp = value.split('/');
        let tempUpdate = null;
        if (temp.length == 2) {
          this.innerValue = temp[1];

          this.removeFirst();
          this.countryCode = temp[0];
          this.paddingLeft = temp[0].length * 10;

          tempUpdate = temp[1];
        } else {
          this.innerValue = value;
          this.countryCode = this.countryCodes[0].code;
          this.paddingLeft = this.countryCode.length * 10;
          tempUpdate = this.value;
        }
        this.value = tempUpdate + 1;
        this.value = tempUpdate;
      }
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  getPhoneNumber(phoneNumber) {
    if (!this._StringService.isEmpty(phoneNumber)) {
      let arrPhone = phoneNumber.split('/');
      if (arrPhone.length == 2) {
        return arrPhone[0] + ' ' + arrPhone[1];
      }
    }
    return phoneNumber;
  }

  validate(phoneNumber) {
    if (phoneNumber) {
      let phoneValue = phoneNumber.split('/');
      let toNumber = Number(phoneValue[1]);
      if (phoneValue.length == 2) {
        if (this._StringService.isEmpty(phoneValue[1])) {
          this._UtilitiesService.showWarning(LocalMessages.messages["15"]);
          return false;
        } else if (phoneValue[0] == '') {
          this._UtilitiesService.showWarning(LocalMessages.messages["15"]);
          return false;
        } else if (!this.checkLengthPhone(phoneValue[1])) {
          this._UtilitiesService.showWarning(LocalMessages.messages["102"]);
          return false;
        } else if (isNaN(toNumber)) {
          this._UtilitiesService.showWarning(LocalMessages.messages["102"]);
          return false;
        }
        return true;
      }
    }
    this._UtilitiesService.showWarning(LocalMessages.messages["15"]);
    return false;
  }
  checkLengthPhone(phoneNumber) {
    return phoneNumber.length >= this.minPhoneNumber && phoneNumber.length <= this.maxPhoneNumber;
  }
  removeFirst() {
    if (this.countryCodes[0].code == '') {
      this.countryCodes.splice(0, 1);
    }
  }
  isSelect() {
    if (this.$inputPhone == null) {
      this.$inputPhone = $('.input_phone_number')[0];
    }
    if (typeof this.$inputPhone.selectionStart == "number") {
      return this.$inputPhone.selectionStart != this.$inputPhone.selectionEnd;
    }
    return false;
    // if (typeof input.selectionStart == "number") {
    //   return input.selectionStart == 0 && input.selectionEnd == input.value.length;
    // }
  }

  //view
  checkInput(e) {
    if (e.keyCode === 32) {
      return false;
    }
    if (e.keyCode == 9 ||
      e.keyCode == 8 ||
      e.keyCode == 9 ||
      e.keyCode == 35 ||
      e.keyCode == 36 ||
      e.keyCode == 37 ||
      e.keyCode == 39 ||
      e.keyCode == 46
    ) {
      return true;
    }
    // if (isNaN(e.key) || this.value.length >= this.maxPhoneNumber) {
    //   return false;
    // }

    if (this.value.length >= this.maxPhoneNumber && this.isSelect()) {
      return true;
    }
    if (isNaN(e.key) || this.value.length >= this.maxPhoneNumber) {
      return false;
    }
  }
  changeCountry(e) {
    this.removeFirst();
    this.paddingLeft = e.value.length * 10;
    let temp = this.value;
    this.value = temp + 1;
    this.value = temp;
  }
}