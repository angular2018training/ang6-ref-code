import { Component, OnInit, Inject } from '@angular/core';
import * as jsPDF from 'jspdf'
import { UtilitiesService } from 'app/services/utilities.service';
import * as html2canvas from "html2canvas";

@Component({
  selector: 'app-export-pdf',
  templateUrl: './export-pdf.component.html',
  styleUrls: ['./export-pdf.component.scss']
})
export class ExportPDFComponent implements OnInit {

  constructor(
    private _UtilitiesService: UtilitiesService
  ) { }

  ngOnInit() {
  }
  showExportConfirm(ev) {
    this._UtilitiesService.showConfirmDialog('Do you want export pdf file ?',
      (result) => {
        if (result) {
          this.actionExport(ev);
        }
      });
  }
  // chart
  actionExport(ev) {
    let nameFile = "energy_consumption_report.pdf";
    // var pdf = new jsPDF('landscape');
    var pdf = new jsPDF('p','pt','a4');
    const widthBodyOld = document.body.style.width;
    if(document.body.clientHeight < 600) {
      console.log(document.body.clientHeight);
      document.body.style.width = '1700px';
    }
    const heightBodyOld = document.body.style.height;
    document.body.style.height = '1700px';    
    html2canvas(document.getElementById('graph'), {
      onrendered: (canvas) => {
        let img = canvas.toDataURL("image/png");
        // pdf.addImage(img, 'png', 20, 15, 255, 180);
        pdf.addImage(img, 'png', 40, 40, 510, 450);
        pdf.save(nameFile);
        document.body.style.width = widthBodyOld;
        document.body.style.height = heightBodyOld;  
      },
      // width: 600,
      // height: 1000
    });
  }
}
