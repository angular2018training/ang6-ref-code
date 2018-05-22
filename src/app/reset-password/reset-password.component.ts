import { Component, OnInit, ViewChild, ElementRef, HostBinding } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { UtilitiesService } from 'app/services/utilities.service';
import { ActivatedRoute, Router } from '@angular/router';
import { OperatorService } from 'app/api-service/operator.service';
import { MESSAGE, PAGES } from 'app/constant';
import { Md5 } from 'ts-md5/dist/md5';
import * as _ from 'lodash';
import { ValidateService } from 'app/services/validate.service';
import { LocalMessages } from './../message';

@Component({
  selector: 'reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  isNotMatch = false;
  user = {
    email: '',
    newPassword: '',
    confirmNewPassword: '',
    token: ''
  }

  constructor(private _ValidateService: ValidateService, private router: Router, private route: ActivatedRoute, private _OperatorService: OperatorService, private _UtilitiesService: UtilitiesService) {
    let queryParams = this.route.snapshot.queryParams;
    if (queryParams) {
      this.user.email = queryParams ? queryParams.email : '';
      this.user.token = queryParams ? queryParams.token : '';
    }
  }
  ngOnInit() {

  }

  updatePassword() {
    if (!this._ValidateService.validatePassword(this.user.newPassword) && !this._ValidateService.validatePassword(this.user.confirmNewPassword)) {
      this._UtilitiesService.showWarning(LocalMessages.messages['7']);
      return;
    }

    if (this.user.confirmNewPassword !== this.user.newPassword) {
      this.isNotMatch = true;
      this._UtilitiesService.showWarning(LocalMessages.messages['8']);
      return;
    }

    let obj = _.cloneDeep(this.user);
    obj.newPassword = Md5.hashStr(obj.newPassword).toString();
    obj.confirmNewPassword = Md5.hashStr(obj.confirmNewPassword).toString();

    this._UtilitiesService.showLoading();
    this._OperatorService.resetForgotPassword(obj).then((rs) => {
      let msg = rs && rs.message ? rs.message : MESSAGE.SUCCESS.CHANGE_PASSWORD_SUCCESS;
      this._UtilitiesService.showSuccess(msg);
      this._UtilitiesService.hideLoading();

      this.router.navigate([PAGES.COMMON.LOGIN]);
    }).catch((err) => {
      this._UtilitiesService.hideLoading();
      let msg = err.json && err.json().errors ? err.json().errors[0].message : MESSAGE.ERROR.CHANGE_PASSWORD_ERROR;
      this._UtilitiesService.showError(msg);
    });
    this.isNotMatch = false;
  }
}