import { ActivatedRoute, Params } from '@angular/router';
import { Input, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from '../services/utilities.service';
import { Observable } from 'rxjs/Observable';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import * as _ from 'lodash';
const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);
import { Router } from '@angular/router';
import * as moment from "moment";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ErrorMessageMonitoringDialog } from '../monitoring-execution-history/monitoring-execution-history.component';
import { ExecutionHistoryService } from 'app/api-service/execution-history.service';
import { VARIABLES } from '../constant';

@Component({
  selector: 'monitoring-execution-detail',
  templateUrl: './monitoring-execution-detail.component.html',
  styleUrls: ['./monitoring-execution-detail.component.scss']
})
export class MonitoringExecutionDetailComponent implements OnInit {

  exeHistoryId;
  exeHistoryModel = {
    id: null,
    customerName: null,
    chillerPlantName: null,
    category: null,
    categoryName: null,
    startTime: null,
    endTime: null,
    status: null,
    failureLog: null
  };

  status = [
    { name: 'All', value: -1 },
    { name: 'Success', value: 0 },
    { name: 'Failure', value: 1 },
  ];
  statusObj = _.keyBy(this.status, 'value');
  categories = [
    { name: 'All', value: -1 },
    { name: 'Data Retention', value: 0 },
    { name: 'Data Collection', value: 1 },
    { name: 'Optimization Execution', value: 2 },
    { name: 'Report Generation', value: 3 },
  ];
  categoriesObj = _.keyBy(this.categories, 'value');
  typeMapping = {
    0: { name: 'Chiller', equipmentName: 'Chiller ' },
    1: { name: 'CHWP', equipmentName: 'Pump CHWP ' },
    2: { name: 'CDWP', equipmentName: 'Pump CDWP ' },
    3: { name: 'CCT', equipmentName: 'CCT ' },
    4: { name: 'CT', equipmentName: 'Cooling Tower ' },
    5: { name: 'Chiller plant', equipmentName: 'Chiller plant ' },
  };

  columns: ITdDataTableColumn[] = [
    { name: 'id', label: 'Equipment ID', filter: true, sortable: true, width: 150 },
    { name: 'equipmentName', label: 'Equipment Name', filter: true, sortable: true },
    { name: 'type', label: 'Type' },
    { name: 'description', label: 'Set-Point', hidden: false },
    { name: 'measureValue', label: 'Measured Value' },
    { name: 'unit', label: 'Measured Unit' },
  ];

  data: any[] = [
    {
      "id": 3,
      "measureValue": 1.5,
      "timestamp": "2017-12-18T17:00:00.000+0000",
      "chillerPlantId": 288,
      "type": 1,
      "index": 5,
      "description": "Condenser water pump variable speed drive (set point)",
      "unit": "Hz"
    }

  ];

  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize: number = this.pageSizes[0];
  sortBy: string = 'id';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  constructor(public dialog: MatDialog, private _UtilitiesService: UtilitiesService,
    private router: Router, private _dataTableService: TdDataTableService, private route: ActivatedRoute, private _ExecutionHistoryService: ExecutionHistoryService) {
    this.route.queryParams.subscribe(params => {
      this.exeHistoryId = params.id;
      this.getExeHistoryDetail();
    });
  }

  ngOnInit() {
    this.toggleDefaultFullscreenDemo();
  }

  showConfirmDialog() {
    this._UtilitiesService.showConfirmDialog('Do you want to delete this customer?', (result) => {
      if (result) {
        // handle here
      }
    });
  }

  toggleDefaultFullscreenDemo(): void {
    this._UtilitiesService.showLoading();
    setTimeout(() => {
      this._UtilitiesService.hideLoading();
    }, 500);
  }

  showError() {
    this._UtilitiesService.showError('Error message');
  }

  showSuccess() {
    this._UtilitiesService.showSuccess('Saved success');
  }
  /**
   * format datetime
   * @param dt : number = datetime in millisecond
   * @param withMillisecond : boolean =  format with millisecond
   */
  formatDatetime(dt) {
    let formatStr = 'YYYY-MM-DD';
    return moment(dt).format(formatStr);
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

  showDialogErrorMessage() {
    if (this.exeHistoryModel['status'] === 'Failure') {
      let dialogRef = this.dialog.open(ErrorMessageMonitoringDialog, {
        width: '600px',
        disableClose: true,
        data: {
          failureLog: this.exeHistoryModel.failureLog
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
      });
    }
  }

  getExeHistoryDetail() {
    this.data = [];
    this._ExecutionHistoryService.getExecutionDetail({ id: this.exeHistoryId }).then(res => {
      if (res) {
        this.exeHistoryModel = res;
        this.data = res.navigationList;
        this.exeHistoryModel['status'] = this.statusObj[res.status].name;
        this.exeHistoryModel['categoryName'] = this.categoriesObj[res.category].name;
        this.exeHistoryModel.startTime = this.formatTime(this.exeHistoryModel.startTime);
        this.exeHistoryModel.endTime = this.formatTime(this.exeHistoryModel.endTime);
      }
      this.filter();
    }).catch(error => {
      this.filter();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  formatTime(time) {
    return moment(time).format("YYYY/MM/DD HH:mm");
  }
}
