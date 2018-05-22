import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/observable/fromEvent';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort } from '@angular/material';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UtilitiesService } from 'app/services/utilities.service';
import * as cytoscape from 'cytoscape';

const DECIMAL_FORMAT: (v: any) => any = (v: number) => v.toFixed(2);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  columns: ITdDataTableColumn[] = [
    { name: 'first_name', label: 'First Name', sortable: true, },
    { name: 'last_name', label: 'Last Name', filter: true },
    { name: 'gender', label: 'Gender', hidden: false },
    { name: 'email', label: 'Email', sortable: true },
    { name: 'balance', label: 'Balance', numeric: true, format: DECIMAL_FORMAT },
    { name: 'action', label: 'Action', sortable: false }
  ];

  data: any[] = [
    {
      "balance": 7454.6,
      "email": "sclutterham0@123-reg.co.uk",
      "first_name": "Sully",
      "gender": "Male",
      "img": "https://robohash.org/similiquemodiautem.bmp?size=50x50&set=set1",
      "ip_address": "158.0.165.138",
      "last_name": "Clutterham"
    },
    {
      "balance": 3561.4,
      "email": "mevason1@usatoday.com",
      "first_name": "Mateo",
      "gender": "Male",
      "img": "https://robohash.org/molestiaeadquia.bmp?size=50x50&set=set1",
      "ip_address": "68.147.207.137",
      "last_name": "Evason"
    },
    {
      "balance": 4456.3,
      "email": "lgardener2@wordpress.org",
      "first_name": "Lira",
      "gender": "Female",
      "img": "https://robohash.org/laboredolorumvelit.jpg?size=50x50&set=set1",
      "ip_address": "96.85.6.31",
      "last_name": "Gardener"
    },
    {
      "balance": 5938,
      "email": "edunckley3@instagram.com",
      "first_name": "Edvard",
      "gender": "Male",
      "img": "https://robohash.org/ullamquaedeleniti.png?size=50x50&set=set1",
      "ip_address": "233.189.117.211",
      "last_name": "Dunckley"
    },
    {
      "balance": 4241.6,
      "email": "gsouza4@squidoo.com",
      "first_name": "Gwynne",
      "gender": "Female",
      "img": "https://robohash.org/possimusrepellendusodio.png?size=50x50&set=set1",
      "ip_address": "164.226.80.40",
      "last_name": "Souza"
    },
    {
      "balance": 6558,
      "email": "sfurmedge5@furl.net",
      "first_name": "Sena",
      "gender": "Female",
      "img": "https://robohash.org/iustoillumsit.png?size=50x50&set=set1",
      "ip_address": "192.214.177.38",
      "last_name": "Furmedge"
    },
    {
      "balance": 3159.2,
      "email": "cdykes6@china.com.cn",
      "first_name": "Christian",
      "gender": "Male",
      "img": "https://robohash.org/exveniama.jpg?size=50x50&set=set1",
      "ip_address": "147.35.25.192",
      "last_name": "Dykes"
    },
    {
      "balance": 1471,
      "email": "sklagge7@dell.com",
      "first_name": "Sada",
      "gender": "Female",
      "img": "https://robohash.org/exercitationemtotamenim.jpg?size=50x50&set=set1",
      "ip_address": "143.193.248.153",
      "last_name": "Klagge"
    },
    {
      "balance": 9969.7,
      "email": "glewerenz8@europa.eu",
      "first_name": "Genia",
      "gender": "Female",
      "img": "https://robohash.org/enimdoloremqueut.jpg?size=50x50&set=set1",
      "ip_address": "104.0.250.224",
      "last_name": "Lewerenz"
    },
    {
      "balance": 7253.5,
      "email": "ddemarchi9@taobao.com",
      "first_name": "Daloris",
      "gender": "Female",
      "img": "https://robohash.org/uteaquearchitecto.jpg?size=50x50&set=set1",
      "ip_address": "124.166.67.100",
      "last_name": "De Marchi"
    }
  ];
  filteredData: any[] = this.data;
  filteredTotal: number = this.data.length;

  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSizes: number[] = [50, 100, 150, 200];
  pageSize: number = this.pageSizes[0];
  sortBy: string = 'first_name';
  selectedRows: any[] = [];
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  @ViewChild('filter') filterEle: ElementRef;

  textModel = "Text title";
  callback(abc) {
    console.log(this.textModel, abc);
    this.textModel = abc;
  }

  constructor(private _dataTableService: TdDataTableService, private _UtilitiesService: UtilitiesService) { }

  ngOnInit() {
    // this.testAPI();
    // input search event
    Observable.fromEvent(this.filterEle.nativeElement, 'keyup')
      .debounceTime(150)
      .distinctUntilChanged()
      .subscribe(() => {
        this.search(this.filterEle.nativeElement.value);
      });
  }

  ngAfterViewInit() {
    var cy = cytoscape({

      container: document.getElementById('cy'), // container to render in

      elements: [ // list of graph elements to start with
        { // node a
          data: { id: 'a' }
        },
        { // node b
          data: { id: 'b' }
        },
        { // edge ab
          data: { id: 'ab', source: 'a', target: 'b' }
        }
      ],

      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)'
          }
        },

        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }
      ],

      layout: {
        name: 'grid',
        rows: 1
      }

    });
  }

  toggleDefaultFullscreenDemo(): void {
    this._UtilitiesService.showLoading();
    setTimeout(() => {
      this._UtilitiesService.hideLoading();
    }, 1500);
  }

  showError() {
    this._UtilitiesService.showError('Error message');
  }
  showSuccess() {
    this._UtilitiesService.showSuccess('Success message');
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


  showConfirmDialog() {
    this._UtilitiesService.showConfirmDialog('Confirm message', (result) => {
      if (result) {
        // handle here
      }
    });
  }
}