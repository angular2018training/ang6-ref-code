import * as _ from 'lodash';

import { Component, OnInit, Input, forwardRef, ViewChild } from '@angular/core';
import { COUNTRY_CODE } from '../operator-list/operator-data.component';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

import { VARIABLES } from '../constant';

import { UtilitiesService } from '../services/utilities.service';
import { StringService } from "../services/string.service";

const noop = () => { };

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DayInYearComponent),
  multi: true
};

@Component({
  selector: 'day-in-year',
  templateUrl: './day-in-year.component.html',
  styleUrls: ['./day-in-year.component.scss'],
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class DayInYearComponent implements ControlValueAccessor {
  paddingLeft: number = 30;
  minPhoneNumber: number = VARIABLES.MIN_PHONE_NUMBER;
  maxPhoneNumber: number = VARIABLES.MAX_PHONE_NUMBER;

  countryCodes = _.cloneDeep(COUNTRY_CODE);
  countryCode: string = this.countryCodes[0].code;

  private innerValue: any = '';

  constructor(
    private _UtilitiesService: UtilitiesService,
    private _StringService: StringService,
  ) { }
  // ngOnInit(){
  //   // this.paddingLeft = e.value.length * 10;
  // }

  //Placeholders for the callbacks which are later provided
  //by the Control Value Accessor
  private onTouchedCallback: () => void = noop;
  private onChangeCallback: (_: any) => void = noop;

  //get accessor
  get value(): any {
    return this.innerValue;
  };

  //set accessor including call the onchange callback
  set value(v: any) {
    // if (v !== this.innerValue) {
    //   this.innerValue = v;
    //   this.onChangeCallback(v);
    // }
    if (v !== this.innerValue) {
      this.innerValue = v;
      this.onChangeCallback(this.countryCode + '/' + v);
    }
  }

  //Set tou on blur
  onBlur() {
    this.onTouchedCallback();
  }

  //From ControlValueAccessor interface
  writeValue(value: any) {
    // if (value !== this.innerValue) {
    //   if (value != null) {
    //     let temp = value.split('/');
    //     let tempUpdate = null;
    //     if (temp.length == 2) {
    //       this.innerValue = temp[1];

    //       this.removeFirst();
    //       this.countryCode = temp[0];
    //       this.paddingLeft = temp[0].length * 10;

    //       // this.value = temp[1] + 1;
    //       // this.value = temp[1];
    //       tempUpdate = temp[1];
    //     } else {
    //       this.innerValue = value;
    //       this.countryCode = this.countryCodes[0].code;
    //       this.paddingLeft = this.countryCode.length * 10;
    //       tempUpdate = this.value;
    //     }
    //     this.value = tempUpdate + 1;
    //     this.value = tempUpdate;
    //   }
    // }

    if (value !== this.innerValue && value != null) {
      this.value = value;
      this.innerValue = value;
    }
  }

  //From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  //From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  // validate(phoneNumber) {
  //   let phoneValue = phoneNumber.split('/');
  //   if (phoneValue.length == 2) {
  //     if (this._StringService.isEmpty(phoneValue[1])) {
  //       this._UtilitiesService.showWarning('Please Input Phone Number');
  //       return false;
  //     } else if (!this.checkLengthPhone(phoneValue[1])) {
  //       this._UtilitiesService.showWarning('Phone Number Invalid');
  //       return false;
  //     } else if (phoneValue[0] == '') {
  //       this._UtilitiesService.showWarning('Please select country');
  //       return false;
  //     }
  //     return true;
  //   }
  //   this._UtilitiesService.showWarning('Please Input Phone Number');
  //   return false;
  // }
  // checkLengthPhone(phoneNumber) {
  //   return phoneNumber.length > this.minPhoneNumber && phoneNumber.length <= this.maxPhoneNumber;
  // }
  // removeFirst() {
  //   // let findValue = _.filter(this.countryCodes, ['id', '']);
  //   // if (findValue.length == 1) {
  //   //   this.countryCodes.splice(0, 1);
  //   // }

  //   if (this.countryCodes[0].code=='') {
  //     this.countryCodes.splice(0, 1);
  //   }
  // }

  // //view
  // checkInput(e) {
  //   // console.log(e);
  //   if (e.keyCode == 8 ||
  //     e.keyCode == 35 ||
  //     e.keyCode == 36 ||
  //     e.keyCode == 37 ||
  //     e.keyCode == 39
  //   ) {
  //     return true;
  //   }
  //   // if (isNaN(e.key) || this.value.length > this.maxPhoneNumber || this.value.length < this.minPhoneNumber) {
  //   //   return false;
  //   // }
  //   if (isNaN(e.key) || this.value.length >= this.maxPhoneNumber) {
  //     return false;
  //   }
  // }
  // changeCountry(e) {
  //   if (e.index != 0) {
  //     this.countryCodes.splice(0, 1);
  //     this.paddingLeft = e.value.length * 10;
  //     let temp = this.value;
  //     this.value = temp + 1;
  //     this.value = temp;
  //   }
  // }
}