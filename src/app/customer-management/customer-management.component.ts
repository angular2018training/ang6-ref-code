import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { PAGES } from 'app/constant';

@Component({
  selector: 'customer-management',
  template: '',
})
export class CustomerManagementComponent implements OnInit {
  constructor(private router: Router) { 
  }
  ngOnInit() {
    this.router.navigate([PAGES.OPERATOR.CUSTOMER_LIST]);    
  }
}