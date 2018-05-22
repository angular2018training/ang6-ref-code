import { MatDialog } from '@angular/material';
import { RevisedVersionUploadDialog } from './upload-revised-version.component';
import { ValidateService } from 'app/services/validate.service';
import { LocalMessages } from 'app/message';
import { CustomerReportService } from './../api-service/customer-report.service';
import { UtilitiesService } from 'app/services/utilities.service';
import { TdDataTableSortingOrder, TdDataTableService, IPageChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { VARIABLES } from './../constant';
import { Component, OnInit } from '@angular/core';
import * as moment from "moment";
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-customer-report',
  templateUrl: './customer-report.component.html',
  styleUrls: ['./customer-report.component.scss']
})
export class CustomerReportComponent implements OnInit {

  noResultMessage = LocalMessages.messages["22"];

  reportTypes = [{
    value: 0, name: 'Energy Report'
  }, {
    value: 1, name: 'Execution Report'
  }]

  reports = [];

  formatDay = 'YYYY-MM-DD';

  fileUpload = '';

  reportModel = {
    reportType: 0,
    customerName: null,
    customerId: null,
    chillerPlantId: -1,
    chillerPlantName: 'All',
    fromDate: moment().format(this.formatDay),
    toDate: moment().format(this.formatDay)
  }

  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;

  dataTable = {
    columns: [
      { name: 'createdDate', label: 'Report Creation Date'},
      { name: 'chillerPlantName', label: 'Chiller Plant Name'},
      { name: 'buildingName', label: 'Building Name'},
      { name: 'reportName', label: 'Report Name'},
      { name: 'revisedVersion', label: 'Revised Version'}
    ],
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

  customers = [];
  chillerPlants = [];
  showFilter = false;

  constructor(
    private _UtilitiesService: UtilitiesService,
    private _CustomerReportService: CustomerReportService,
    private _dataTableService: TdDataTableService,
    private _ValidateService : ValidateService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {

    this._UtilitiesService.showLoading();

    this._CustomerReportService.getCustomerList().then(response => {
      if (response) {
        this.customers = response.content;

        if (this.customers.length > 0) {
          this.reportModel.customerId = this.customers[0].id;
          this.reportModel.customerName = this.customers[0].customerName;

          this.chillerPlants = this.customers[0].chillerPlantsDto;
        }
      }

      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null)
    }).catch(error => {
      this._UtilitiesService.hideLoading();
    })
  }

  onCustomerChanged() {
    this.reportModel.chillerPlantId = null;
    this.reportModel.chillerPlantName = null;
    // this.reportModel.chillerPlantName = null;
    this.chillerPlants = [];

    this.reportModel.customerName = null;

    let index = this.customers.map(customer => {
      return customer.id
    }).indexOf(this.reportModel.customerId);

    if (index > -1) {
      this.reportModel.customerName = this.customers[index].customerName;

      this.chillerPlants = this.customers[index].chillerPlantsDto;
      this.reportModel.chillerPlantId = -1;
    }
  }

  getDateTime(date, time?) {
    let dt = moment(date);
    let dtStr = dt.format('YYYY-MM-DD');
    
    dtStr += ' ' + '00:00:00';

    return dtStr;
  }

  onChillerPlantChanged() {
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.dataTable.fromRow = pagingEvent.fromRow;
    this.dataTable.currentPage = pagingEvent.page;
    this.dataTable.pageSize = pagingEvent.pageSize;
    this.filterDataTable();
  }

  filterDataTable(): void {
    let newData: any[] = this.reports;

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

  search() {
    this.showFilter = true;
    this.reports = [];
    this.dataTable.filteredData = [];

    let data = {
      reportType: this.reportModel.reportType,
      customerId: this.reportModel.customerId,
      chillerPlantId: this.reportModel.chillerPlantId,
      fromDate: this.getDateTime(this.reportModel.fromDate),
      toDate: this.getDateTime(this.reportModel.toDate)
    }

    if (data.chillerPlantId < 1) {
      delete data.chillerPlantId;
    }

    this._UtilitiesService.showLoading();
    this._CustomerReportService.search(data).then(response => {

      // handle data
      if (response) {
        this.reports = response.content;

        if (this.reports.length > 0) {
          this.reports.forEach(report => {
            report.createdDate = report.createdDate.substring(0, 10);
          })
        }

        this.dataTable.filteredTotal = this.reports.length;
        this.filterDataTable();
      }

      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['59'])
    }).catch(error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showError(LocalMessages.messages['59']);
    })
  }

  downloadReport(report) {
    if (report) {
      // this._UtilitiesService.showConfirmDialog('Do you want export pdf file ?',
      // (result) => {
        // if (result) {
          let fileName = report.reportName;

          let data = {
            reportType: this.reportModel.reportType,
            customerId: this.reportModel.customerId,
            revised: false,
            id: report.id
          }

          this._UtilitiesService.showLoading();
          return this._CustomerReportService.downloadReport(data).then(result => {
            if (result) {
              let blob = new Blob([result], {
                type: 'application/pdf'
              });
              FileSaver.saveAs(blob, fileName);
            }

            this._UtilitiesService.hideLoading();
            // this._UtilitiesService.showError(LocalMessages.messages['63']);
          }, error => {
            this._UtilitiesService.hideLoading();
            this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['60']);
          });
      //   }
      // });
    }
    
  }

  deleteRevisedVersion(report) {
    this._UtilitiesService.showConfirmDialog(report.revisedVersion + ' will be deleted, are you sure?',
    (result) => {
      if (result) {
        let data = {
          reportType: this.reportModel.reportType,
          customerId: this.reportModel.customerId,
          revised: true,
          id: report.id
        }

        this._UtilitiesService.showLoading();
        this._CustomerReportService.deleteRevisedVersion(data).then(result => {
          this._UtilitiesService.hideLoading();
          this._UtilitiesService.showSuccess(LocalMessages.messages['9']);

          // Reload data
          this.search();
          this._UtilitiesService.hideLoading();
        }, error => {
          this._UtilitiesService.showError(LocalMessages.messages['10']);
          this._UtilitiesService.hideLoading();
        });
      }
    });
  }

  downloadRevisedVersion(report) {
    if (report) {
      // this._UtilitiesService.showConfirmDialog('Do you want export pdf file ?',
      // (result) => {
      //   if (result) {
          let fileName = report.revisedVersion;

          let data = {
            reportType: this.reportModel.reportType,
            customerId: this.reportModel.customerId,
            revised: true,
            id: report.id
          }

          this._UtilitiesService.showLoading();
          return this._CustomerReportService.downloadRevisedVersion(data).then(result => {
            if (result) {
              let blob = new Blob([result], {
                type: 'application/vnd.ms-excel; charset=charset=utf-8'
              });
              // this._UtilitiesService.showSuccess(LocalMessages.messages['64']);
              FileSaver.saveAs(blob, fileName);
            }

            this._UtilitiesService.hideLoading();
          }, error => {
            this._UtilitiesService.hideLoading();
            this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['60']);
          });
      //   }
      // });
    }
  }

  uploadRevisedVersion(report) {
    let dialogRef = this.dialog.open(RevisedVersionUploadDialog, {
      width: '30%',
      disableClose: true,
      data: {
        report: report,
        customerId: this.reportModel.customerId,
        reportType: this.reportModel.reportType
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._UtilitiesService.showSuccess(LocalMessages.messages['133']);
        this.search();
      }
    });
  }
}
