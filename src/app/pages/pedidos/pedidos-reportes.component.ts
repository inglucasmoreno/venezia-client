import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';
import { VentasMayoristasService } from 'src/app/services/ventas-mayoristas.service';
import gsap from 'gsap';

@Component({
  selector: 'app-pedidos-reportes',
  templateUrl: './pedidos-reportes.component.html',
  styles: [
  ]
})
export class PedidosReportesComponent implements OnInit {

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

  // Pedidos
  public pedidoSeleccionado: any = null;
  public totalMonto: number = 0;
  public totalIngresos: number = 0;
  public totalDeuda: number = 0;
  public pedidos: any[] = [];
  public productos: any[] = [];

  // Mayoristas
  public mayoristas: any[] = [];

  // Repartidores
  public repartidores: any[] = [];

  constructor(
    private ventasMayoristas: VentasMayoristasService,
    public authService: AuthService,
    private mayoristasService: MayoristasService,
    private usuariosService: UsuariosService,
    private dataService: DataService,
    private alertService: AlertService,
    private ventasMayoristasProductosService: VentasMayoristasProductosService
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
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Reportes pedidos';
    this.cargaInicial();
  }

  // Carga inicial
  cargaInicial(): void {
    this.alertService.loading();
    this.mayoristasService.listarMayoristas().subscribe({
      next: ({mayoristas}) => {
        this.mayoristas = mayoristas;
        this.usuariosService.listarUsuarios().subscribe({
          next: ({usuarios}) => {
            this.repartidores = usuarios.filter( usuario => (usuario.role === 'DELIVERY_ROLE') );
            this.alertService.close();
          }, error: ({error}) => this.alertService.errorApi(error.message)
        })
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Listar pedidos
  listarPedidos(): void {
    this.alertService.loading();
    this.ventasMayoristas.listarVentas(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      this.estado,
      '',
      this.repartidor,
      this.mayorista,
      this.fechaDesde,
      this.fechaHasta      
    ).subscribe({
      next: ({ventas, totalItems, totalMonto, totalIngresos, totalDeuda}) => {
        this.inicio = false;
        this.pedidos = ventas;
        this.totalMonto = totalMonto;
        this.totalIngresos = totalIngresos;
        this.totalDeuda = totalDeuda;
        this.totalItems = totalItems;
        if(totalItems > 0) this.showFiltros = false;
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    });
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void{
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Seleccionar pedido
  seleccionarPedido(pedido: any): void {
    this.alertService.loading();
    this.pedidoSeleccionado = pedido;
    this.ventasMayoristasProductosService.listarProductos(
      1,
      'descripcion',
      this.pedidoSeleccionado._id
    ).subscribe({
      next: ({productos}) => {
        this.productos = productos;
        this.showModal = true;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string){
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1; 
    this.alertService.loading();
    this.listarPedidos();
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
    this.listarPedidos();
  }

}
