import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  searchFieldControl: FormControl;

  options: string[] = ['One', 'Two', 'Three'];

  constructor() {
    this.searchFieldControl = new FormControl();
  }

  ngOnInit(): void {
  }

}
