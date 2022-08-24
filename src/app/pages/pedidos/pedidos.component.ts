import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { VentasMayoristasService } from '../../services/ventas-mayoristas.service';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styles: [
  ]
})
export class PedidosComponent implements OnInit {

  // Etapa
  public etapa = 'pedidos';

  // Pedidos
  public pedidos: any[] = null;
  public pedidosPendientes: any[] = [];
  public pedidoSeleccionado: any = null;
  public productos: any[] = [];
  public showModal: boolean = false;

  // Productos
  public productosPendientes:any[] = [];

  // Paginacion
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(private ventasMayoristasService: VentasMayoristasService,
              private ventasMayoristasProductosService: VentasMayoristasProductosService,
              private dataService: DataService,
              private alertService: AlertService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Mis pedidos';
    this.listarPedidos();
  }

  listarPedidos(): void {
    this.alertService.loading();
    this.ventasMayoristasService.listarVentas(this.ordenar.direccion, this.ordenar.columna).subscribe({
      next: ({ventas}) => {
        this.pedidos = ventas;
        this.pedidosPendientes = ventas.filter( pedido => pedido.activo );
        this.productosParaElaboracion();
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Seleccionar pedido
  seleccionarPedido(pedido: any): void {
    this.alertService.loading();
    this.pedidoSeleccionado = pedido;
    this.ventasMayoristasProductosService.listarProductos(
      -1,
      'createdAt',
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

  // Confirmar pedido
  confirmarPedido(pedido: any): void {
    this.alertService.question({ msg: 'Confirmar pedido', buttonText: 'Confirmar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {
        this.alertService.loading();
        this.ventasMayoristasService.actualizarVenta(pedido._id, {activo: false}).subscribe({
          next: () => {
            this.alertService.loading();
            this.listarPedidos();
          },
          error: ({error}) => {
            this.alertService.errorApi(error.message);
          }
        })
      }
    });
  }

  // Productos para elaboracion
  productosParaElaboracion(): void {
    this.ventasMayoristasProductosService.listarProductos(1,'descripcion', '', 'true').subscribe({
      next: ({productos}) => {
        
        let productoTMP = productos;

        this.productosPendientes = [];
        
        const agregados = [];
        
        productoTMP.map( producto => {
          if(!agregados.includes(producto.producto._id)){
            agregados.push(producto.producto._id);
            this.productosPendientes.push(producto);
          }else{
            this.productosPendientes.map( elemento => {
              if(elemento.producto._id === producto.producto._id){
                elemento.cantidad += producto.cantidad; 
              }
            })
          }
          console.log(agregados.includes(producto.producto._id));
        });
        
        console.log(agregados);
      
      },
      
      error: ({error}) => this.alertService.errorApi(error.message)
    
    })
  }

  // Cambiar etapa
  cambiarEtapa(): void {
    this.etapa = this.etapa === 'productos' ? 'pedidos' : 'productos';  
  }

  // Filtrar Activo/Inactivo
  filtrarActivos(activo: any): void{
    this.paginaActual = 1;
    this.filtro.activo = activo;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void{
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string){
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1; 
    this.alertService.loading();
    this.listarPedidos();
  }

}

