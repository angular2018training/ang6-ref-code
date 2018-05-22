import { LocalMessages } from './../message';
import { TdDataTableSortingOrder, IPageChangeEvent, ITdDataTableColumn, TdDataTableService } from '@covalent/core';
import { VARIABLES } from 'app/constant';
import { Component, OnInit, ViewChild } from '@angular/core';
import { EnergyConsumptionService } from '../api-service/energy-consumption.service';
import { UtilitiesService } from 'app/services/utilities.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Moment } from 'moment';
import { DatePickerComponent, IDatePickerConfig } from 'ng2-date-picker';
import { UserReportService } from 'app/api-service/user-report.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-execution-report',
  templateUrl: './execution-report.component.html',
  styleUrls: ['./execution-report.component.scss'],
})
export class ExecutionReportPageComponent implements OnInit {
  @ViewChild('fromMonthPicker') datePicker: DatePickerComponent;

  noResultMessage = LocalMessages.messages["22"];
  
  dataTable = [];
  filterData = [];
  paging = {
    currentPage: 1,
    rowPerPage: 10,
    maxPage: 10,
    totalPage: 3,
    startRow: 1,
    endRow: 1,
    pages: [],
  };
  isShow = false;
  isHide = false;

  customers = [];
  buildings = [];
  chillerPlants = [];
  reportModel = {
    customerId: null,
    customerName: null,
    chillerPlantId: null,
    chillerPlantName: null,
    buildingName: null,
    locationName: null,
    timezoneName: null,
    fromMonth: null,
    toMonth: null,
  };

  formatMonth = 'YYYY-MM';
  fromMonth = moment().format(this.formatMonth);
  toMonth = moment().format(this.formatMonth);
  reportResult: any = {
    "chillerPlantId": 306,
    "customerName": "sangtn",
    "chillerPlantName": "SUPER SANG",
    "buildingName": "HELIOS",
    "locationName": "36E",
    "reportType": 1,
    "fromDateTime": 1514764800000,
    "toDateTime": 1546300800000,
    "exportType": 0,
    "dataTable": [
    ],
    "dataChart": [
    ],
    "periodOfReport": "01/01/2018 - 00:00 AM",
    "actualEnergyConsumption": "-45.83723677339814 kWh",
    "numberOfESInstruction": "3 (A)",
    "numberOfEESInstruction": "3 (B)",
    "numberOfNEESInstruction": "0 (C)",
    "adjActualEnergyConsumption": "-45.83723677339814 kWh",
    "energySavings": "-2.412486145968323 SGD",
    "costSavings": "-0.36187292189524844 SGD"
  };

  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;

  tableData = {
    columns: [],
    searchTerm: '',
    filteredTotal: 0,
    fromRow: 1,
    currentPage: 1,
    pageSize: this.pageSizes[0],
    sortBy: '',
    selectedRows: [],
    sortOrder: TdDataTableSortingOrder.Descending
  };

  page(pagingEvent: IPageChangeEvent): void {
    this.tableData.fromRow = pagingEvent.fromRow;
    this.tableData.currentPage = pagingEvent.page;
    this.tableData.pageSize = pagingEvent.pageSize;
    this.filterDataTable();
  }

  filterDataTable(): void {
    let newData: any[] = this.dataTable;

    const excludedColumns: string[] = this.tableData.columns
      .filter((column: ITdDataTableColumn) => {
        return ((column.filter === undefined && column.hidden === true) ||
          (column.filter !== undefined && column.filter === false));
      }).map((column: ITdDataTableColumn) => {
        return column.name;
      });
    newData = this._dataTableService.filterData(newData, this.tableData.searchTerm, true, excludedColumns);

    newData = this._dataTableService.sortData(newData, this.tableData.sortBy, this.tableData.sortOrder);
    newData = this._dataTableService.pageData(newData, this.tableData.fromRow, this.tableData.currentPage * this.tableData.pageSize);
    this.filterData = newData;
  }

  constructor(
    private _EnergyConsumptionService: EnergyConsumptionService,
    private _UtilitiesService: UtilitiesService,
    private _dataTableService: TdDataTableService,
    private _UserReportService: UserReportService
  ) { }

  ngOnInit() {
    this.getListCustomer().then(rs => {
      this._UtilitiesService.hideLoading();
    });
  }

  getDateTime(date, time) {
    let dt = moment(date);
    let dtStr = dt.format('YYYY-MM-DD');
    return dtStr;
  }

  showReport() {
    this.isShow = true;
    this.isHide = true;

    this.reportResult = {};
    this.dataTable = [];
    this.filterData = [];

    let customer = _.find(this.customers, { id: this.reportModel.customerId });
    if (customer) {
      this.reportModel.customerName = customer.customerName;
      this.reportModel.timezoneName = customer.timezoneName;
    } else {
      this.reportModel.customerName = null;
    }

    let chiller = _.find(this.chillerPlants, { id: this.reportModel.chillerPlantId });
    if (chiller) {
      this.reportModel.chillerPlantName = chiller.chillerPlantName;
    } else {
      this.reportModel.chillerPlantName = null;
    }

    let building = _.find(this.buildings, { buildingName: this.reportModel.buildingName });
    if (building) {
      this.reportModel.locationName = building.locationName;
    } else {
      this.reportModel.locationName = null;
    }

    this.reportModel.fromMonth = moment(this.fromMonth).format('YYYY-MM-DD') + ' ' + '00:00:00';
    this.reportModel.toMonth = moment(this.toMonth).format('YYYY-MM-DD') + ' ' + '00:00:00';

    let requestBody = _.cloneDeep(this.reportModel);
    delete requestBody.customerId;

    this._UtilitiesService.showLoading();
    this._EnergyConsumptionService.searchExecutionReport(requestBody).then(res => {
      if (res) {
        this.reportResult = res;
        this.dataTable = _.cloneDeep(this.reportResult['dataTable'] || []);
        // this.configTable();
        // this.filterTable();


        this.tableData.filteredTotal = this.dataTable.length;
        this.filterDataTable();
      }
      this._UtilitiesService.hideLoading();
    }).catch(err => {
      this._UtilitiesService.showError(LocalMessages.messages['59']);
      this._UtilitiesService.hideLoading();
    });
  }
  showFilter() {
    this.isHide = !this.isHide;
  }

  getListCustomer() {
    return this._EnergyConsumptionService.getCustomers().then(result => {
      if (result && result.content) {

        result.content.forEach(element => {
          let obj = {
            id: 0,
            customerName: '',
            timezoneName: ''
          };
          obj.id = element.id;
          obj.customerName = element.customerName;
          obj.timezoneName = element.timezoneName;
          this.customers.push(obj);
        });
        if (this.customers[0]) {
          this.reportModel.customerId = this.customers[0].id;
          this.getListBuilding();
        }
      } else {
        this.customers = [];
      }
    }).catch(error => {
      this._UtilitiesService.showErrorAPI(error, null);
      this.customers = [];
    });
  }

  getListBuilding() {
    const request = {
      id: this.reportModel.customerId
    };
    this._UtilitiesService.showLoading();
    this._EnergyConsumptionService.getBuildings(request).then(result => {
      if (result) {
        this.buildings = result;

        if (this.buildings[0]) {
          this.reportModel.buildingName = this.buildings[0].buildingName;
          // this.reportModel.buildingName = this.buildings[0].buildingName;
          this.getListChillderPlant();
        }
      }
      this._UtilitiesService.hideLoading();
    }).catch(error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  getListChillderPlant() {
    const request = {
      id: this.reportModel.customerId,
      building: this.reportModel.buildingName
    };
    this._UtilitiesService.showLoading();
    this._EnergyConsumptionService.getChillerPlants(request).then(result => {
      if (result) {
        this.chillerPlants = result;

        if (this.chillerPlants[0]) {
          this.reportModel.chillerPlantId = this.chillerPlants[0].id;
          // this.reportModel.chillerPlantName = this.chillerPlants[0].chillerPlantName;
        }
      }
      this._UtilitiesService.hideLoading();
    }).catch(error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  onCustomerChanged() {
    this.reportModel.buildingName = null;
    this.buildings = [];
    this.reportModel.chillerPlantId = null;
    this.chillerPlants = [];
    this.getListBuilding();
  }

  onBuildingChanged() {
    this.reportModel.chillerPlantId = null;
    this.chillerPlants = [];
    this.getListChillderPlant();
  }

  fromMonthChange(event) {
    console.log(event)
    this.fromMonth = event.format('YYYY-MM');
  }

  toMonthChange(event) {
    console.log(event)
    this.toMonth = event.format('YYYY-MM');
  }

  actionExportPDF() {
    let requestData = this.reportResult;
    if (requestData) {
      this._UtilitiesService.showConfirmDialog('Do you want export pdf file ?',
        (result) => {
          if (result) {
            let toDate = moment(new Date()).format('YYYYMMDD');
            let fileName = toDate.valueOf() + '_' + this.reportModel.customerName + '_'
              + this.reportModel.buildingName + '_' + this.reportModel.chillerPlantName + '_' + "ExecutionReport.pdf";

            let customer = _.find(this.customers, { id: this.reportModel.customerId });
            console.log(this.customers);
            let request = {
              "chillerPlantId": requestData.chillerPlantId,
              "chillerPlantName": requestData.chillerPlantName,
              "buildingName": requestData.buildingName,
              "locationName": requestData.locationName,
              "fromMonth": this.formatTimestamp(requestData.fromMonth),
              "toMonth": this.formatTimestamp(requestData.toMonth),
              "customerName": requestData.customerName,
              "timezoneName": customer.timezoneName,
              "userId": customer.id,
              "exportType": 0
            }
            return this._UserReportService.dowloadOperatorExecutionReport(request).then(result => {
              if (result) {
                let blob = new Blob([result], {
                  type: 'application/pdf'
                });
                // this._UtilitiesService.showSuccess(LocalMessages.messages['63']);
                FileSaver.saveAs(blob, fileName);
              }
            }, error => {
              this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['64']);
            });
          }
        });
    }
  }

  formatTimestamp(timestamp) {
    if (timestamp) {
      let formatStr = 'YYYY-MM-DD HH:mm:ss';
      return moment(timestamp).format(formatStr);
    }
    return;
  }
}