import { Component, OnInit } from '@angular/core';
import { add, format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CajasService } from 'src/app/services/cajas.service';
import { DataService } from 'src/app/services/data.service';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Component({
  selector: 'app-cajas-historial',
  templateUrl: './cajas-historial.component.html',
  styles: [
  ]
})
export class CajasHistorialComponent implements OnInit {

  // Modals
  public showModalCaja: boolean = false;
  public showModalReportes: boolean = false;
  public showModalAcumuladas: boolean = false;

  // Shows - Flag muestra
  public showPostnet = false;
  public showIngresos: boolean = false;
  public showGastos: boolean = false;
  public showFacturado: boolean = false;

  // Cajas
  public cajaSeleccionada: any;
  public cajas: any = [];

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
    columna: 'createdAt'
  }

  constructor(
    public authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService,
    private cajasService: CajasService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Historial de cajas';
    this.listarCajas();
  }

  // Listado de cajas
  listarCajas(): void {
    this.alertService.loading();
    const parametros = {
      direccion: this.ordenar.direccion,
      columna: this.ordenar.columna,
      desde: this.desde,
      cantidadItems: this.cantidadItems,
      parametro: this.filtro.parametro,
      fechaDesde: this.filtro.fechaDesde,
      fechaHasta: this.filtro.fechaHasta,
    }
    this.cajasService.listarCajas(parametros).subscribe({
      next: ({ cajas, totalItems }) => {
        this.totalItems = totalItems;
        this.cajas = cajas;
        this.alertService.close();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Reporte de cajas
  generarReporte(): void {
    
    this.alertService.loading();
    const parametros = { fechaDesde: this.fechaDesde, fechaHasta: this.fechaHasta };
    if(this.fechaDesde !== '') this.fechaDesdeMostrar = format(add(new Date(this.fechaDesde),{ days: 1 }), 'dd-MM-yyyy');
    if(this.fechaHasta !== '') this.fechaHastaMostrar = format(add(new Date(this.fechaHasta),{ days: 1 }), 'dd-MM-yyyy');

    this.cajasService.reporteCajas(parametros).subscribe({
      next: ({ reportes }) => {
        this.reportes = reportes;
        this.showModalReportes = false;
        this.showModalAcumuladas = true; 
        this.alertService.close();
      }, error: ({error}) => {
        this.alertService.errorApi(error.message);
        console.log(error);
      }
    })
  }

  // Abrir modal - Detalles de caja
  abrirModalDetalles(caja: any): void {
    this.cajaSeleccionada = caja;
    this.showModalCaja = true;
  }

  // Generar reporte PDF
  generarPDF(): void {
    this.alertService.question({ msg: 'Generando reporte PDF', buttonText: 'Generar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const data = {
            fechasDesde: this.fechaDesdeMostrar,
            fechaHasta: this.fechaHastaMostrar,
            reportes: this.reportes
          }
          this.cajasService.reporteCajasPDF(data).subscribe({
            next: () => {
              this.alertService.close();
              window.open(`${base_url}/pdf/reporte_cajas.pdf`, '_blank');
            }, error: ({error}) => this.alertService.errorApi(error.message)
          });
        }
      });
  }

  // Abrir modal - Reportes
  abrirModalReportes(): void {
    this.fechaDesde = '';
    this.fechaHasta = '';
    this.showModalReportes = true;
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
