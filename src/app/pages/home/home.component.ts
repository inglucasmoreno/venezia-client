import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import gsap from 'gsap';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit {

  public SUCURSAL = environment.sucursal;

  // Permisos
  public permiso_cafeteria: boolean = false;
  public permiso_ventas: boolean = false;

  constructor(
    public authService: AuthService,
    private dataService: DataService
  ) { }

  ngOnInit(): void { 
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.verificarPermiso();
    this.dataService.ubicacionActual = 'Dashboard - Home';
  }

  verificarPermiso(): void {
    
    // Permiso - Cafeteria
    this.permiso_cafeteria = this.authService.usuario.permisos.includes('CAFETERIA_NAV') || this.authService.usuario.role === 'ADMIN_ROLE';
    
    // Permiso - Ventas
    this.permiso_ventas = this.authService.usuario.permisos.includes('VENTAS_NAV') || this.authService.usuario.role === 'ADMIN_ROLE';
  
  }

}
