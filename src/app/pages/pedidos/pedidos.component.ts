import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { VentasMayoristasService } from '../../services/ventas-mayoristas.service';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';
import { RepartidoresService } from 'src/app/services/repartidores.service';

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styles: [
  ]
})
export class PedidosComponent implements OnInit {

  // Etapa
  public etapa = 'pedidos';

  // Modal
  public showModal: boolean = false;
  public showModalEnvio: boolean = false;
  public showModalCompletar: boolean = false;
  public showModalCompletarDeuda: boolean = false;

  // Repartidores
  public repartidores: any[] = [];
  public repartidor = '';

  // Pedidos
  public pedidos: any[] = null;
  public pedidosPendientes: any[] = [];
  public pedidoSeleccionado: any = null;
  public productos: any[] = [];
  public montoRecibido = 0;
  public estadoPago = 'Total'; // Total - Deuda
  public montoDeuda = null;
  public totalCompletar = 0;

  // Productos
  public productosPendientes:any[] = [];

  // Paginacion
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

  constructor(private ventasMayoristasService: VentasMayoristasService,
              private ventasMayoristasProductosService: VentasMayoristasProductosService,
              private repartidoresService: RepartidoresService,
              private dataService: DataService,
              private alertService: AlertService) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Pedidos';
    this.cargaInicial();
  }

  // Carga inicial de valores
  cargaInicial(): void {
    this.alertService.loading();
    this.repartidoresService.listarRepartidores().subscribe({
      next: ({ repartidores }) => {
        this.repartidores = repartidores;
        this.ventasMayoristasService.listarVentas(this.ordenar.direccion, this.ordenar.columna).subscribe({
          next: ({ventas}) => {
            this.pedidos = ventas;
            this.pedidosPendientes = ventas.filter( pedido => pedido.activo );
            this.productosParaElaboracion();
            this.showModalEnvio = false;
            this.alertService.close();
          },
          error: ({error}) => {
            this.alertService.errorApi(error.message);
          }
        });
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    }); 
  }

  listarPedidos(): void {
    this.alertService.loading();
      this.ventasMayoristasService.listarVentas(this.ordenar.direccion, this.ordenar.columna).subscribe({
        next: ({ventas}) => {
          this.pedidos = ventas;
          this.pedidosPendientes = ventas.filter( pedido => pedido.activo );
          this.productosParaElaboracion();
          this.showModalEnvio = false;
          this.showModalCompletar = false;
          this.showModalCompletarDeuda = false;
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

  // Abrir modal -> Enviar pedido
  abrirEnviarPedido(pedido: any): void {
    this.repartidor = '';
    this.pedidoSeleccionado = pedido;
    this.showModalEnvio = true;
  }

  // Enviar pedido
  enviarPedido(): void {

    // Verificacion - Repartidor vacio
    if(this.repartidor.trim() === ''){
      this.alertService.info('Debe seleccionar un repartidor');
      return;
    }

    this.alertService.loading();  

    const data = {
      estado: 'Enviado',
      repartidor: this.repartidor  
    }

    this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, data).subscribe({
      next: () => {
        this.repartidor = '';
        this.pedidoSeleccionado = null;
        this.listarPedidos();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })
  
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
        });      
      },
      
      error: ({error}) => this.alertService.errorApi(error.message)
    
    })
  }

  // Cancelar pedido
  cancelarPedido(pedido: any): void {
    this.alertService.question({ msg: 'Cancelando pedido', buttonText: 'Cancelar pedido', cancelarText: 'Regresar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {
        this.alertService.loading();
        this.ventasMayoristasService.actualizarVenta(pedido._id, { estado: 'Cancelado', activo: false }).subscribe({
          next: () => {
            this.listarPedidos();
          },
          error: ({error}) => {
            this.alertService.errorApi(error.message);
          }
        })
      }
    });    
  }

  // Listar productos de pedido
  listarProductos(): void {
    this.ventasMayoristasProductosService.listarProductos(
      1,
      'descripcion',
      this.pedidoSeleccionado._id
    ).subscribe({
      next: ({productos}) => {
        this.productos = productos;
        this.showModalCompletar = true;  
        this.calculoMonto(); 
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    })
  }

  // Abrir modal - Cancelar deuda
  abrirCancelarDeuda(pedido): void {
    this.pedidoSeleccionado = pedido;
    this.totalCompletar = this.dataService.redondear(pedido.deuda_monto + pedido.monto_recibido, 2);
    this.showModalCompletarDeuda = true;
  }

  // Cancelar deuda
  cancelarDeuda(): void {
    this.alertService.question({ msg: 'Completar pedido', buttonText: 'Completar', cancelarText: 'Regresar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {
        this.alertService.loading();
        this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, {
          estado: 'Completado',
          monto_recibido: this.totalCompletar,
          deuda_monto: 0,
          deuda: false
        }).subscribe({
          next: () => {
            this.totalCompletar = 0;
            this.listarPedidos();
          },
          error: ({ error }) => this.alertService.errorApi(error.message)
        }) 
      }
    });   
  }

  // Completar pedido
  abrirCompletarPedido(pedido: any): void {
    this.montoDeuda = null;
    this.estadoPago = 'Total';
    this.pedidoSeleccionado = pedido;
    this.montoRecibido = pedido.precio_total;
    this.alertService.loading();
    this.listarProductos();
  }

  // Producto no entregado
  productoNoEntregado(producto): void {
    
    this.alertService.loading();

    const data = { entregado: producto.entregado ? false : true }

    this.ventasMayoristasProductosService.actualizarProducto(producto._id, data).subscribe({
      next: () => {
        this.listarProductos();
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    })

  }

  // Calculo de monto
  calculoMonto(): void {
    let montoTMP = 0;
    this.productos.map( producto => {
      if(producto.entregado) montoTMP += producto.precio;
    });
    this.montoRecibido = this.dataService.redondear(montoTMP, 2);
  }

  // Completar pedido
  completarPedido(): void {

    // Verificaciones
    if(!this.montoRecibido || this.montoRecibido < 0){
      this.alertService.info('Debe colocar un monto recibido');
      return;
    }

    if(this.estadoPago === 'Deuda' && (!this.montoDeuda ||this.montoDeuda < 0) ){
      this.alertService.info('Debe colocar el monto adeudado');
      return;
    }

    this.alertService.question({ msg: 'Completando pedido', buttonText: 'Completar', cancelarText: 'Regresar' })
    .then(({isConfirmed}) => {  
      if (isConfirmed) {

        const data = {
          estado: this.estadoPago === 'Total' ? 'Completado' : 'Deuda',
          monto_recibido: this.montoRecibido,
          deuda: this.estadoPago === 'Total' ? false : true,
          deuda_monto: this.estadoPago === 'Total' ? 0 : this.montoDeuda,
        }
    
        this.alertService.loading();
    
        this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, data).subscribe({
          next: () => {
            this.estadoPago = 'Total';
            this.montoRecibido = null;
            this.montoDeuda = null;
            this.listarPedidos();
          },  
          error: ({ error }) => this.alertService.errorApi(error.message)
        })
        
      }
    }); 

  }

  // Cambiar etapa
  cambiarEtapa(): void {
    this.etapa = this.etapa === 'productos' ? 'pedidos' : 'productos';  
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

