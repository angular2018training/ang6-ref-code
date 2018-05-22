import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BaseLineService } from '../api-service/base-line.service';
import { UtilitiesService } from 'app/services/utilities.service';
import { ValidateCustomService } from 'app/services/validate.service';
import { MESSAGE, VARIABLES } from '../constant';
import * as _ from 'lodash';
import { LocalMessages } from '../message';
import { SharedService } from '../services/shared-service.service';

export class BaseLine {
  jan?: number = 0;
  feb?: number = 0;
  mar?: number = 0;
  apr?: number = 0;
  may?: number = 0;
  jun?: number = 0;
  jul?: number = 0;
  aug?: number = 0;
  sep?: number = 0;
  oct?: number = 0;
  nov?: number = 0;
  dec?: number = 0;
}

@Component({
  selector: 'base-line',
  templateUrl: './base-line.component.html',
  styleUrls: ['./base-line.component.scss']
})
export class BaseLineComponent implements OnInit {
  @Output('isChanged') isChanged = new EventEmitter<boolean>();

  emitChangeValue(value) {
    this.isChanged.emit(value);
  }

  @Input() chillerPlantID;

  data = new BaseLine();

  currentData = new BaseLine();
  constructor(
    private sharedService: SharedService,
    private _UtilitiesService: UtilitiesService,
    private _ValidateCustomService: ValidateCustomService,
    private baseLineService: BaseLineService,
  ) {
  }

  ngOnInit() {
    this.reloadData();
  }

  reloadData(){
    this._UtilitiesService.showLoading();
    this.getBaseLine().then(()=>{
      this._UtilitiesService.stopLoading();
    })
  }
  getBaseLine() {
    return this.baseLineService.getBaseLine({
      plantid: this.chillerPlantID
    }).then(result => {
      if (result) {
        if (result.jan) {
          this.data.jan = result.jan;
        }
        if (result.feb) {
          this.data.feb = result.feb;
        }
        if (result.mar) {
          this.data.mar = result.mar;
        }
        if (result.apr) {
          this.data.apr = result.apr;
        }
        if (result.may) {
          this.data.may = result.may;
        }
        if (result.jun) {
          this.data.jun = result.jun;
        }
        if (result.jul) {
          this.data.jul = result.jul;
        }
        if (result.aug) {
          this.data.aug = result.aug;
        }
        if (result.sep) {
          this.data.sep = result.sep;
        }
        if (result.oct) {
          this.data.oct = result.oct;
        }
        if (result.nov) {
          this.data.nov = result.nov;
        }
        if (result.dec) {
          this.data.dec = result.dec;
        }
        this.currentData = _.cloneDeep(this.data);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  updateBaseLine() {
    let jan = Number(this.data.jan);
    let feb = Number(this.data.feb);
    let mar = Number(this.data.mar);
    let apr = Number(this.data.apr);
    let may = Number(this.data.may);
    let jun = Number(this.data.jun);
    let jul = Number(this.data.jul);
    let aug = Number(this.data.aug);
    let sep = Number(this.data.sep);
    let oct = Number(this.data.oct);
    let nov = Number(this.data.nov);
    let dec = Number(this.data.dec);

    if (isNaN(jan) || jan < 0 ||
      isNaN(feb) || feb < 0 ||
      isNaN(mar) || mar < 0 ||
      isNaN(apr) || apr < 0 ||
      isNaN(may) || may < 0 ||
      isNaN(jun) || jun < 0 ||
      isNaN(jul) || jul < 0 ||
      isNaN(aug) || aug < 0 ||
      isNaN(sep) || sep < 0 ||
      isNaN(oct) || oct < 0 ||
      isNaN(nov) || nov < 0 ||
      isNaN(dec) || dec < 0) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
    } else {
      let requestBody = {
        chillerPlantId: this.chillerPlantID,
        jan: Number(jan),
        feb: Number(feb),
        mar: Number(mar),
        apr: Number(apr),
        may: Number(may),
        jun: Number(jun),
        jul: Number(jul),
        aug: Number(aug),
        sep: Number(sep),
        oct: Number(oct),
        nov: Number(nov),
        dec: Number(dec)
      }

      this._UtilitiesService.showLoading();
      return this.baseLineService.updateBaseLine(requestBody).then(result => {
        this._UtilitiesService.showSuccess(LocalMessages.messages["11"]);
      }, error => {
        this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
      }).then(() => {
        this._UtilitiesService.stopLoading();
        this.reloadData();        
      });
    }
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
  }

  floatInput(event, value) {
    if (value.indexOf(".") != -1 && event.charCode === 46) {
      return false;
    } else {
      return event.charCode >= 48 &&
        event.charCode <= 57 ||
        event.charCode == 46
    }
  }

  compareData() {
    if (Number(this.data.jan) === this.currentData.jan &&
      Number(this.data.feb) === this.currentData.feb &&
      Number(this.data.mar) === this.currentData.mar &&
      Number(this.data.apr) === this.currentData.apr &&
      Number(this.data.may) === this.currentData.may &&
      Number(this.data.jun) === this.currentData.jun &&
      Number(this.data.jul) === this.currentData.jul &&
      Number(this.data.aug) === this.currentData.aug &&
      Number(this.data.sep) === this.currentData.sep &&
      Number(this.data.oct) === this.currentData.oct &&
      Number(this.data.nov) === this.currentData.nov &&
      Number(this.data.dec) === this.currentData.dec) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
    return false;
  }
}