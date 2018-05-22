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
  selector: 'customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss']
})

export class CustomerDetailComponent implements OnInit {
  selectedTabIndex = 0;
  customerId = null;
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
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.customerId = params['id'];
      }
      if (params['selectedTabIndex']) {
        this.selectedTabIndex = params['selectedTabIndex']
      }
    });
  }

  changeTab(index) {
    if (this.sharedService.getData(VARIABLES.DATA_CHANGED)) {
      this._UtilitiesService.showConfirmDialog(LocalMessages.messages["3"], (result) => {
        if (result) {
          this.selectedTabIndex = index;
          this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
        }
      });
    } else {
      this.selectedTabIndex = index;
    }
  }

  ngOnDestroy() {
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
  }
}