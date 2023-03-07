import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-alerta-reserva',
  templateUrl: './alerta-reserva.component.html',
  styles: [
  ]
})
export class AlertaReservaComponent implements OnInit {

  constructor(public dataService: DataService) { }

  ngOnInit(): void {
  }

}
