import { ActivatedRoute, Params, Router } from '@angular/router';
import { Input, Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { VARIABLES, PAGES } from '../constant';
import { LocalMessages } from '../message';
import { ExecutionHistoryService } from '../api-service/execution-history.service';
import { CustomerService } from '../api-service/customer.service';
import { ChillerPlantService } from '../api-service/chiller-plant.service';
import * as _ from 'lodash';
import * as moment from "moment";


// component dialog add
@Component({
  selector: 'error-message-monitoring-dialog',
  templateUrl: 'error-message-monitoring-dialog.html',
  styleUrls: ['./monitoring-execution-history.component.scss']
})
export class ErrorMessageMonitoringDialog implements OnInit {
  failureLog;
  ngOnInit(): void {
    this.failureLog = this.data.failureLog;
  }

  constructor(
    private _UtilitiesService: UtilitiesService,
    public dialogRef: MatDialogRef<ErrorMessageMonitoringDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
}


@Component({
  selector: 'monitoring-execution-history',
  templateUrl: './monitoring-execution-history.component.html',
  styleUrls: ['./monitoring-execution-history.component.scss']
})
export class MonitoringExecutionHistoryComponent implements OnInit {
  noResultFound: string = LocalMessages.messages['22'];
  columns: ITdDataTableColumn[] = [
    { name: 'id', label: 'ID', sortable: true, width: 100 },
    { name: 'customerName', label: 'Customer Name', filter: true, sortable: true },
    { name: 'chillerPlantName', label: 'Chiller Plant Name' },
    { name: 'startTime', label: 'Start Time', hidden: false },
    { name: 'endTime', label: 'End Time' },
    { name: 'category', label: 'Category' },
    { name: 'status', label: 'Status' },
  ];

  data: any[] = [
  ];

  selectedCustomerId;
  status = [
    { name: 'All', value: -1 },
    { name: 'Success', value: 0 },
    { name: 'Failure', value: 1 },
  ];
  statusObj = _.keyBy(this.status, 'value');
  categories = [
    { name: 'All', value: -1 },
    { name: 'Data Collection', value: 1 },
    { name: 'Optimization Execution', value: 2 },
    { name: 'Report Generation', value: 3 },
  ];
  categoriesObj = _.keyBy(this.categories, 'value');

  getCustomerList() {
    return this.customerService.getCustomerList().then(result => {
      if (result && result.content) {
        this.customers = result.content;
      } else {
        this.customers = [];
      }
    }, error => {
      this.customers = [];
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize: number = this.pageSizes[0];
  sortBy: string = 'customerName';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  @ViewChild('filter') filterEle: ElementRef;

  selectedCustomerName;
  selectedChillerPlantName;
  selectedCategory;
  selectedStatus;

  customers = [];
  chillerPlants = [];
  searchModel = {
    "userId": -1,
    "customerName": null,
    "chillerPlantId": -1,
    "chillerPlantName": null,
    "fromDate": null,
    "toDate": null,
    "category": -1,
    "status": -1
  };
  fromDate = moment().toISOString();
  toDate = moment().toISOString();

  constructor(
    private customerService: CustomerService,
    private executionHistoryService: ExecutionHistoryService,
    public dialog: MatDialog,
    private _dataTableService: TdDataTableService,
    private _UtilitiesService: UtilitiesService,
    private _ChillerPlantService: ChillerPlantService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.filter();
    this.getCustomerList();
  }

  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }

  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
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
    newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
    this.filteredData = newData;
  }

  showSuccess() {
    this._UtilitiesService.showSuccess('Saved success');
  }

  showDialogErrorMessage(row, value) {
    event.preventDefault();
    event.stopPropagation();
    if (value === 1) {
      let dialogRef = this.dialog.open(ErrorMessageMonitoringDialog, {
        width: '600px',
        disableClose: true,
        data: {
          failureLog: row.failureLog
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }
  }

  onCustomerChanged() {
    this.searchModel.chillerPlantId = -1;
    this.searchModel.chillerPlantName = null;
    this.chillerPlants = [];
    if (this.searchModel.userId !== -1) {
      this.getChillerPlant();
    }
  }

  getChillerPlant() {
    const request = {
      userid: this.searchModel.userId
    };
    this._UtilitiesService.showLoading();
    return this._ChillerPlantService.getChillerPlantList(request).then(result => {
      if (result) {
        this.chillerPlants = result.content;
      }
      this._UtilitiesService.hideLoading();
    }, error => {
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  onSearchClick() {
    let chiller = _.find(this.chillerPlants, { id: this.searchModel.chillerPlantId });
    if (chiller) {
      this.searchModel.chillerPlantName = chiller.chillerPlantName;
    } else {
      this.searchModel.chillerPlantName = null;
    }

    let customer = _.find(this.customers, { id: this.searchModel.userId });
    if (customer) {
      this.searchModel.customerName = customer.customerName;
    } else {
      this.searchModel.customerName = null;
    }

    let requestBody = _.cloneDeep(this.searchModel);
    if (requestBody.userId === -1) {
      requestBody.userId = null;
      requestBody.customerName = null;
    }
    if (requestBody.chillerPlantId === -1) {
      requestBody.chillerPlantId = null;
      requestBody.chillerPlantName = null;
    }
    requestBody.category = requestBody.category === -1 ? null : requestBody.category;
    requestBody.status = requestBody.status === -1 ? null : requestBody.status;
    let formDate = moment(this.fromDate).valueOf();
    let toDate = moment(this.toDate).valueOf();
    requestBody.fromDate = this._UtilitiesService.formatTime(new Date(formDate));
    requestBody.toDate = this._UtilitiesService.formatTime(new Date(toDate));

    this.data = [];
    this._UtilitiesService.showLoading();
    this.executionHistoryService.searchExecutionList(requestBody).then(res => {
      if (res) {
        this.data = res.content;
      }
      this.filter();
      this._UtilitiesService.hideLoading();
    }).catch(error => {
      this.filter();
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  onIdClick(item) {
    this.router.navigate([PAGES.OPERATOR.EXECUTION_SENDING_DETAIL], { relativeTo: this.route, queryParams: { id: item.id } });
  }

  formatTime(time) {
    return moment(time).format("YYYY/MM/DD HH:mm");
  }
}
