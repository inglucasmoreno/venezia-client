import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CajasMayoristasService } from 'src/app/services/cajas-mayoristas.service';
import { DataService } from 'src/app/services/data.service';
import gsap from 'gsap';
import { add, format } from 'date-fns';

@Component({
  selector: 'app-cajas-mayoristas-historial',
  templateUrl: './cajas-mayoristas-historial.component.html',
  styles: [
  ]
})
export class CajasMayoristasHistorialComponent implements OnInit {

  // Permisos de usuarios login
  public permisos = { all: false };

  // Modal
  public showModalDetalles = false;
  public showModalReportes: boolean = false;
  public showModalAcumuladas: boolean = false;

  // Flag
  public flagGastos = false;
  public flagIngresos = false;

  // Estado formulario 
  public estadoFormulario = 'crear';

  // Caja
  public idCaja: string = '';
  public cajas: any = [];
  public cajaSeleccionada: any;
  public descripcion: string = '';

  // Paginacion
  public totalItems: number;
  public desde: number = 0;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Reportes
  public reportes: any = {};
  public fechaDesde = '';
  public fechaHasta = '';
  public fechaDesdeMostrar = '';
  public fechaHastaMostrar = '';

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: '',
    fechaDesde: '',
    fechaHasta: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'fecha_caja',
  }

  constructor(
    private cajasService: CajasMayoristasService,
    public authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Historial de cajas';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarCajas();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('MAYORISTAS_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Listar cajas
  listarCajas(): void {

    const parametros = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      desde: this.desde,
      cantidadItems: this.cantidadItems,
      parametro: this.filtro.parametro,
      fechaDesde: this.filtro.fechaDesde,
      fechaHasta: this.filtro.fechaHasta,
    }

    this.cajasService.listarCajas(parametros)
      .subscribe(({ cajas, totalItems }) => {
        this.cajas = cajas;
        this.totalItems = totalItems;
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }


  // Reporte de cajas
  generarReporte(): void {

    this.alertService.loading();
    const parametros = { fechaDesde: this.fechaDesde, fechaHasta: this.fechaHasta };
    if (this.fechaDesde !== '') this.fechaDesdeMostrar = format(add(new Date(this.fechaDesde), { days: 1 }), 'dd-MM-yyyy');
    if (this.fechaHasta !== '') this.fechaHastaMostrar = format(add(new Date(this.fechaHasta), { days: 1 }), 'dd-MM-yyyy');

    this.cajasService.reporteCajas(parametros).subscribe({
      next: ({ reportes }) => {
        console.log(reportes);
        this.reportes = reportes;
        this.showModalReportes = false;
        this.showModalAcumuladas = true;
        this.alertService.close();
      }, error: ({ error }) => {
        this.alertService.errorApi(error.message);
        console.log(error);
      }
    })
  }

  // Abrir detalles de pedido
  abrirModalDetalles(caja: any): void {
    this.cajaSeleccionada = caja;
    this.flagIngresos = false;
    this.flagGastos = false;
    this.showModalDetalles = true;
  }

  // Abrir modal - Reportes
  abrirModalReportes(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.flagIngresos = false;
    this.flagGastos = false;
    this.showModalReportes = true;
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
    this.listarCajas();
  }


  // Paginacion - Cambiar pagina
  cambiarPagina(nroPagina): void {
    this.paginaActual = nroPagina;
    this.desde = (this.paginaActual - 1) * this.cantidadItems;
    this.alertService.loading();
    this.listarCajas();
  }

  // Cambiar cantidad de items
  cambiarCantidadItems(): void {
    this.paginaActual = 1
    this.cambiarPagina(1);
  }


}
