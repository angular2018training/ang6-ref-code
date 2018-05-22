import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { PAGES } from 'app/constant';

@Component({
  selector: 'operator-management',
  template: ''
})
export class OperatorManagementComponent implements OnInit {
  constructor(private router: Router) { 
  }
  ngOnInit() {
    this.router.navigate([PAGES.OPERATOR.OPERATOR_LIST]);    
  }
}