import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';

@Component({
  selector: 'app-alerta-reserva',
  templateUrl: './alerta-reserva.component.html',
  styles: [
  ]
})
export class AlertaReservaComponent implements OnInit {

  constructor(
    public authService: AuthService,
    public dataService: DataService
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-alerta', { y:100, opacity: 0, duration: .2 });
  }

}
