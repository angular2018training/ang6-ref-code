import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PAGES } from 'app/constant';

@Component({
  selector: 'monitoring',
  template: ''
})
export class MonitoringComponent implements OnInit {
  constructor(private router: Router) { 
  }
  ngOnInit() {
    this.router.navigate([PAGES.OPERATOR.MONITORING_EXECUTION_HISTORY]);    
  }
}

