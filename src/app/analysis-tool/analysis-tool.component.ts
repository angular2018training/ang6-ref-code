import { Input, Component, OnInit, ViewChild, ElementRef} from '@angular/core';
import { Router } from '@angular/router';
import { PAGES } from 'app/constant';

@Component({
  selector: 'analysis-tool',
  templateUrl: './analysis-tool.component.html',
  styleUrls: ['./analysis-tool.component.scss']
})

export class AnalysisToolComponent implements OnInit {
  constructor(private router: Router) { }
  ngOnInit() {
    this.router.navigate([PAGES.OPERATOR.ENERGY_CONSUMPTION]);    
  }
}