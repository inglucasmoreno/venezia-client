import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-statebar',
  templateUrl: './statebar.component.html',
  styleUrls: ['./statebar.component.css']
})
export class StatebarComponent implements OnInit {

  constructor(public dataService: DataService) { }

  ngOnInit(): void {}

}
