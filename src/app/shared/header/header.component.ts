import { Component, OnInit } from '@angular/core';
import { interval, Observable, Subscription } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { AuthService } from '../../services/auth.service';
import { items } from './items';
import { itemsMayoristas } from './items-mayoristas';
import { itemsReservas } from './items-reservas';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styles: [
  ]
})
export class HeaderComponent implements OnInit {

  // Items
  public items: any[];
  public itemsMayoristas: any[];
  public itemsReservas: any[];
 
  // Flags - Navegacion
  public administrador = false;
  public showMayoristas = false;
  public showReservas = false;

  // Observable - Consultar reservas
  public TIEMPO_CONSULTA = 60000 * 5; // 5 Minutos
  public consultarReservasSubscription: Subscription;
  public consultarReservas: any;

  // Permisos para navegacion
  public permiso_usuarios = true;

  constructor( public authService: AuthService,
               public dataService: DataService ) { }

  ngOnInit(): void {
   
    this.items = items;
   
    this.itemsMayoristas = itemsMayoristas;
   
    this.itemsReservas = itemsReservas;
  
    // Observable -> Monitoreo de reservas por vencer
    this.dataService.alertaReservas();
    this.consultarReservas = interval(this.TIEMPO_CONSULTA);

    this.consultarReservasSubscription = this.consultarReservas.subscribe( () => {
      this.consultarReservas;
    })
  
  }
  
  // Habilitacion de navegacion
  habilitacionNavegacion(): void {}

  

  // Metodo: Cerrar sesion
  logout(): void{ 
    this.consultarReservasSubscription.unsubscribe();
    this.authService.logout(); 
  }

}
