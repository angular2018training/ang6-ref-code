import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ESExpectationService } from '../api-service/es-expectation.service';
import { UtilitiesService } from 'app/services/utilities.service';
import { ValidateCustomService } from 'app/services/validate.service';
import { MESSAGE, VARIABLES } from '../constant';
import * as _ from 'lodash';
import { LocalMessages } from '../message';
import { SharedService } from "../services/shared-service.service";

@Component({
  selector: 'es-expectation',
  templateUrl: './es-expectation.component.html',
  styleUrls: ['./es-expectation.component.scss']
})
export class ESExpectationComponent implements OnInit {
  @Output('isChanged') isChanged = new EventEmitter<boolean>();

  emitChangeValue(value) {
    this.isChanged.emit(value);
  }

  @Input() chillerPlantID;

  data = {
    percentageOfEs: 0,
    period: 0,
    id: 0
  }

  currentData = {
    percentageOfEs: 0,
    period: 0
  }

  subjectDataChange;
  subjectSaveSuccess;

  constructor(
    private sharedService: SharedService,
    private _UtilitiesService: UtilitiesService,
    private _ValidateCustomService: ValidateCustomService,
    private esExpectationService: ESExpectationService,
  ) {
  }

  ngOnInit() {
    this.getESExpectationList();
  }

  getESExpectationList() {
    this._UtilitiesService.showLoading();
    return this.esExpectationService.getESExpectationList({
      id: this.chillerPlantID
    }).then(result => {
      if (result) {
        if (result.percentageOfEs) {
          this.data.percentageOfEs = result.percentageOfEs;
        }
        if (result.period) {
          this.data.period = result.period;
        }
        this.currentData = _.cloneDeep(this.data);
        // this._UtilitiesService.hideLoading();
        this._UtilitiesService.stopLoading();
      }
    }, error => {
      // this._UtilitiesService.hideLoading();
      this._UtilitiesService.stopLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  updateESExpectation() {
    let period = Number(this.data.period);
    let perpercentageOfEsiod = Number(this.data.percentageOfEs);

    if (isNaN(perpercentageOfEsiod) || isNaN(period)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
      return;
    }

    if (perpercentageOfEsiod <= 0 || perpercentageOfEsiod >= 100) {
      this._UtilitiesService.showWarning(LocalMessages.messages["111"]);
      return;
    }

    if (period < 0) {
      this._UtilitiesService.showWarning(LocalMessages.messages["112"]);
      return;
    }

    this._UtilitiesService.showLoading();
    let requestBody = {
      id: this.data.id,
      period: this.data.period,
      chillerPlantId: this.chillerPlantID,
      percentageOfEs: this._UtilitiesService.roundDecimal(this.data.percentageOfEs, 2)
    }
    return this.esExpectationService.updateESExpectation(requestBody).then(result => {
      this._UtilitiesService.showSuccess(LocalMessages.messages["11"]);
      this.getESExpectationList();
      // this._UtilitiesService.hideLoading();
      // this._UtilitiesService.hideLoading();
      this._UtilitiesService.stopLoading();
    }, error => {
      // this._UtilitiesService.hideLoading();
      this._UtilitiesService.stopLoading();
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
    });
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

  integerInput(event) {
    return event.charCode >= 48 && event.charCode <= 57;
  }

  compareData() {
    if (!this.data.percentageOfEs || !this.data.period || Number(this.data.percentageOfEs) === this.currentData.percentageOfEs && Number(this.data.period) === this.currentData.period) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
    return false;
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
  }
}