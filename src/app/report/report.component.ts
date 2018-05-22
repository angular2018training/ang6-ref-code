import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PAGES } from 'app/constant';

@Component({
  selector: 'report',
  template: ''
})
export class ReportComponent implements OnInit {
  constructor(private router: Router) { 
  }
  ngOnInit() {
    this.router.navigate([PAGES.CUSTOMER.ENERGY_REPORT]);    
  }
}

