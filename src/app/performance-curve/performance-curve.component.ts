import { Component, OnInit, ViewChild, ElementRef, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { StringService } from '../services/string.service';

import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import { Observable } from 'rxjs/Observable';
import * as _ from 'lodash';
import * as moment from "moment";
import { ValidateService } from '../services/validate.service';
import { PerformanceCurveService } from '../api-service/performance-curve.service';
import { LocalMessages } from 'app/message';
import { MESSAGE, VARIABLES } from 'app/constant';
import * as FileSaver from 'file-saver';

const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);

@Component({
  selector: 'performance-curve',
  templateUrl: './performance-curve.component.html',
  styleUrls: ['./performance-curve.component.scss']
})
export class PerformanceCurveComponent implements OnInit {

  columns: ITdDataTableColumn[] = [
    { name: 'id', label: 'Performance Curve Name', sortable: true, hidden: true },
    { name: 'name', label: 'Performance Curve Name', sortable: true },
    { name: 'fileName', label: 'File Name', sortable: true },
    { name: 'note', label: 'Note', sortable: true },
    { name: 'createdDate', label: 'Created Date', sortable: true },
    { name: 'action', label: 'Delete' }
  ];
  noResultMessage = LocalMessages.messages["22"];

  data: any = [];
  filteredData = this.data;
  filteredTotal = this.data.length;

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
  pageSize: number = this.pageSizes[0];
  sortBy: string = 'id';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Ascending;

  @ViewChild('filter') filterEle: ElementRef;
  @ViewChild('filter') set content(content: ElementRef) {
    if (content !== undefined) {
      this.filterEle = content;
      Observable.fromEvent(this.filterEle.nativeElement, 'keyup')
        .debounceTime(150)
        .distinctUntilChanged()
        .subscribe(() => {
          this.search(this.filterEle.nativeElement.value);
        });
    }
  }

  constructor(
    private _StringService: StringService,
    private _dataTableService: TdDataTableService,
    private _UtilitiesService: UtilitiesService,
    private _PerformanceCurveService: PerformanceCurveService,
    public dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.reload();
  }
  reload() {
    this._UtilitiesService.showLoading();
    this.reloadData().then(() => {
      this.filter();
      this._UtilitiesService.stopLoading();
    }).catch((err) => {
      this._UtilitiesService.stopLoading();
    });;
  }
  // reload data
  reloadData() {
    const request = {};
    return this._PerformanceCurveService.getPerformanceCurveList(request).then(result => {
      if (result) {
        this.data = result.content;
        this.handleDate();
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }
  // handle createDate
  handleDate() {
    _.forEach(this.data, (item) => {
      // item['createdDate'] = this.formatDatetime(item['createdDate']);
      item['createdDate'] = this._UtilitiesService.formatTime(new Date(item['createdDate']));
    })
  }

  // format date time
  // formatDatetime(dt) {
  //   let formatStr = 'YYYY-MM-DD hh:mm:ss';
  //   return moment(dt).format(formatStr);
  // }
  // sort table
  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }
  // seach
  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }
  // paging
  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }
  // load table
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

  //excute delete
  deleteAction(item) {
    const request = {
      id: item.id
    };
    return this._PerformanceCurveService.deletePerformanceCurve(request).then(result => {
      if (result) {
        this.reload();
        this._UtilitiesService.showSuccess(LocalMessages.messages["9"]);
      }
    }, error => {
      let err = JSON.parse(error._body);
      err.errors.forEach((element) => {
        if (element.code == 131) {
          this._UtilitiesService.showError(_.replace(element.message, '%s', 'Performance Curve'))
        } else {
          this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['10']);
        }
      });
    });
  }
  //view
  showDeleteConfirm(item) {
    this._UtilitiesService.showConfirmDialog(this._StringService.getConfirmDelete(item.name), (result) => {
      if (result) {
        this.deleteAction(item);
      }
    });
  }

  showAddPerformanceCurve() {
    let dialogRef = this.dialog.open(PerformanceCurveAddDialog, {
      width: '30%',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reload();
      }
    });
  }

  showDetailPerformanceCurve(row) {
    let dialogRef = this.dialog.open(PerformanceCurveDetailDialog, {
      width: '30%',
      disableClose: true,
      data: {
        id: row.id,
        name: row.name,
        note: row.note,
        fileName: row.fileName
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.reload();
      }
    });
  }
  // down load csv file
  downloadFile(event, filename, idPerformanceCurve) {
    event.preventDefault();
    event.stopPropagation();
    let request = {
      id: idPerformanceCurve
    }
    return this._PerformanceCurveService.downPerformanceCurve(request).then(result => {
      if (result) {
        let blob = new Blob([result], {
          type: 'application/pdf'
        });
        FileSaver.saveAs(blob, filename);
      }
    }, error => {
      if (error) {
        this._UtilitiesService.showErrorAPI(error, null);
      }
    });
  }

}

@Component({
  selector: 'performance-curve-add-dialog',
  templateUrl: 'dialog/performance-curve-add-dialog.html',
  styleUrls: ['./performance-curve.component.scss']
})
export class PerformanceCurveAddDialog implements OnInit {
  createData = {
    name: null,
    selectedFile: null,
    fileName: null,
    note: ''
  };
  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;


  constructor(
    public dialogRef: MatDialogRef<PerformanceCurveAddDialog>,
    public _ValidateService: ValidateService,
    public _UtilitiesService: UtilitiesService,
    private _PerformanceCurveService: PerformanceCurveService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  ngOnInit() {
  }

  createPerformanceCurve() {
    let errorInput = [];
    errorInput = this.inputValidation(this.createData);
    const request = this.prepareCreateData();
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this._UtilitiesService.showLoading();
      this.createAction(request).then(() => {
        this._UtilitiesService.stopLoading();
      });
    }
  }
  createAction(request) {
    return this._PerformanceCurveService.postPerformanceCurve(request).then(result => {
      if (result) {
        this.dialogRef.close('true');
        // this._UtilitiesService.showSuccess(_.replace(LocalMessages.messages["18"], '%s', 'Performance Curve'));
        this._UtilitiesService.showSuccess(LocalMessages.messages['78']);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  // prepare data for create new chiller palant
  prepareCreateData() {
    let formData = new FormData();
    if (this.createData.selectedFile) {
      formData.append("file", this.createData.selectedFile, this.createData.selectedFile.name);
    }
    formData.append("name", this.createData.name);
    formData.append("note", this.createData.note);
    // formData.append("id", this.selectedId);
    return formData;
  }
  // validate
  inputValidation(data) {
    let errorInput = [];
    if (!data.name || !data.fileName || !data.fileName) {
      errorInput.push(LocalMessages.messages["15"]);
    } else {
      if (!this._ValidateService.checkValidInputName(data.name, true)) {
        errorInput.push(LocalMessages.messages["1"]);
      }
      if (data.selectedFile == '') {
        errorInput.push(LocalMessages.messages["107"]);
      }
    }
    return errorInput;
  }
  // selecte file
  selectEvent(file): void {
    if (!this._ValidateService.validatePerformanceFileSize(file.size)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["108"]);
      this.createData.fileName = '';
      this.cancelEvent();
      return
    }

    if (!this._ValidateService.validatePerformanceFile(file.name)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["107"]);
      this.createData.fileName = '';
      this.cancelEvent();
      return;
    }
    this.createData.selectedFile = file;
    this.createData.fileName = file.name;
  }

  cancelEvent(): void {
    this.createData.selectedFile = null;
  }
  disableSave() {
    if (!this.createData.name || !this.createData.fileName) {
      return true;
    } else {
      return false;
    }
  }
}

@Component({
  selector: 'performance-curve-detail-dialog',
  templateUrl: 'dialog/performance-curve-detail-dialog.html',
  styleUrls: ['./performance-curve.component.scss']
})
export class PerformanceCurveDetailDialog implements OnInit {

  updateData = {
    id: null,
    name: null,
    selectedFile: null,
    fileName: null,
    note: ''
  };

  inputMaxName: number = VARIABLES.INPUT_MAX_NAME;
  inputMaxLength: number = VARIABLES.INPUT_MAX_LENGTH;
  constructor(
    public dialogRef: MatDialogRef<PerformanceCurveDetailDialog>,
    public _ValidateService: ValidateService,
    public _UtilitiesService: UtilitiesService,
    private _PerformanceCurveService: PerformanceCurveService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }
  ngOnInit() {
    this.updateData = _.cloneDeep(this.data);
  }

  getDetailPerformanceCurve() {
    const request = {};
    return this._PerformanceCurveService.getPerformanceCurveList(request).then(result => {
      if (result) {
        this.data = result.content;
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, null);
    });
  }

  updatePerformanceCurve() {
    let errorInput = [];
    errorInput = this.inputValidation(this.updateData);
    const request = this.prepareupdateData();
    if (errorInput.length > 0) {
      this._UtilitiesService.validationErrorDisplay(errorInput);
    } else {
      this._UtilitiesService.showLoading();
      this.updateAction(request).then(() => {
        this._UtilitiesService.stopLoading();
      });
    }
  }

  updateAction(request) {
    return this._PerformanceCurveService.putPerformanceCurve(request).then(result => {
      if (result) {
        this.dialogRef.close('true');
        this._UtilitiesService.showSuccess(LocalMessages.messages["11"]);
      }
    }, error => {
      this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['12']);
    });
  }

  // prepare data for create new chiller palant
  prepareupdateData() {
    let formData = new FormData();
    if (this.updateData.selectedFile) {
      formData.append("file", this.updateData.selectedFile, this.updateData.selectedFile.name);
    }
    formData.append("name", this.updateData.name);
    formData.append("note", this.updateData.note);
    formData.append("id", this.updateData.id);
    return formData;
  }
  // validate
  inputValidation(data) {
    let errorInput = [];
    if (!data.name || !data.fileName || !data.fileName) {
      errorInput.push(LocalMessages.messages["15"]);
    } else {
      if (!this._ValidateService.checkValidInputName(data.name, true)) {
        errorInput.push(LocalMessages.messages["1"]);
      }
      if (data.selectedFile == '') {
        errorInput.push(LocalMessages.messages["107"]);
      }
    }
    return errorInput;
  }
  // selecte file
  selectEvent(file): void {
    if (!this._ValidateService.validatePerformanceFileSize(file.size)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["108"]);
      this.updateData.fileName = '';
      this.cancelEvent();
      return
    }

    if (!this._ValidateService.validatePerformanceFile(file.name)) {
      this._UtilitiesService.showWarning(LocalMessages.messages["107"]);
      this.updateData.fileName = '';
      this.cancelEvent();
      return;
    }
    this.updateData.selectedFile = file;
    this.updateData.fileName = file.name;
  }

  cancelEvent(): void {
    this.updateData.selectedFile = null;
  }
  disableSave() {
    if (!this.updateData.name || !this.updateData.fileName) {
      return true;
    } if (_.isEqual(this.data.name, this.updateData.name) == true
      && _.isEqual(this.data.fileName, this.updateData.fileName) == true
      && _.isEqual(this.data.note, this.updateData.note) == true
    ) {
      return true;
    } else {
      return false;
    }
  }
}