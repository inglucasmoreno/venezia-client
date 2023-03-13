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

  // Permisos de usuarios login
  public permisos = { all: false };

  constructor(
    public authService: AuthService,
    public dataService: DataService
  ) { }

  ngOnInit(): void {
    this.permisos.all = this.permisosUsuarioLogin();
    gsap.from('.gsap-alerta', { y: 100, opacity: 0, duration: .2 });
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('RESERVAS_ALL') || this.authService.usuario.permisos.includes('RESERVAS_READ') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

}
