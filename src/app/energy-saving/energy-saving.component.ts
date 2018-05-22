import { LocalMessages } from 'app/message';
import { VARIABLES } from './../constant';
import { ITdDataTableColumn, IPageChangeEvent, TdDataTableService, TdDataTableSortingOrder } from '@covalent/core';
import { EnergySavingService } from './../api-service/energy-saving.service';
import * as jsPDF from 'jspdf'
import * as html2canvas from "html2canvas";
import * as $ from 'jquery';
import * as moment from 'moment';

import Chart from 'chart.js';

import { Component, OnInit, ViewChild } from '@angular/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { CustomerService } from 'app/api-service/customer.service';
import { ChillerPlantService } from 'app/api-service/chiller-plant.service';

import * as FileSaver from 'file-saver';

@Component({
  selector: 'energy-saving',
  templateUrl: './energy-saving.component.html',
  styleUrls: ['./energy-saving.component.scss']
})
export class EnergySavingComponent implements OnInit {

  noResultMessage = LocalMessages.messages["22"];

  // 0: Hourly, 1: Daily, 2: Monthly
  reportTypesId = [0, 1, 2];

  reportTypes = [
    { value: this.reportTypesId[2], name: 'Monthly' },
    { value: this.reportTypesId[1], name: 'Daily' },
    { value: this.reportTypesId[0], name: 'Hourly' },
  ];

  each_row = {
    date: '10/1/2017',
    weekday: 'Sun',
    load: 800,
    baseline: 880,
    actual: 836,
    esNaviA: 3,
    esNaviB: 3,
    esNaviC: 0,
    duration: 0,
    adjusted: 836,
    energy: 44,
    cost: 6.6,
  };

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

  // isReport: boolean = false;
  isReport: boolean = false;
  isFilter: boolean = true;
  isShow = false;
  isHide = false;
  strFilter: string = 'Show Filter';
  srcImg: string = null;

  customers = [];
  chillerPlants = [];
  buildings = [];

  formatDay = 'YYYY-MM-DD';

  reportModel = {
    customerId: null,
    chillerPlantId: null,
    buildingName: null,
    reportType: 1,
    fromDate: moment().format(this.formatDay),
    toDate: moment().format(this.formatDay),
    fromTime: '00:00',
    toTime: '23:59',
    customerName: null,
    chillerPlantName: null,
    locationName: null,
    exportType: 0,
    fromMonth: moment().format('YYYY-MM'),
    toMonth: moment().format('YYYY-MM')
  }

  reportInfo;
  energySavingTable = [];

  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;

  dataTable = {
    columns: [],
    filteredData: [],
    filteredTotal: 0,
    searchTerm: '',
    fromRow: 1,
    currentPage: 1,
    pageSize: this.pageSizes[0],
    sortBy: '',
    selectedRows: [],
    sortOrder: TdDataTableSortingOrder.Descending
  };

  chartLabel = 1;

  page(pagingEvent: IPageChangeEvent): void {
    this.dataTable.fromRow = pagingEvent.fromRow;
    this.dataTable.currentPage = pagingEvent.page;
    this.dataTable.pageSize = pagingEvent.pageSize;
    this.filterDataTable();
  }

  filterDataTable(): void {
    let newData: any[] = this.energySavingTable;

    const excludedColumns: string[] = this.dataTable.columns
      .filter((column: ITdDataTableColumn) => {
        return ((column.filter === undefined && column.hidden === true) ||
          (column.filter !== undefined && column.filter === false));
      }).map((column: ITdDataTableColumn) => {
        return column.name;
      });
    newData = this._dataTableService.filterData(newData, this.dataTable.searchTerm, true, excludedColumns);

    newData = this._dataTableService.sortData(newData, this.dataTable.sortBy, this.dataTable.sortOrder);
    newData = this._dataTableService.pageData(newData, this.dataTable.fromRow, this.dataTable.currentPage * this.dataTable.pageSize);
    this.dataTable.filteredData = newData;
  }

  //chart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;
  public chartColors: Array<any> = [
    {
      backgroundColor: '#3265be',
    },
  ];

  public barChartLabels: string[] = [];
  public barChartData: any[] = [
    { data: [], label: '' },
  ];

  onReportTypeChanged() {
    
  }

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  constructor(
    private _UtilitiesService: UtilitiesService,
    private _CustomerService: CustomerService,
    private _ChillerPlantService: ChillerPlantService,
    private _EnergySavingService: EnergySavingService,
    private _dataTableService: TdDataTableService
  ) { }
  ngOnInit() {
    this.getCustomerList();
  }

  filter() {
    this.isFilter = !this.isFilter;
    this.strFilter = this.isFilter ? 'Hide Filter' : 'Show Filter';
  }

  getDateTime(date, time) {
    let dt = moment(date);
    let dtStr = dt.format('YYYY-MM-DD');
    if (this.reportModel.reportType === 0) {
      dtStr += ' ' + time + ':00';
    } else {
      dtStr += ' ' + '00:00:00';
    }

    return dtStr;
  }

  showReport() {
    this.isReport = true;
    this.isFilter = false;
    this.strFilter = "Show Filter";

    this.chartLabel = this.reportModel.reportType;

    if (this.barChartData.length > 0) {
      let i, n = this.barChartData.length;

      for (i = 0; i < n; i++) {
        this.barChartData[i].label = this.reportModel.reportType === this.reportTypesId[1] ? 'Daily Energy Savings' : this.reportModel.reportType === this.reportTypesId[2] ? 'Monthly Energy Savings' : 'Hourly Energy Savings';
      }
    }

    this.reportInfo = {
      "chillerPlantId": this.reportModel.chillerPlantId,
      "reportType": this.reportModel.reportType,
      "fromDateTime": this.reportModel.fromDate,
      "toDateTime": this.reportModel.toDate,
      "exportType": this.reportModel.exportType,
      "customerName": this.reportModel.customerName,
      "chillerPlantName": this.reportModel.chillerPlantName,
      "buildingName": this.reportModel.buildingName,
      "location": this.reportModel.locationName,
      "periodOfReport": "01/01/2018 (00:00 AM - 00:00 AM)",
      "baselineUnit": "",
      "actualEnergyConsumption": "",
      "energySavings": "",
      "costSavings": "",
      "numberOfESInstruction": "",
      "numberOfEESInstruction": "",
      "numberOfNEESInstruction": "",
      "energySavingChart": [],
      "energySavingTable": []
    };

    if (this.reportModel.fromTime === null) {
      this.reportModel.fromTime = "00:00";
    }

    if (this.reportModel.toTime === null) {
      this.reportModel.toTime = "23:59";
    }

    let fromDateTime: String;
    let toDateTime: String;

    if (this.reportModel.reportType !== this.reportTypesId[2]) {
      fromDateTime = this.getDateTime(this.reportModel.fromDate, this.reportModel.fromTime);

      toDateTime = this.getDateTime(this.reportModel.toDate, this.reportModel.toTime);
    } else {
      fromDateTime = this.getDateTime(this.reportModel.fromMonth, null);

      toDateTime = this.getDateTime(this.reportModel.toMonth, null);
    }

    let data = {
      chillerPlantId: this.reportModel.chillerPlantId,
      reportType: this.reportModel.reportType,
      // fromDateTime:  Date.parse(this._UtilitiesService.formatDateTime(fromDateTime, 'dd/MM/yyyy hh:mm')),
      fromDateTime: fromDateTime,
      toDateTime: toDateTime,
      exportType: 0,
      customerName: this.reportModel.customerName,
      chillerPlantName: this.reportModel.chillerPlantName,
      buildingName: this.reportModel.buildingName,
      location: this.reportModel.locationName
    }

    this._UtilitiesService.showLoading();
    this._EnergySavingService.showReport(data).then(response => {
      if (response) {
        this.reportInfo = response;
        this.energySavingTable = response.energySavingTable;

        this.dataTable.filteredTotal = this.energySavingTable.length;
        this.paging.maxPage = this.paging.totalPage > 10 ? 10 : this.paging.totalPage;

        this.filterDataTable()

        this.barChartLabels = [];
        this.barChartData[0].data = [];

        let energySavingChart = response.energySavingChart;
        if (energySavingChart.length > 0) {
          let i, n = response.energySavingChart.length;
          for (i = 0; i < n; i++) {
            this.barChartLabels.push(energySavingChart[i].horizon);
            this.barChartData[0].data.push(energySavingChart[i].vertical);
          }
        }
      }
      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['59']);
    }).catch(error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['59']);
    })
  }

  exportPDF() {
    this._UtilitiesService.showConfirmDialog('Do you want export pdf file ?',
      (result) => {
        if (result) {
          let toDate = moment(new Date()).format('YYYYMMDD');
          let fileName = toDate.valueOf() + '_' + this.reportModel.reportType + '_' + "EnergySavingsReport.pdf";

          let fromDateTime: String;
          let toDateTime: String;

          if (this.reportModel.reportType !== this.reportTypesId[2]) {
            fromDateTime = this.getDateTime(this.reportModel.fromDate, this.reportModel.fromTime);

            toDateTime = this.getDateTime(this.reportModel.toDate, this.reportModel.toTime);
          } else {
            fromDateTime = this.getDateTime(this.reportModel.fromMonth, null);

            toDateTime = this.getDateTime(this.reportModel.toMonth, null);
          }

          let data = {
            chillerPlantId: this.reportModel.chillerPlantId,
            reportType: this.reportModel.reportType,
            // fromDateTime:  Date.parse(this._UtilitiesService.formatDateTime(fromDateTime, 'dd/MM/yyyy hh:mm')),
            fromDateTime: fromDateTime,
            toDateTime: toDateTime,
            exportType: 0,
            customerName: this.reportModel.customerName,
            chillerPlantName: this.reportModel.chillerPlantName,
            buildingName: this.reportModel.buildingName,
            location: this.reportModel.locationName
          }

          this._UtilitiesService.showLoading();
          return this._EnergySavingService.exportReport(data).then(result => {
            if (result) {
              let blob = new Blob([result], {
                type: 'application/pdf'
              });
              FileSaver.saveAs(blob, fileName);
            }

            this._UtilitiesService.hideLoading();
          }, error => {
            this._UtilitiesService.hideLoading();
            this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['64']);
          });
        }
      });
  }

  getCustomerList() {
    this._UtilitiesService.showLoading();
    return this._EnergySavingService.getCustomerList().then(result => {
      if (result && result.content) {

        result.content.forEach(element => {
          let obj = {
            id: 0,
            customerName: ''
          };
          obj.id = element.id;
          obj.customerName = element.customerName;
          this.customers.push(obj);
        });
        if (this.customers[0]) {
          this.reportModel.customerId = this.customers[0].id;

          this._UtilitiesService.hideLoading();
          this.onCustomerChanged();
        }
      } else {
        this.customers = [];
      }

      this._UtilitiesService.hideLoading();
    }, error => {
      this.customers = [];
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  getChillerPlant() {
    const request = {
      id: this.reportModel.customerId,
      building: this.reportModel.buildingName
    };
    this._UtilitiesService.showLoading();
    return this._EnergySavingService.getChillerPlant(request).then(result => {
      if (result) {
        this.chillerPlants = result;

        if (this.chillerPlants[0]) {
          this.reportModel.chillerPlantId = this.chillerPlants[0].id;

          this.onChillerPlantChanged();
        }
      }
      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  getBuilding() {
    const requestParam = {
      id: this.reportModel.customerId
    }
    this._UtilitiesService.showLoading();
    return this._EnergySavingService.getBuilding(requestParam).then(result => {
      if (result) {
        this.buildings = result;

        if (this.buildings.length > 0) {
          this.reportModel.buildingName = this.buildings[0].buildingName;

          this._UtilitiesService.hideLoading();
          this.onBuildingChanged();
        }

      }
      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    })
  }

  onCustomerChanged() {
    this.reportModel.chillerPlantId = null;
    this.reportModel.buildingName = null;
    // this.reportModel.chillerPlantName = null;
    this.chillerPlants = [];
    this.buildings = [];

    this.reportModel.customerName = null;

    let index = this.customers.map(customer => {
      return customer.id
    }).indexOf(this.reportModel.customerId);

    if (index > -1) {
      this.reportModel.customerName = this.customers[index].customerName;
    }

    this.getBuilding();
  }

  onBuildingChanged() {
    this.reportModel.chillerPlantId = null;
    this.chillerPlants = [];

    let index = this.buildings.map(building => {
      return building.buildingName;
    }).indexOf(this.reportModel.buildingName);

    if (index > -1) {
      this.reportModel.locationName = this.buildings[index].locationName;
    }

    this.getChillerPlant();
  }

  onChillerPlantChanged() {
    let index = this.chillerPlants.map(plant => {
      return plant.id;
    }).indexOf(this.reportModel.chillerPlantId);

    if (index > -1) {
      this.reportModel.chillerPlantName = this.chillerPlants[index].chillerPlantName;
    }
  }
}