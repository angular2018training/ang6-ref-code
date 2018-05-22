import * as _ from 'lodash';

import { Component, OnInit, ViewChild, ElementRef, HostBinding } from '@angular/core';
import { Router } from '@angular/router';
import { UtilitiesService } from 'app/services/utilities.service';
import { ValidateService } from 'app/services/validate.service';

import { VARIABLES, PAGES } from '../constant';
import { LocalMessages } from '../message';

import { OperatorService } from 'app/api-service/operator.service';

@Component({
  selector: 'change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {
  email: string = '';
  sourceEmail = _.cloneDeep(this.email);
  isEqual = _.isEqual;

  emailInvalid = LocalMessages.messages['5'];
  isValidCaptcha: boolean = false;  

  constructor(
    private _OperatorService: OperatorService,
    private router: Router,
    private _UtilitiesService: UtilitiesService,
    private _ValidateService: ValidateService,
  ) { }
  ngOnInit() {
    
  }  

  //view
  send() {
    if (!this._ValidateService.validateEmail(this.email)) {
      this._UtilitiesService.showWarning(this.emailInvalid);
      return;
    }
    this._UtilitiesService.showLoading();
    this._OperatorService.forgotPassword({ email: this.email }).then((rs) => {
      this.sourceEmail = _.cloneDeep(this.email);

      let msg = rs && rs.message ? rs.message : 'Send successfully';
      this._UtilitiesService.showSuccess(msg);
      this._UtilitiesService.hideLoading();
    }).catch((err) => {
      this.sourceEmail = _.cloneDeep(this.email);
      this._UtilitiesService.hideLoading();
      let msg = err.json && err.json().errors ? err.json().errors[0].message : 'Send fail';
      this._UtilitiesService.showError(msg);
    });
  }

  resolved(captchaResponse: string) {
  }
}