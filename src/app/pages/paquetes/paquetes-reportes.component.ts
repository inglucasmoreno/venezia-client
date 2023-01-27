import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { PaquetesService } from 'src/app/services/paquetes.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import gsap from 'gsap';

@Component({
  selector: 'app-paquetes-reportes',
  templateUrl: './paquetes-reportes.component.html',
  styles: [
  ]
})
export class PaquetesReportesComponent implements OnInit {

  // Flags
  public showFiltros = true;
  public showModal = false;
  public inicio = true;

  // Filtrado
  public fechaDesde = '';
  public fechaHasta = '';
  public repartidor = '';
  public mayorista = '';
  public estado = '';

  // Paquetes
  public paqueteSeleccionado: any = null;
  public totalMonto: number = 0;
  public totalIngresos: number = 0;
  public totalDeuda: number = 0;
  public paquetes: any[] = [];
  public productos: any[] = [];
  public totales: any;

  // Mayoristas
  public mayoristas: any[] = [];

  // Repartidores
  public repartidores: any[] = [];

  constructor(
    private paquetesService: PaquetesService,
    public authService: AuthService,
    private usuariosService: UsuariosService,
    private dataService: DataService,
    private alertService: AlertService,
  ) { }

  // Paginacion
  public totalItems: number;
  public desde: number = 0;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    estado: 'Pendiente',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Reportes de paquetes';
    this.cargaInicial();
  }

  cargaInicial(): void {
    this.alertService.loading();
    this.usuariosService.listarUsuarios().subscribe({
      next: ({ usuarios }) => {
        this.repartidores = usuarios.filter(usuario => (usuario.role === 'DELIVERY_ROLE'));
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Listar paquetes
  listarPaquetes(): void {
    this.alertService.loading();
    this.paquetesService.listarPaquetes(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.estado,
      '',
      this.repartidor,
      this.fechaDesde,
      this.fechaHasta
    ).subscribe({
      next: ({ paquetes, totalItems, totales }) => {
        this.inicio = false;
        this.totales = totales;
        this.paquetes = paquetes;
        this.totalItems = totalItems;
        console.log(totales);
        if (totalItems > 0) this.showFiltros = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Filtrar por parametro
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Seleccionar paquete
  seleccionarPaquete(paquete: any): void {
    this.alertService.loading();
    this.paqueteSeleccionado = paquete;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarPaquetes();
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
    this.listarPaquetes();
  }

}
