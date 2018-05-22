// import { ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit, ViewChild, ElementRef, ViewContainerRef, ViewChildren } from '@angular/core';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { Observable } from 'rxjs/Observable';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import * as _ from 'lodash';
import { VARIABLES } from "../constant";
import {SystemDefaultParameterService} from '../api-service/system-default-parameter.service';
import { LocalMessages } from '../message';
import { SharedService } from "../services/shared-service.service";

@Component({
  selector: 'system-default-parameter',
  templateUrl: './system-default-parameter.component.html',
  styleUrls: ['./system-default-parameter.component.scss']
})

export class SystemDefaultParameterComponent implements OnInit {
  savedData = [];

  columns: ITdDataTableColumn[] = [
    { name: 'parameterName', label: 'Parameter Name', sortable: true },
    { name: 'unit', label: 'Unit', sortable: true },
    { name: 'value', label: 'Value', sortable: true },
  ];

  data = [];
  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  // pageSize: number = this.pageSizes[0];
  pageSize: number = 20;
  sortBy: string = 'parameterName';
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  selectedTabIndex;


  constructor(
    private sharedService: SharedService,
    private systemDefaultParameterService : SystemDefaultParameterService,
    private _dataTableService: TdDataTableService,
    private _UtilitiesService: UtilitiesService) { }

  ngOnInit() {
    this.getDefaultParameter().then(() => {
      this.filter();
    });;
  }

  getDefaultParameter() {
    this._UtilitiesService.showLoading();
    return this.systemDefaultParameterService.getDefaultParameter().then(result => {
      this._UtilitiesService.hideLoading();
      if (result && result.content) {
        this.data = result.content
        this.savedData = _.cloneDeep(this.data), ['id'];
      } else {
        this.data = [];
      }
    }, error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  updateDefaultParameter() {
    let requestData = this.data;
    let validateHasError = false;
    requestData.forEach(element => {
      let temp = element.value.toString();
      switch(element.id) {
        case 1://Conversion factor from RT to kW
          if (temp < 3 || temp > 4) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 2://Conversion factor for Chiller’s “Input Power [ kW]”
          if (temp <= 0 || temp > 5) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 3://Water heat capacity
          if (temp < 4 || temp > 5) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 4://Conversion factor for CT’s Capacity [ kW]
          if (temp <= 0 || temp > 5) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 5://Conversion factor for CT’s “Water Flow Rate [ m3/min]”
          if (temp <= 0 || temp > 1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 6://Conversion factor for CT’s “Air Volume [ m3/min]”
          if (temp <= 0 || temp > 5) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 7://Chiller’s default parameter “Entering Chilled Water Temperature”
          if (temp < 10 || temp > 20) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 8://Chiller’s default parameter “Leaving Chilled Water Temperature”
          if (temp <= 0 || temp > 15) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 9://Chiller’s default parameter “Entering Condenser Water Temperature”
          if (temp < 20 || temp > 35) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 10://Chiller’s default parameter “Leaving Condenser Water Temperature”
          if (temp < 25 || temp > 40) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 11://Pump’s default parameter “Head(Proportional factor)”
          if (temp < 0 || temp > 10) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 12://Pump’s default parameter “Maximum Flow Rate Ratio”
          if (temp < 50 || temp > 250 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 13://Pump’s default parameter “Minimum Flow Rate Ratio”
          if (temp < 0 || temp > 100 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 14://CT’s default parameter “Outdoor Wet-bulb Temperature”
          if (temp < 10 || temp > 35) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 15://CT’s default parameter “Maximum Air Volume Rate”
          if (temp < 50 || temp > 250 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 16://CT’s default parameter “Minimum Air Volume Rate”
          if (temp < 0 || temp > 100 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 17://CT’s default parameter “Rated Frequency”
          if (temp < 40 || temp > 80 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 18://Lower limit of optimal search for condenser water pump flow rate ratio
          if (temp < 0 || temp > 100 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 19://Upper limit of optimal search for condenser water pump flow rate ratio
          if (temp < 50 || temp > 250 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 20://Interval of optimal search for condenser water pump flow rate ratio
          if (temp <= 0 || temp > 50 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 21://Lower limit of optimal search for condenser water temperature
          if (temp <= 0 || temp > 30 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 22://Upper limit of optimal search for condenser water temperature
          if (temp < 20 || temp > 40 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        case 23://Interval of optimal search for condenser water temperature
          if (temp <= 0 || temp > 5) {
            this._UtilitiesService.showWarning("Invalid input for " + element.parameterName);
            validateHasError = true;
            break;
          }
          break;
        default:
            break;
      }
    });
    if (!validateHasError) {
      this._UtilitiesService.showLoading();
      return this.systemDefaultParameterService.updateDefaultParameter(requestData).then(result => {
        this._UtilitiesService.hideLoading();
        if (result) {
          this._UtilitiesService.showSuccess(LocalMessages.messages["11"]);
          this.savedData = _.cloneDeep(this.data), ['id'];
        }
      }, error => {
        this._UtilitiesService.hideLoading();
        this._UtilitiesService.showErrorAPI(error, null);
      });
    }
  }

  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  filter() {
    let newData: any[] = this.data;
    let excludedColumns: string[] = this.columns
      .filter((column: ITdDataTableColumn) => {
        return ((column.filter === undefined && column.hidden === true) ||
          (column.filter !== undefined && column.filter === false));
      }).map((column: ITdDataTableColumn) => {
        return column.name;
      });
    newData = this._dataTableService.filterData(newData, this.searchTerm, true, excludedColumns);
    this.filteredTotal = newData.length;
    newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
    newData = this._dataTableService.pageData(newData, this.fromRow, newData.length);
    this.filteredData = newData;
  }

  //view
  modelChangeText(e, row) {
    let currentValue = row.value;
    let temp = e.srcElement.value;
    if (row.value != temp) {
      if (isNaN(temp)) {
        this._UtilitiesService.showWarning(LocalMessages.messages["1"]);
        return false;
      }
      switch(row.id) {
        case 1://Conversion factor from RT to kW
          if (temp < 3 || temp > 4) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 3)
          break;
        case 2://Conversion factor for Chiller’s “Input Power [ kW]”
          if (temp <= 0 || temp > 5) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 3)
          break;
        case 3://Water heat capacity
          if (temp < 4 || temp > 5) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 3)
          break;
        case 4://Conversion factor for CT’s Capacity [ kW]
          if (temp <= 0 || temp > 5) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 2)
          break;
        case 5://Conversion factor for CT’s “Water Flow Rate [ m3/min]”
          if (temp <= 0 || temp > 1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 5)
          break;
        case 6://Conversion factor for CT’s “Air Volume [ m3/min]”
          if (temp <= 0 || temp > 5) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 2)
          break;
        case 7://Chiller’s default parameter “Entering Chilled Water Temperature”
          if (temp < 10 || temp > 20) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 2)
          break;
        case 8://Chiller’s default parameter “Leaving Chilled Water Temperature”
          if (temp <= 0 || temp > 15) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 2)
          break;
        case 9://Chiller’s default parameter “Entering Condenser Water Temperature”
          if (temp < 20 || temp > 35) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 2)
          break;
        case 10://Chiller’s default parameter “Leaving Condenser Water Temperature”
          if (temp < 25 || temp > 40) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 2)
          break;
        case 11://Pump’s default parameter “Head(Proportional factor)”
          if (temp < 0 || temp > 10) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 2)
          break;
        case 12://Pump’s default parameter “Maximum Flow Rate Ratio”
          if (temp < 50 || temp > 250 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = temp;
          break;
        case 13://Pump’s default parameter “Minimum Flow Rate Ratio”
          if (temp < 0 || temp > 100 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = temp;
          break;
        case 14://CT’s default parameter “Outdoor Wet-bulb Temperature”
          if (temp < 10 || temp > 35) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 2)
          break;
        case 15://CT’s default parameter “Maximum Air Volume Rate”
          if (temp < 50 || temp > 250 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = temp;
          break;
        case 16://CT’s default parameter “Minimum Air Volume Rate”
          if (temp < 0 || temp > 100 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = temp;
          break;
        case 17://CT’s default parameter “Rated Frequency”
          if (temp < 40 || temp > 80 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = temp;
          break;
        case 18://Lower limit of optimal search for condenser water pump flow rate ratio
          if (temp < 0 || temp > 100 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = temp;
          break;
        case 19://Upper limit of optimal search for condenser water pump flow rate ratio
          if (temp < 50 || temp > 250 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = temp;
          break;
        case 20://Interval of optimal search for condenser water pump flow rate ratio
          if (temp <= 0 || temp > 50 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = temp;
          break;
        case 21://Lower limit of optimal search for condenser water temperature
          if (temp <= 0 || temp > 30 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = temp;
          break;
        case 22://Upper limit of optimal search for condenser water temperature
          if (temp < 20 || temp > 40 || temp.indexOf(".") != -1) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = temp;
          break;
        case 23://Interval of optimal search for condenser water temperature
          if (temp <= 0 || temp > 5) {
            this._UtilitiesService.showWarning("Invalid input for " + row.parameterName);
            row.value = temp;
            break;
          }
          row.value = this._UtilitiesService.roundDecimal(temp, 1)
          break;
        default:
            break;
      }
    }
  }
  changeText($event) {
    $event.preventDefault();
    $event.stopPropagation();
  }
  clickText($event) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  disableSaveButton() {
    this.data = _.sortBy(this.data, ['id']);
    this.savedData = _.sortBy(this.savedData, ['id']);

    if (_.isEqual(this.data, this.savedData)) {
      this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
      return true;
    }
    this.sharedService.setData(VARIABLES.DATA_CHANGED, true);
    return false;
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

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.sharedService.setData(VARIABLES.DATA_CHANGED, false);
  }
}
