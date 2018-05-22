import { ActivatedRoute, Params } from '@angular/router';
import { Input, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Router } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import * as _ from 'lodash';
import * as moment from "moment";
import * as jsPDF from 'jspdf'
import { UserReportService } from 'app/api-service/user-report.service';
import { UtilitiesService } from 'app/services/utilities.service';
import { ChillerPlantService } from 'app/api-service/chiller-plant.service';
import { LoginService } from 'app/services/login.service';
import * as FileSaver from 'file-saver';
import { VARIABLES } from "../../constant";
import { LocalMessages } from 'app/message';

@Component({
  selector: 'execution-report',
  templateUrl: './execution-report.component.html',
  styleUrls: ['./execution-report.component.scss']
})

export class ExecutionReportComponent implements OnInit {

  newData: any[] = [];
  columns: ITdDataTableColumn[] = [
    { name: 'timestamp', label: 'Report Creation Date', filter: true, sortable: true },
    { name: 'chillerPlantName', label: 'Chiller Plant Name' },
    { name: 'buildingName', label: 'Building Name' },
    { name: 'reportName', label: 'Report Name', hidden: false },
    { name: 'revisedVersion', label: 'Revised Version', hidden: false },
  ];

  data: any[] = [
  ];

  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  noResultFound: string = LocalMessages.messages['22'];

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize: number = this.pageSizes[0];
  sortBy: string = 'timestamp';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  currentUser;
  chillerPlants = [];
  searchModel = {
    userId: null,
    chillerPlantId: -1,
    chillerPlantName: null,
    fromDate: null,
    toDate: null
  };
  fromDate = new Date();
  toDate = new Date();

  constructor(
    private router: Router,
    private _dataTableService: TdDataTableService,
    private _UtilitiesService: UtilitiesService,
    private _LoginService: LoginService,
    private _ChillerPlantService: ChillerPlantService,
    private _EnergyReportService: UserReportService
  ) {

  }



  ngOnInit() {
    this.currentUser = this._LoginService.getUserInfo();
    this.loadData();
  }
  loadData() {
    this._UtilitiesService.showLoading();
    this.getChillerPlant().then(() => {
      this._UtilitiesService.stopLoading();
    }).catch(() => {
      this._UtilitiesService.stopLoading();
    });
    this.filter();
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

  getChillerPlant() {
    const request = {
      userid: this.currentUser.userID
    };
    return this._ChillerPlantService.getChillerPlantList(request).then(result => {
      if (result) {
        this.chillerPlants = result.content;
      }
    }, error => {
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

    this.searchModel.userId = this.currentUser.userID;

    let requestBody = _.cloneDeep(this.searchModel);
    if (requestBody.chillerPlantId === -1) {
      requestBody.chillerPlantId = null;
      requestBody.chillerPlantName = null;
    }
    requestBody.fromDate = this._UtilitiesService.formatTime(this.fromDate);
    requestBody.toDate = this._UtilitiesService.formatTime(this.toDate);

    this.data = [];
    this._UtilitiesService.showLoading();
    this._EnergyReportService.searchExecutionReport(requestBody).then(res => {
      if (res) {
        this.data = res.content;
        this.data.forEach((element) => {
          element.timestamp = new Date(element.timestamp);
        });
      }
      this.filter();
      this._UtilitiesService.hideLoading();
    }).catch(error => {
      this.filter();
      this._UtilitiesService.hideLoading();
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  downloadFile(filename) {
    let request = {
      "userId": this.currentUser.userID,
      "reportName": filename
    }

    return this._EnergyReportService.downloadExecutionReportHistory(request).then(result => {
      if (result) {
        let blob = new Blob([result], {
          type: 'application/pdf'
        });
        FileSaver.saveAs(blob, filename);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['64']);
    }).catch(()=>{
      this._UtilitiesService.showError(LocalMessages.messages['64']);      
    });
  }
}