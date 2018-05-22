import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { UtilitiesService } from 'app/services/utilities.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ChillerPlantService } from '../api-service/chiller-plant.service'
import { LocalMessages } from '../message';
import { SharedService } from "../services/shared-service.service";
import {VARIABLES} from '../constant';

@Component({
  selector: 'app-chiller-plant-detail',
  templateUrl: './chiller-plant-detail.component.html',
  styleUrls: ['./chiller-plant-detail.component.scss']
})
export class ChillerPlantDetailComponent implements OnInit {
  @Input('chillerPlantID') chillerPlantID: number;
  @Output('isCancel') isCancel = new EventEmitter<boolean>();
  isChanged;
  dataChange = false;
  selectedTabIndex = 0;

  constructor(
    private sharedService: SharedService,
    private _UtilitiesService: UtilitiesService
  ) { 
  }
  ngOnInit() {
  }

  tabChanged(event) {

  }

  // cancel action
  cancelDetail() {
    this.isCancel.emit(false);
  }

  setIsChange(value) {
    this.dataChange = value;
  }

  handleIsChanged(event) {
    this.isChanged = event;
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
