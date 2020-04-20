import { Component, OnInit, ComponentFactoryResolver } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';

@Component({
  selector: 'app-trainer',
  templateUrl: './trainer.component.html',
  styleUrls: ['./trainer.component.scss']
})
export class TrainerComponent implements OnInit {

  trainings: Array<{ name: string; }>;

  constructor(private dbService: NgxIndexedDBService) { }

  ngOnInit(): void {
    this.dbService.getAll('trainings').then(
      (trainings: Array<{ name: string; }>) => this.trainings = trainings
    );
  }

  startTraining(training) {
    console.log(training);
  }

}
