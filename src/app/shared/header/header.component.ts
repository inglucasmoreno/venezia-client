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

  // Permisos de usuarios login
  public permisos = { all: false };

  // Items
  public items: any[];
  public itemsMayoristas: any[];
  public itemsReservas: any[];
 
  // Flags - Navegacion
  public administrador = false;
  public showMayoristas = false;
  public showReservas = false;

  // Observable - Consultar reservas
  public TIEMPO_CONSULTA = 60000 * 5;
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
    this.permisos.all = this.permisosUsuarioLogin();

    // Observable -> Monitoreo de reservas por vencer
    if(this.authService.usuario.role !== 'DELIVERY_ROLE' && this.permisos.all){
      
      this.dataService.alertaReservas();

      this.consultarReservas = interval(this.TIEMPO_CONSULTA);
  
      this.consultarReservasSubscription = this.consultarReservas.subscribe( () => {
        this.dataService.alertaReservas();
      })
    }
  
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('RESERVAS_ALL') || this.authService.usuario.permisos.includes('RESERVAS_READ') || this.authService.usuario.role === 'ADMIN_ROLE';
  }
  
  // Habilitacion de navegacion
  habilitacionNavegacion(): void {}

  // Metodo: Cerrar sesion
  logout(): void{ 
    if(this.authService.usuario.role !== 'DELIVERY_ROLE' && this.permisos.all) this.consultarReservasSubscription.unsubscribe();
    this.authService.logout(); 
  }

}
