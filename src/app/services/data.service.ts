import { Injectable } from '@angular/core';
import { AlertService } from './alert.service';
import { ReservasService } from './reservas.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  
  public ubicacionActual: string = 'Dashboard';  // Statebar - Direccion actual
  public showMenu: Boolean = true;               // Header - Controla la visualizacion de la barra de navegacion
  public showAlertaReserva: Boolean = false;
  public showAlertaReservaBarra: Boolean = false;
  public cantidadReservasPorVencer: number = 0;

  constructor(
    private reservasService: ReservasService,
    private alertService: AlertService
    ) {}

  // Redonde de numeros
  redondear(numero:number, decimales:number):number {
  
    if (typeof numero != 'number' || typeof decimales != 'number') return null;

    let signo = numero >= 0 ? 1 : -1;

    return Number((Math.round((numero * Math.pow(10, decimales)) + (signo * 0.0001)) / Math.pow(10, decimales)).toFixed(decimales));
  
  }

  // Consultar reservas por vencer
  alertaReservas(): void {
    this.reservasService.reservasPorVencer().subscribe({
      next: ({ reservas }) => {
        if(reservas.length > 0){
          this.cantidadReservasPorVencer = reservas.length;
          this.showAlertaReserva = true;
          this.showAlertaReservaBarra = true;
          this.sonidoReserva();
        }else{
          this.showAlertaReserva = false;
          this.showAlertaReservaBarra = false;
        }
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Sonido - Alerta -> Reserva por vencer
  sonidoReserva(): void {
    let audioReserva = new Audio();
    audioReserva.src = "assets/sounds/Alert-Reserva.wav";
    audioReserva.load();
    audioReserva.play();    
  }

  cerrarAlertaReservas(): void {
    this.showAlertaReserva = false;
  }
    
}
