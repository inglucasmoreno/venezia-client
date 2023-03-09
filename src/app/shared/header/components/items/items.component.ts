import { Component, Input, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styles: [
  ]
})
export class ItemsComponent implements OnInit {

  constructor(public dataService: DataService) { }

  @Input() item: string;
  @Input() route: string;
  @Input() routerLinkActive: string = 'bg-secondaryColor rounded';
  @Input() svg: string;

  ngOnInit(): void {
  }

}
