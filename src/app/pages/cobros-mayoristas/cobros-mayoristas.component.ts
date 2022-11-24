import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';

@Component({
  selector: 'app-cobros-mayoristas',
  templateUrl: './cobros-mayoristas.component.html',
  styles: [
  ]
})
export class CobrosMayoristasComponent implements OnInit {

  constructor(
    private dataService: DataService,
    public authServoce: AuthService,
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
  }

}
