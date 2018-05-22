// import { ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef, ViewChildren } from '@angular/core';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { Observable } from 'rxjs/Observable';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import * as _ from 'lodash';
import { VARIABLES } from "../constant";
import { SharedService } from '../services/shared-service.service';
import { LocalMessages } from '../message';

@Component({
  selector: 'system-parameter',
  templateUrl: './system-parameter.component.html',
  styleUrls: ['./system-parameter.component.scss']
})

export class SystemParameterComponent implements OnInit {
  selectedTabIndex = 0;
  constructor(
    private sharedService: SharedService,
    private _dataTableService: TdDataTableService,
     private _UtilitiesService: UtilitiesService) { }

  ngOnInit() {
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
}
