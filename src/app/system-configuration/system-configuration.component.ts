import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PAGES } from 'app/constant';

@Component({
  selector: 'system-configuration',
  template: ''  
})
export class SystemConfigurationComponent implements OnInit {
  constructor(private router: Router) { 
  }
  ngOnInit() {
    this.router.navigate([PAGES.OPERATOR.SMS_SERVICE]);    
  }
}

