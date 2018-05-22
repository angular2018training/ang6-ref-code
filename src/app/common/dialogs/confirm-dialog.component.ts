import { Component, OnInit, Inject, HostBinding } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material";

@Component({
  selector: 'confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./dialogs.component.scss'],
})
export class ConfirmDialog implements OnInit {
  @HostBinding('class.component-content') true;
  ngOnInit() { }
  constructor(public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: any) { }
}