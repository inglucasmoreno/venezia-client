import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { VentasMayoristasService } from '../../services/ventas-mayoristas.service';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';
import { RepartidoresService } from 'src/app/services/repartidores.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { ProductosService } from 'src/app/services/productos.service';

const base_url = environment.base_url;

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
  public showModalProductosPendientes: boolean = false;
  public showModalNuevoProducto = false;

  // Repartidores
  public repartidores: any[] = [];
  public repartidor = '';

  public repartidorLogin;

  // Pedidos
  public pedidos: any[] = null;
  public pedidosPendientes: any[] = [];
  public pedidoSeleccionado: any = null;
  public productos: any[] = [];
  public montoRecibido = 0;
  public estadoPago = 'Total'; // Total - Deuda
  public montoDeuda = null;
  public totalCompletar = 0;
  public totalDeuda = 0;
  public totalIngresos = 0;
  public totalMonto = 0;
  public productoSeleccionado: any = null;
  public nuevaCantidad: number = null;

  // Productos
  public productosPendientes:any[] = [];

  // Nuevo producto
  public nuevoProductoSeleccionado: any;
  public nuevoProductoCantidad: any = null;
  public listaProductos: any[] = [];

	// Paginacion
  public totalItems: number;
  public desde: number = 0;
	public paginaActual: number = 1;
	public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    estado: 'Pendiente',
    parametro: '',
    parametroProductos: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(private ventasMayoristasService: VentasMayoristasService,
              public authService: AuthService,
              private productosService: ProductosService,
              private ventasMayoristasProductosService: VentasMayoristasProductosService,
              private repartidoresService: RepartidoresService,
              private dataService: DataService,
              private alertService: AlertService) { }

  ngOnInit(): void {
    this.repartidorLogin = this.authService.usuario.role === 'DELIVERY_ROLE' ? this.authService.usuario.userId : '';
    this.dataService.ubicacionActual = 'Dashboard - Pedidos';
    this.cargaInicial();
  }

  // Carga inicial de valores
  cargaInicial(): void {
    this.alertService.loading();
    this.repartidoresService.listarRepartidores().subscribe({
      next: ({ repartidores }) => {
        this.repartidores = repartidores;
        this.ventasMayoristasService.listarVentas(
          this.ordenar.direccion,
          this.ordenar.columna,
          this.desde,
          this.cantidadItems,
          this.filtro.estado,
          this.filtro.parametro,
          this.repartidorLogin
        ).subscribe({
          next: ({ventas, totalItems, totalDeuda, totalIngresos, totalMonto}) => {
            this.pedidos = ventas;
            this.totalMonto = totalMonto;
            this.totalDeuda = totalDeuda;
            this.totalItems = totalItems;
            this.totalIngresos = totalIngresos;
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
      this.ventasMayoristasService.listarVentas(
        this.ordenar.direccion,
        this.ordenar.columna,
        this.desde,
        this.cantidadItems,
        this.filtro.estado,
        this.filtro.parametro,
        this.repartidorLogin
        ).subscribe({
        next: ({ventas, totalItems, totalDeuda, totalIngresos, totalMonto}) => {
          this.pedidos = ventas;
          this.totalItems = totalItems;
          this.totalDeuda = totalDeuda;
          this.totalMonto = totalMonto;
          this.totalIngresos = totalIngresos;
          this.productoSeleccionado = null;
          this.pedidosPendientes = ventas.filter( pedido => pedido.activo );
          this.productosParaElaboracion();
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
        window.scrollTo(0,0);
        this.productoSeleccionado = null;
        this.nuevaCantidad = null;
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
  enviarPedido(pedido: any): void {

    this.pedidoSeleccionado = pedido;

    this.alertService.question({ msg: '¿Quieres enviar el pedido?', buttonText: 'Enviar' })
      .then(({isConfirmed}) => {
        if (isConfirmed) {
          this.alertService.loading();

          const data = { estado: 'Enviado' };

          this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, data).subscribe({
            next: () => {
              this.repartidor = '';
              this.pedidoSeleccionado = null;
              this.listarPedidos();
            },
            error: ({error}) => this.alertService.errorApi(error.message)
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
        });

        this.showModalEnvio = false;
        this.showModalCompletar = false;
        this.showModalCompletarDeuda = false;
        this.alertService.close();

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

  // Imprimir detalles
  imprimirDetalles(pedido: any): void {
    this.alertService.loading();
    this.ventasMayoristasService.generarDetallesPDF(pedido._id).subscribe({
      next: () => {
        this.alertService.close();
        window.open(`${base_url}/pdf/detalles_pedido.pdf`,'_blank');
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Cambiar etapa
  cambiarEtapa(): void {
    // this.etapa = this.etapa === 'productos' ? 'pedidos' : 'productos';
    this.showModalProductosPendientes = true;
  }

  // Generar PDF
  generarPDF(): void {
    this.alertService.loading();
    this.ventasMayoristasProductosService.generarPDF().subscribe({
      next: () => {
        this.alertService.close();
        window.open(`${base_url}/pdf/productos_pendientes.pdf`,'_blank');
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Seleccionar nuevo producto
  seleccionarNuevoProducto(producto: any): void {
    this.nuevoProductoSeleccionado = producto;
    this.nuevoProductoCantidad = producto.cantidad;
  }

  // Seleccionar producto
  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
    this.nuevaCantidad = producto.cantidad;
  }

  // Filtrar por Parametro
  filtrarParametro(parametro: string): void{
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Eliminar producto
  eliminarProducto(): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar', cancelarText: 'Regresar' })
    .then(({isConfirmed}) => {
      if (isConfirmed) {
        this.alertService.loading();

        // Se elimina el producto
        this.ventasMayoristasProductosService.eliminarProducto(this.productoSeleccionado._id).subscribe({
          next: ({producto}) => {
            const nuevoPrecioPedido = this.pedidoSeleccionado.precio_total - this.productoSeleccionado.precio;
            this.productos = this.productos.filter( elemento => elemento._id !== producto._id );

            // Se actualiza el pedido
            this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id,{
              precio_total: nuevoPrecioPedido,
              activo: true
            }).subscribe({
              next: () => {
                this.pedidoSeleccionado.precio_total = nuevoPrecioPedido;
                this.listarPedidos();
              }, error: ({error}) => {
                this.alertService.errorApi(error.message);
              }
            })

          },error: ({error}) => this.alertService.errorApi(error.message)
        })
      }
    });
  }

  // Actualizar producto
  actualizarProducto(): void {

    if(!this.nuevaCantidad || this.nuevaCantidad < 0){
      this.alertService.info('Debe colocar una cantidad valida');
      return;
    }

    this.alertService.question({ msg: 'Actualizar producto', buttonText: 'Actualizar', cancelarText: 'Regresar' })
    .then(({isConfirmed}) => {
      if (isConfirmed) {

        this.alertService.loading();

        const nuevoPrecio = this.nuevaCantidad * this.productoSeleccionado.precio_unitario;

        // Se actualizar el producto
        this.ventasMayoristasProductosService.actualizarProducto(this.productoSeleccionado._id, {
          precio: nuevoPrecio,
          cantidad: this.nuevaCantidad
        }).subscribe({
          next: () => {

            const nuevoPrecioPedido = this.pedidoSeleccionado.precio_total - this.productoSeleccionado.precio + nuevoPrecio;

            // Se actualizar el pedido
            this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id,{
              precio_total: nuevoPrecioPedido,
              activo: true
            }).subscribe({

              next: () => {

                this.pedidoSeleccionado.precio_total = nuevoPrecioPedido;

                // Se actualizar el producto en la interfaz
                this.productos.map( elemento => {
                  if(elemento._id === this.productoSeleccionado._id){
                    elemento.precio = nuevoPrecio,
                    elemento.cantidad = this.nuevaCantidad
                  }
                })

                this.listarPedidos();

              }, error: ({error}) => this.alertService.errorApi(error.message)
            })

          }, error: ({error}) => this.alertService.errorApi(error.message)
        })

      }
    });
  }

 // Listado de productos
  listarProductosNuevos(): void {
    this.productosService.listarProductos().subscribe({
      next: ({productos}) => {
        this.productos = productos.filter( producto => producto.precio_mayorista );
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Abrir modal nuevo producto
  abrirModalNuevoProducto(): void {
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({productos}) => {
        this.listaProductos = productos.filter( producto => producto.precio_mayorista );
        this.nuevoProductoSeleccionado = null;
        this.nuevoProductoCantidad = null;
        this.showModal = false;
        this.filtro.parametroProductos = '';
        this.showModalNuevoProducto = true;
        this.alertService.close();
      },
      error: ({error}) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Agregar producto
  agregarProducto(): void {

    if(!this.nuevoProductoCantidad || this.nuevoProductoCantidad < 0){
      this.alertService.info("Debe colocar una cantidad válida");
      return;
    }

    let repetido = false;

    // Verificacion: Producto repetido
    this.productos.find( elemento => {
      if(elemento.producto._id === this.nuevoProductoSeleccionado._id){
        repetido = true;
      }
    });

    // Producto repetido
    if(repetido){
      this.alertService.info('El producto ya se encuentra cargado');
      return;
    }

    // Se agrega si el producto no esta cargado en el carrito
    if(!repetido){

      this.alertService.loading();

      const dataProducto = {
        ventas_mayorista: this.pedidoSeleccionado._id,
        producto: this.nuevoProductoSeleccionado,
        descripcion: this.nuevoProductoSeleccionado.descripcion,
        precio_unitario: this.nuevoProductoSeleccionado.precio_mayorista,
        repartido: this.pedidoSeleccionado.repartidor,
        precio: this.nuevoProductoSeleccionado.precio_mayorista * this.nuevoProductoCantidad,
        unidad_medida: this.nuevoProductoSeleccionado.unidad_medida._id,
        entregado: true,
        unidad_medida_descripcion: this.nuevoProductoSeleccionado.unidad_medida.descripcion,
        cantidad: this.nuevoProductoCantidad,
        precio_total: this.dataService.redondear(this.nuevoProductoSeleccionado.precio_mayorista * this.nuevoProductoCantidad, 2),
        creatorUser: this.pedidoSeleccionado.mayorista,
        updatorUser: this.pedidoSeleccionado.mayorista
      }
  
      // Agregando producto
      this.ventasMayoristasProductosService.nuevoProducto(dataProducto).subscribe({
        next: ({producto}) => {

          this.productos.unshift(producto);

          // Calculo de precio
          let precioTMP = 0;
          this.productos.map( elemento => {
            precioTMP += elemento.precio;
          })

          this.pedidoSeleccionado.precio_total = precioTMP;

          // Se actualizar el pedido
          this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id,{
            precio_total: this.pedidoSeleccionado.precio_total,
            activo: true
          }).subscribe({
            next: () => {
              this.showModalNuevoProducto = false;
              this.showModal = true;
              this.listarPedidos();
            }, error: ({error}) => this.alertService.errorApi(error.message)
          })
        }, error: ({error}) => this.alertService.errorApi(error.message)
      })
      
    } 

    this.filtro.parametro = '';

  }

  // Cerrar seleccion de nuevo producto
  cerrarSeleccionNuevoProducto(): void {
    this.showModalNuevoProducto = false;
    this.showModal = true;
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

