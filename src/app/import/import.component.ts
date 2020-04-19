import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { ApiService, AutoSuggestItem, AutoSuggestResponse } from '../api.service';
import { Observable } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {

  searchFieldControl = new FormControl('');

  suggestions$: Observable<AutoSuggestItem[]>;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.suggestions$ = this.searchFieldControl.valueChanges.pipe(
      debounceTime(300),
      switchMap(value => this.apiService.getAutoSuggests(value))
    );
  }

  onOptionSelected(selectedOption: AutoSuggestItem) {
    this.searchFieldControl.patchValue(selectedOption.common_name);
  }

}
