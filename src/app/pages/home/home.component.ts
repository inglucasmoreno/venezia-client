import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';
import { VentasService } from 'src/app/services/ventas.service';
import { ReservasService } from 'src/app/services/reservas.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit {

  constructor(private dataService: DataService,
              private alertService: AlertService,
              private reservasService: ReservasService,
              private ventasService: VentasService) { }

  ngOnInit(): void { 
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Home';
    this.reservasService.reservasPorVencer().subscribe({
      next: ({ reservas }) => {
        console.log(reservas);
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }
  
}
