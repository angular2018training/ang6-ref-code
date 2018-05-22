import { ActivatedRoute, Params } from '@angular/router';
import { Input, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { NavigationHistoryService } from '../api-service/navigation-history.service';
import { UtilitiesService } from 'app/services/utilities.service';
import { LoginService } from 'app/services/login.service';
import { LocalMessages } from 'app/message';
import * as moment from "moment";
import * as _ from 'lodash';
import { VARIABLES } from "../constant";

@Component({
    selector: 'navigation-history',
    templateUrl: './navigation-history.component.html',
    styleUrls: ['./navigation-history.component.scss']
})

export class NavigationHistoryComponent implements OnInit {
    columns: ITdDataTableColumn[] = [
        { name: 'timestamp', label: 'Navigation Time', sortable: true },
        { name: 'chillerPlantName', label: 'Chiller Plant Name' },
        { name: 'type', label: 'Type', width: 100 },
        { name: 'name', label: 'Equipment Name', hidden: false },
        { name: 'description', label: 'Set-Point', filter: true, sortable: true, width: 300 },
        { name: 'measureValue', label: 'Navigation Value' },
        { name: 'unit', label: 'Unit' },
    ];

    tableData: any[] = [];

    chillerPlants: any[] = [
        { id: -1, chillerPlantName: 'All' }
    ];
    types: any[] = [
        { id: -1, value: 'All' },
        { id: 2, value: 'CDWP' },
        { id: 4, value: 'CT' }
    ];
    equipments: any[] = [
        { id: -1, value: 'All' },
    ];

    currentUser;

    fromDate;
    toDate;

    searchModel = {
        userId: -1,
        chillerPlantId: -1,
        type: -1,
        name: -1,
        fromDate: null,
        toDate: null
    }

    filteredData: any[] = this.tableData;
    filteredTotal: number = this.tableData.length;

    searchTerm: string = '';
    fromRow: number = 1;
    currentPage: number = 1;
    pageSizes: number[] = VARIABLES.ROW_PER_PAGE;
    pageSize: number = this.pageSizes[0];
    sortBy: string = 'timestamp';
    selectedRows: any[] = [];
    sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

    noResultFound: string = LocalMessages.messages['22'];

    constructor(
        private _UtilitiesService: UtilitiesService,
        private router: Router,
        private _dataTableService: TdDataTableService,
        private _NavigationHistoryService: NavigationHistoryService,
        private _LoginService: LoginService
    ) {
    }

    ngOnInit() {
        this._UtilitiesService.showLoading();
        this.fromDate = moment().toISOString();
        this.toDate = moment().toISOString();

        this.currentUser = this._LoginService.getUserInfo();

        this.getNavigationChillerPlantList();

        this.getNavigationHistory().then(() => {
            this.filter();
            this._UtilitiesService.hideLoading();
        });

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
        let newData: any[] = this.tableData;
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

    getNavigationChillerPlantList() {
        const request = {
            userId: this.currentUser.userID
        };
        return this._NavigationHistoryService.navigationHistoryChillerPlantList(request).then(result => {
            if (result) {
                this.chillerPlants = result.content;
                let firstChillerPlant = { id: -1, chillerPlantName: 'All' };
                this.chillerPlants.unshift(firstChillerPlant);

                _.forEach(this.chillerPlants, chillerPlant => {
                    let listChillerPlantEquipment: any[] = chillerPlant.listEquipments;
                    _.forEach(listChillerPlantEquipment, equipment => {
                        // let typeFormated = this.formatType(equipment.type);
                        // let _type = { id: 0, value: '' };
                        // _type.id = equipment.type;
                        // _type.value = typeFormated;

                        let equipmentName = equipment.name;
                        let _equipment = { id: '', value: '' };
                        _equipment.id = equipmentName;
                        _equipment.value = equipmentName;

                        // this.types.push(_type);
                        this.equipments.push(_equipment);
                    })
                })
                this.equipments = _.uniqWith(this.equipments, _.isEqual);
                console.log(this.equipments);
            }
        }, error => {
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }

    getNavigationHistory() {
        let userId = this.currentUser.userID;
        let searchParam = _.cloneDeep(this.searchModel);
        let fromDate = this._UtilitiesService.formatTime(new Date(this.fromDate));
        let toDate = this._UtilitiesService.formatTime(new Date(this.toDate));

        searchParam.userId = userId;

        if (searchParam.chillerPlantId === -1) {
            searchParam.chillerPlantId = null;
        }
        if (searchParam.type === -1) {
            searchParam.type = null;
        }
        if (searchParam.name === -1) {
            searchParam.name = null;
        }
        if (_.isNil(searchParam.fromDate)) {
            searchParam.fromDate = fromDate;
        }
        if (_.isNil(searchParam.toDate)) {
            searchParam.toDate = toDate;
        }

        return this._NavigationHistoryService.searchNavigationHistory(searchParam).then(result => {
            if (result) {
                this.tableData = result.content;
                _.forEach(this.tableData, (item) => {
                    item.timestamp = this._UtilitiesService.formatTime(new Date(item.timestamp));
                    item.type = this.formatType(item.type);
                })

                this.filter();
                this._UtilitiesService.hideLoading();
            } else {
                this.tableData = [];
            }
        }, error => {
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }

    onChillerPlantNameChanged() {
        this.searchModel.type = -1;
        this.searchModel.name = -1;
    }

    onTypeChanged() {
        this.searchModel.name = -1;
    }

    onSearchClick() {
        let userId = this.currentUser.userID;
        let fromDate = this._UtilitiesService.formatTime(new Date(this.fromDate));
        let toDate = this._UtilitiesService.formatTime(new Date(this.toDate));

        let searchParam = _.cloneDeep(this.searchModel);
        searchParam.userId = userId;
        searchParam.fromDate = fromDate;
        searchParam.toDate = toDate;

        if (searchParam.chillerPlantId === -1) {
            searchParam.chillerPlantId = null;
        }
        if (searchParam.name === -1) {
            searchParam.name = null;
        }
        if (searchParam.type === -1) {
            searchParam.type = null;
        }
        if (_.isNil(searchParam.fromDate)) {
            searchParam.fromDate = fromDate;
        }
        if (_.isNil(searchParam.toDate)) {
            searchParam.toDate = toDate;
        }

        this.tableData = [];
        this._UtilitiesService.showLoading();
        this._NavigationHistoryService.searchNavigationHistory(searchParam).then(result => {
            if (result) {
                this.tableData = result.content;
                _.forEach(this.tableData, (item) => {
                    item.timestamp = this._UtilitiesService.formatTime(new Date(item.timestamp));
                    item.type = this.formatType(item.type);
                })
            } else {
                this.tableData = [];
                this._UtilitiesService.hideLoading();
            }
            this.filter();
            this._UtilitiesService.hideLoading();
        }, error => {
            this._UtilitiesService.hideLoading();
            this._UtilitiesService.showErrorAPI(error, null);
        });
    }

    formatType(type): string {
        if (type) {
            let navigationType: string = "";
            switch (type) {
                case 2:
                    navigationType = "CDWP"
                    break;
                case 4:
                    navigationType = "CT"
                    break;
                default:
                    break;
            }
            return navigationType;
        }
        return;
    }

}
