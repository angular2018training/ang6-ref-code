import { Component, OnInit } from '@angular/core';
import { UtilitiesService } from 'app/services/utilities.service';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver/FileSaver';

@Component({
  selector: 'app-export-xlsx',
  templateUrl: './export-xlsx.component.html',
  styleUrls: ['./export-xlsx.component.scss']
})
export class ExportXlsxComponent implements OnInit {
  data = [
    [ "S", "h", "e", "e", "t", "J", "S" ],
    [  1 ,  2 ,  3 ,  4 ,  5 ]
  ]
  constructor(
    private _UtilitiesService: UtilitiesService
  ) { }

  ngOnInit() {
 
  }
  showExportConfirm(ev) {
    this._UtilitiesService.showConfirmDialog('Do you want export excel file ?',
      (result) => {
        if (result) {
          this.actionExport(ev);
        }
      });
  }
  actionExport(ev) {
    /* generate worksheet */
    const ws: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(this.data);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    /* save to file */
    const wbout: string = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    saveAs(new Blob([this.s2ab(wbout)]), 'SheetJS.xlsx');
  }
  s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  }
}
