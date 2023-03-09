import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { ReservasService } from 'src/app/services/reservas.service';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styles: [
  ]
})
export class ReservasComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalReserva = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Reservas
  public idReserva: string = '';
  public reservas: any = [];
  public reservaSeleccionada: any;
  public descripcion: string = '';

  // Paginacion
  public totalItems: number;
  public desde: number = 0;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: '',
    estado: 'Pendiente'
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'nro'
  }

  constructor(private reservasService: ReservasService,
    private authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Reservas';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarReservas();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('RESERVAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Abrir modal
  abrirModal(estado: string, reserva: any = null): void {
    this.reiniciarFormulario();
    this.descripcion = '';
    this.idReserva = '';

    if (estado === 'editar') this.getReserva(reserva);
    else this.showModalReserva = true;

    this.estadoFormulario = estado;
  }

  // Traer datos de reserva
  getReserva(reserva: any): void {
    this.alertService.loading();
    this.idReserva = reserva._id;
    this.reservaSeleccionada = reserva;
    this.reservasService.getReserva(reserva._id).subscribe(({ reserva }) => {
      this.descripcion = reserva.descripcion;
      this.alertService.close();
      this.showModalReserva = true;
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Listar reservas
  listarReservas(): void {
    this.reservasService.listarReservas(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.filtro.parametro,
      this.filtro.activo,
      this.filtro.estado
    )
      .subscribe(({ reservas, totalItems }) => {
        this.reservas = reservas;
        this.totalItems = totalItems;
        this.showModalReserva = false;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }

  // Nueva reserva
  nuevaReserva(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.reservasService.nuevaReserva(data).subscribe(() => {
      this.listarReservas();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar reserva
  actualizarReserva(): void {

    // Verificacion: Descripción vacia
    if (this.descripcion.trim() === "") {
      this.alertService.info('Debes colocar una descripción');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.descripcion,
      updatorUser: this.authService.usuario.userId,
    }

    this.reservasService.actualizarReserva(this.idReserva, data).subscribe(() => {
      this.listarReservas();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Actualizar estado Activo/Inactivo
  actualizarEstado(reserva: any): void {

    const { _id, activo } = reserva;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.reservasService.actualizarReserva(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarReservas();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });

  }

  // Reiniciando formulario
  reiniciarFormulario(): void {
    this.descripcion = '';
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void {
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarReservas();
  }

  // Cambiar cantidad de items
  cambiarCantidadItems(): void {
    this.paginaActual = 1
    this.cambiarPagina(1);
  }

  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    this.desde = (this.paginaActual - 1) * this.cantidadItems;
    this.alertService.loading();
    this.listarReservas();
  }

  // Eliminar reserva
  eliminarReserva(reserva: any): void {
    this.alertService.question({ msg: '¿Quieres eliminar la reserva?', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.reservasService.eliminarReserva(reserva._id).subscribe(() => {
            this.alertService.loading();
            this.dataService.alertaReservas();
            this.listarReservas();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });    
  }


}
