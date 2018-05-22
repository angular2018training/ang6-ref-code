import { VARIABLES } from './../constant';
import { TdDataTableSortingOrder, IPageChangeEvent, ITdDataTableColumn, TdDataTableService } from '@covalent/core';
import { Component, OnInit } from '@angular/core';
import { EnergyConsumptionService } from '../api-service/energy-consumption.service';
import { UtilitiesService } from 'app/services/utilities.service';
import * as _ from 'lodash';
import * as moment from "moment";
import { LocalMessages } from 'app/message';
import { UserReportService } from 'app/api-service/user-report.service';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-energy-consumption',
  templateUrl: './energy-consumption.component.html',
  styleUrls: ['./energy-consumption.component.scss'],
})
export class EnergyConsumptionComponent implements OnInit {

  exportsuccessfullyMessage: string = LocalMessages.messages['63'];

  dataChartB: any = [];
  dataChartA: any = [];

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

  reportTypes = [
    { value: 2, name: 'Monthly' },
    { value: 1, name: 'Daily' },
    { value: 0, name: 'Hourly' },
  ];
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
    reportType: 1,
    exportType: 1,
    fromDateTime: null,
    toDateTime: null
  };
  formatDay = 'YYYY-MM-DD';
  fromDate = moment().format(this.formatDay);
  toDate = moment().format(this.formatDay);
  fromTime = '00:00';
  toTime = '23:59';
  reportResult: any = {
    "chillerPlantId": 1,
    "customerName": "",
    "chillerPlantName": "",
    "buildingName": "",
    "locationName": "",
    "reportType": -1,
    "fromDateTime": -1,
    "toDateTime": -1,
    "exportType": 0,
    "dataTable": [
    ],
    "dataChart": [
    ],
    "periodOfReport": "",
    "actualEnergyConsumption": "",
    "esGuideA": "",
    "esGuideB": "",
    "esGuideC": "",
    "adjActualEnergyConsumption": "",
    "energySavings": "",
    "costSavings": ""
  };

  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;

  tableData = {
    columns: [],
    filteredTotal: 0,
    searchTerm: '',
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
  //chart
  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels: any[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;
  public chartColors: Array<any> = [
    {
      backgroundColor: '#3265be',
    },
    {
      backgroundColor: '#AAA',
    }
  ];

  public barChartData: any[] = [];
  modePicker = 'day';
  formatPicker = 'YYYY-MM-DD';

  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }

  showReport() {
    let customer = _.find(this.customers, { id: this.reportModel.customerId });
    if (customer) {
      this.reportModel.customerName = customer.customerName;
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

    this.reportModel.fromDateTime = this.getDateTime(this.fromDate, this.fromTime);
    this.reportModel.toDateTime = this.getDateTime(this.toDate, this.toTime);

    if (this.reportModel.fromDateTime > this.reportModel.toDateTime) {
      this._UtilitiesService.showWarning(LocalMessages.messages["53"]);
      return;
    }
    this.isShow = true;
    this.isHide = true;

    this.reportResult = {};
    this.dataTable = [];
    this.filterData = [];
    this.barChartData = [];

    let requestBody = _.cloneDeep(this.reportModel);
    delete requestBody.customerId;

    this._UtilitiesService.showLoading();
    this._EnergyConsumptionService.searchReport(requestBody).then(res => {
      if (res) {
        this.reportResult = res;
        this.dataTable = _.cloneDeep(this.reportResult['dataTable'] || []);
        // this.configTable();
        // this.filterTable();

        this.tableData.filteredTotal = this.dataTable.length;
        this.filterDataTable();

        this.buildDataChart();
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
            customerName: ''
          };
          obj.id = element.id;
          obj.customerName = element.customerName;
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
      this._UtilitiesService.showErrorAPI(error, null)
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
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
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

  buildDataChart() {
    this.barChartData = [];
    this.barChartLabels = [];
    if (this.reportResult['dataChart']) {
      let dataChart = this.reportResult['dataChart'];
      let series = _.uniq(dataChart.map(item => { return item.serie; }));

      _.forEach(series, serie => {
        let points = _.filter(dataChart, { serie: serie });
        if (points) {
          this.barChartData.push({
            label: serie,
            data: points.map(p => { return p['ycoodinate'] })
          });
          this.barChartLabels = points.map(p => { return p['xcoodinate'] });
        }
      });
    }
  }

  onReportTypeChanged() {
    switch (this.reportModel.reportType) {
      case 0:
        this.modePicker = 'day';
        this.formatPicker = this.formatDay;
        this.fromDate = moment().format(this.formatDay);
        this.toDate = moment().format(this.formatDay);
        break;
      case 1:
        this.modePicker = 'day';
        this.formatPicker = this.formatDay;
        this.fromDate = moment().format(this.formatDay);
        this.toDate = moment().format(this.formatDay);
        break;
      case 2:
        this.modePicker = 'month';
        this.formatPicker = 'YYYY-MM';
        this.fromDate = moment().format('YYYY-MM');
        this.toDate = moment().format('YYYY-MM');
        break;
    }
  }

  actionExportExcel() {
    this._UtilitiesService.showConfirmDialog('Do you want export excel file ?',
      (result) => {
        if (result) {
          let toDate = moment(new Date()).format('YYYYMMDD');
          let fileName = toDate.valueOf() + '_' + this.reportModel.reportType + '_' + "EnergyConsumptionReport.xlsx";

          let request = {
            "chillerPlantId": this.reportResult.chillerPlantId,
            "chillerPlantName": this.reportResult.chillerPlantName,
            "buildingName": this.reportResult.buildingName,
            "locationName": this.reportResult.locationName,
            "reportType": this.reportResult.reportType,
            "fromDateTime": this.formatTimestamp(this.reportResult.fromDateTime),
            "toDateTime": this.formatTimestamp(this.reportResult.toDateTime),
            "customerName": this.reportResult.customerName,
            "exportType": 1
          }
          return this._UserReportService.downloadExcutionConsumptionReportHistory(request).then(result => {
            if (result) {
              let blob = new Blob([result], {
                type: 'application/vnd.ms-excel; charset=charset=utf-8'
              });
              // this._UtilitiesService.showSuccess(this.exportsuccessfullyMessage);
              FileSaver.saveAs(blob, fileName);
            }
          }, error => {
            this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['64']);
          });
        }
      });
  }

  actionExportPDF() {
    this._UtilitiesService.showConfirmDialog('Do you want export pdf file ?',
      (result) => {
        if (result) {
          let toDate = moment(new Date()).format('YYYYMMDD');
          let fileName = toDate.valueOf() + '_' + this.reportModel.reportType + '_' + "EnergyConsumptionReport.pdf";

          let request = {
            "chillerPlantId": this.reportResult.chillerPlantId,
            "chillerPlantName": this.reportResult.chillerPlantName,
            "buildingName": this.reportResult.buildingName,
            "locationName": this.reportResult.locationName,
            "reportType": this.reportResult.reportType,
            "fromDateTime": this.formatTimestamp(this.reportResult.fromDateTime),
            "toDateTime": this.formatTimestamp(this.reportResult.toDateTime),
            "customerName": this.reportResult.customerName,
            "exportType": 0
          }
          return this._UserReportService.downloadExcutionConsumptionReportHistory(request).then(result => {
            if (result) {
              let blob = new Blob([result], {
                type: 'application/pdf'
              });
              // this._UtilitiesService.showSuccess(this.exportsuccessfullyMessage);
              FileSaver.saveAs(blob, fileName);
            }
          }, error => {
            this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['64']);
          });
        }
      });
  }

  formatTimestamp(timestamp) {
    if (timestamp) {
      let formatStr = 'YYYY-MM-DD HH:mm:ss';
      return moment(timestamp).format(formatStr);
    }
    return;
  }
}