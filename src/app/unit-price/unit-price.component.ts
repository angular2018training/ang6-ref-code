import * as moment from "moment";
import * as _ from 'lodash';

import { Component, OnInit, Inject, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from '../services/utilities.service';
import { VARIABLES } from '../constant';

import { UnitPriceService } from '../api-service/unit-price.service';
import { StringService } from '../services/string.service';
import { CreateUnitPriceDialog } from './unit-price-create/unit-price-create.component';
import { UpdateUnitPriceDialog } from './unit-price-detail/unit-price-detail.component';
import { LocalMessages } from "app/message";

@Component({
    selector: 'unit-price',
    templateUrl: './unit-price.component.html',
    styleUrls: ['./unit-price.component.scss']
})

export class UnitPriceComponent implements OnInit {
    noResultMessage = LocalMessages.messages["22"];
    @Input() chillerPlantID;
    constructor(
        private unitPriceService: UnitPriceService,
        public dialog: MatDialog,
        private _dataTableService: TdDataTableService,
        private _UtilitiesService: UtilitiesService,
        private _StringService: StringService,
    ) { }

    ngOnInit() {
        this.reloadData();
    }
    reloadData() {
        this._UtilitiesService.showLoading();
        this.getUnitPriceList().then(() => {
            this._UtilitiesService.stopLoading();
            this.filter();
        }).catch(() => {
            this._UtilitiesService.stopLoading();
        });
    }
    unitPriceDetail(id) {
        let requestParam = {
            plantid: this.chillerPlantID,
            id: id
        };
        return this.unitPriceService.unitPriceDetail(requestParam).then(result => {
            if (result) {
            }
        }, error => {
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }

    getUnitPriceList() {
        let requestParam = {
            plantid: this.chillerPlantID
        };
        return this.unitPriceService.getUnitPriceList(requestParam).then(result => {
            if (result) {
                this.data = result.content;

                if (this.data.length > 0) {
                    this.data.forEach(e => {
                        e.fromDate = moment(e.fromDate);
                        e.toDate = moment(e.toDate);
                    })
                }
                // this.formatDatetime(this.data);
            } else {
                this.data = [];
            }
            this.filter();
        }, error => {
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }

    columns: ITdDataTableColumn[] = [
        { name: 'priceId', label: 'Price ID', sortable: true, filter: true, },
        { name: 'fromDate', label: 'From Date' },
        { name: 'toDate', label: 'To Date' },
        { name: 'status', label: 'Status', sortable: true },
        { name: 'delete', label: 'Delete' },
    ];

    data: any[] = [];
    filteredData: any[] = this.data;
    filteredTotal: number = this.data.length;
    searchTerm: string = '';
    fromRow: number = 1;
    currentPage: number = 1;
    pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
    pageSize: number = this.pageSizes[0];
    sortBy: string = 'status';
    selectedRows: any[] = [];
    sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

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

    // show dialog
    showDeleteConfirm(item) {
        this._UtilitiesService.showConfirmDialog(_.replace(LocalMessages.messages["23"], '%s', item.priceId), (result) => {
            if (result) {
                this.deleteUnitPrice(item.id);
            }
        });
    }
    // delete execute delete
    deleteUnitPrice(id) {
        let requestParam = {
            id: id
        };
        return this.unitPriceService.unitPriceDelete(requestParam).then(result => {
            if (result) {
                this._UtilitiesService.showSuccess(LocalMessages.messages['9']);
                this.reloadData();
            }
        }, error => {
            this._UtilitiesService.showErrorAPI(error, LocalMessages.messages['10']);
        });
    }

    // show add dialog
    showAddDialog() {
        let currency
        if (this.data.length > 0) {
            currency = this.data[0].currencyId;
        } else {
            currency = null;
        }
        let dialogRef = this.dialog.open(CreateUnitPriceDialog, {
            width: '50vw',
            height: '70vh',
            disableClose: true,
            data: {
                chillerPlantID: this.chillerPlantID,
                priceId: '',
                fromDate: '',
                toDate: '',
                status: 0,
                type: 0,
                currencyId: currency,
                unitPriceValue: [
                    {
                        unitValue: 0,
                        fromTime: '00:00',
                        toTime: '23:59',
                    }
                ],
                unitPrices: this.data
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getUnitPriceList();
            }
        });
    }

    onRowClick(row) {
        let currency
        if (this.data.length > 1) {
            currency = row.currencyId;
        } else {
            currency = null;
        }
        let configDialog: any = {
            width: '50vw',
            height: '70vh',
            disableClose: true,
            data: {
                id: row.id,
                chillerPlantId: row.chillerPlantId,
                unitPrices: this.data,
                currencyId: currency
            }
        };
        let dialogRef: any;
        dialogRef = this.dialog.open(UpdateUnitPriceDialog, configDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.getUnitPriceList();
            }
        })
    }
}