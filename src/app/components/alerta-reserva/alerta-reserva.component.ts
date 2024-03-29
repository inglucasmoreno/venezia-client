import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-alerta-reserva',
  templateUrl: './alerta-reserva.component.html',
  styleUrls: ['./alerta-reserva.component.css']
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
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('RESERVAS_ALL') || this.authService.usuario.permisos.includes('RESERVAS_READ') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

}
