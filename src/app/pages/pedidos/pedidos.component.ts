import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { DataService } from 'src/app/services/data.service';
import { VentasMayoristasService } from '../../services/ventas-mayoristas.service';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { ProductosService } from 'src/app/services/productos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import { CuentasCorrientesMayoristasService } from 'src/app/services/cuentas-corrientes-mayoristas.service';
import { format } from 'date-fns';

const base_url = environment.base_url;

@Component({
  selector: 'app-pedidos',
  templateUrl: './pedidos.component.html',
  styles: [
  ]
})
export class PedidosComponent implements OnInit {

  // Flags
  public flagCierreCompletar = false;
  public flagEnvioMasivo = false;

  // Etapa
  public etapa = 'pedidos';
  public seccion = 'detalles';

  // Modal
  public showModal: boolean = false;
  public showModalListadoPreparacion: boolean = false;
  public showModalEnvio: boolean = false;
  public showModalCompletar: boolean = false;
  public showModalCompletarDeuda: boolean = false;
  public showModalProductosPendientes: boolean = false;
  public showModalNuevoProducto = false;
  public showModalEnvioMasivo = false;

  // Repartidores
  public repartidores: any[] = [];
  public repartidor = '';
  public repartidorLogin;
  public repartidoresLista: any[] = [];
  public repartidorSeleccionado: string = '';

  // Mayoristas
  public mayoristas: any[] = [];

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
  public productosPendientes: any[] = [];

  // Nuevo producto
  public nuevoProductoSeleccionado: any;
  public nuevoProductoCantidad: any = null;
  public listaProductos: any[] = [];

  // Cuenta corriente de mayorista
  public cuenta_corriente: any;
  public montoCuentaCorriente: number = 0;

  // Input
  public fechaActualizar: string = format(new Date(),'yyyy-MM-dd');

  // Envio masivo
  public envioMasivoRepartidor = 'todos';

  // Paginacion
  public totalItems: number;
  public desde: number = 0;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    estado: 'Pendiente',
    parametro: '',
    parametroProductos: '',
    mayorista: '',
    repartidor: '',
    fechaDesde: '',
    fechaHasta: '',
    activo: ''
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'fecha_pedido'
  }

  constructor(private ventasMayoristasService: VentasMayoristasService,
    public authService: AuthService,
    public mayoristasService: MayoristasService,
    public usuariosService: UsuariosService,
    private productosService: ProductosService,
    private ventasMayoristasProductosService: VentasMayoristasProductosService,
    private cuentasCorrientesMayoristas: CuentasCorrientesMayoristasService,
    private dataService: DataService,
    private alertService: AlertService) { }

  ngOnInit(): void {
    this.repartidorLogin = this.authService.usuario.role === 'DELIVERY_ROLE' ? this.authService.usuario.userId : '';
    this.dataService.ubicacionActual = 'Dashboard - Pedidos';
    this.filtro.activo = this.authService.usuario.role === 'DELIVERY_ROLE' ? '' : 'true';
    this.cargaInicial();
  }

  // Carga inicial de valores
  cargaInicial(): void {
    this.alertService.loading();

    // Listado de repartidores
    this.usuariosService.listarUsuarios().subscribe({
      next: ({ usuarios }) => {
        
        this.repartidores = usuarios.filter(usuario => usuario.role === 'DELIVERY_ROLE');

        // Listado de mayoristas
        this.mayoristasService.listarMayoristas().subscribe({
          next: ({ mayoristas }) => {
            
            this.mayoristas = mayoristas;

            // Listado de pedidos
            this.ventasMayoristasService.listarVentas(
              this.ordenar.direccion,
              this.ordenar.columna,
              this.desde,
              this.cantidadItems,
              this.filtro.estado,
              this.filtro.parametro,
              this.authService.usuario.role === 'DELIVERY_ROLE' ? this.repartidorLogin : this.filtro.repartidor,
              this.filtro.mayorista,
              this.filtro.fechaDesde,
              this.filtro.fechaHasta,
              this.filtro.activo
            ).subscribe({
              next: ({ ventas, totalItems, totalDeuda, totalIngresos, totalMonto }) => {
                this.pedidos = ventas;
                this.totalMonto = totalMonto;
                this.totalDeuda = totalDeuda;
                this.totalItems = totalItems;
                this.totalIngresos = totalIngresos;
                this.pedidosPendientes = ventas.filter(pedido => pedido.activo);
                this.productosParaElaboracion();
                this.showModalEnvio = false;
                this.alertService.close();
              },
              error: ({ error }) => {
                this.alertService.errorApi(error.message);
              }
            });

          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
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
      this.authService.usuario.role === 'DELIVERY_ROLE' ? this.repartidorLogin : this.filtro.repartidor,
      this.filtro.mayorista,
      this.filtro.fechaDesde,
      this.filtro.fechaHasta,
      this.filtro.activo
    ).subscribe({
      next: ({ ventas, totalItems, totalDeuda, totalIngresos, totalMonto }) => {
        this.pedidos = ventas;
        this.totalItems = totalItems;
        this.totalDeuda = totalDeuda;
        this.totalMonto = totalMonto;
        this.totalIngresos = totalIngresos;
        this.productoSeleccionado = null;
        this.pedidosPendientes = ventas.filter(pedido => pedido.activo);
        
        
        // Cierre completar pedido
        if(this.flagCierreCompletar){
          this.flagCierreCompletar = false;
          this.showModalCompletar = false;
        }
        
        // Cierre envio masivo
        if(this.flagEnvioMasivo){
          this.flagEnvioMasivo = false;
          this.showModalEnvioMasivo = false;
        }

        
        this.productosParaElaboracion();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Seleccionar pedido
  seleccionarPedido(pedido: any): void {
    this.alertService.loading();
    this.seccion = 'detalles';
    this.pedidoSeleccionado = pedido;
    this.ventasMayoristasProductosService.listarProductos(
      1,
      'descripcion',
      this.pedidoSeleccionado._id
    ).subscribe({
      next: ({ productos }) => {
        window.scrollTo(0, 0);
        this.productoSeleccionado = null;
        this.nuevaCantidad = null;
        this.productos = productos;
        this.showModal = true;
        this.alertService.close();
      },
      error: ({ error }) => {
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
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();

          const data = { estado: 'Enviado' };

          this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, data).subscribe({
            next: () => {
              this.repartidor = '';
              this.pedidoSeleccionado = null;
              this.listarPedidos();
            },
            error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });

  }

  // Productos para elaboracion
  productosParaElaboracion(): void {
    this.ventasMayoristasProductosService.listarProductos(1, 'descripcion', '', 'true').subscribe({
      next: ({ productos }) => {

        let productoTMP = productos;

        this.productosPendientes = [];

        const agregados = [];

        productoTMP.map(producto => {
          if (!agregados.includes(producto.producto._id)) {
            agregados.push(producto.producto._id);
            this.productosPendientes.push(producto);
          } else {
            this.productosPendientes.map(elemento => {
              if (elemento.producto._id === producto.producto._id) {
                elemento.cantidad += producto.cantidad;
              }
            })
          }
        });

        this.showModalEnvio = false;
        // this.showModalCompletar = false;
        this.showModalCompletarDeuda = false;
        this.alertService.close();

      },

      error: ({ error }) => this.alertService.errorApi(error.message)

    })
  }

  // Cancelar pedido
  cancelarPedido(pedido: any): void {
    this.alertService.question({ msg: 'Cancelando pedido', buttonText: 'Cancelar pedido', cancelarText: 'Regresar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ventasMayoristasService.actualizarVenta(pedido._id, { estado: 'Cancelado' }).subscribe({
            next: () => {
              this.listarPedidos();
            },
            error: ({ error }) => {
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
      next: ({ productos }) => {
        this.productos = productos;
        this.showModalCompletar = true;
        this.calculoMonto();
        this.alertService.close();
      },
      error: ({ error }) => {
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
      .then(({ isConfirmed }) => {
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

    this.fechaActualizar = pedido.fecha_pedido ? format(new Date(pedido.fecha_pedido), 'yyyy-MM-dd') :  format(new Date(pedido.createdAt), 'yyyy-MM-dd');

    this.seccion = 'completar';
    this.montoDeuda = 0;
    this.estadoPago = 'Total';
    this.pedidoSeleccionado = pedido;
    this.alertService.loading();
    
    // Cuenta corriente de mayorista
    this.cuentasCorrientesMayoristas.getCuentaCorrientePorMayorista(pedido.mayorista._id).subscribe({
      next: ({ cuenta_corriente }) => {
        this.cuenta_corriente = cuenta_corriente;
        this.montoCuentaCorriente = cuenta_corriente.saldo;
        this.montoRecibido = pedido.precio_total - cuenta_corriente.saldo;
        this.listarProductos();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
    
    
  }

  // Producto no entregado
  productoNoEntregado(producto): void {

    this.alertService.loading();

    const data = { entregado: producto.entregado ? false : true }

    this.ventasMayoristasProductosService.actualizarProducto(producto._id, data).subscribe({
      next: () => {
        this.listarProductos();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Calculo de monto
  calculoMonto(): void {
   
    let montoTMP = 0;
   
    this.productos.map(producto => {
      if (producto.entregado) montoTMP += producto.precio;
    });

    if(this.cuenta_corriente.saldo > 0){
      montoTMP -= this.cuenta_corriente.saldo;
    }

    if(this.cuenta_corriente.saldo >= this.pedidoSeleccionado.precio_total){
      montoTMP = 0;
    }
    
    this.montoRecibido = this.dataService.redondear(montoTMP, 2);
  }

  // Completar pedido
  completarPedido(): void {

    // Verificaciones: Fecha de pedido valida
    if (!this.fechaActualizar) {
      this.alertService.info('Debe colocar una fecha de pedido válida');
      return;
    }

    // Verificaciones: Monto recibido invalido
    if (this.montoRecibido === null || this.montoRecibido < 0) {
      this.alertService.info('Debe colocar un monto cobrado válido');
      return;
    }

    // Verificacion: Monto de cuenta corriente invalido
    if (this.cuenta_corriente.saldo > 0 && (this.montoCuentaCorriente < 0 || this.montoCuentaCorriente === null) ) {
      this.alertService.info('Monto de cuenta corriente inválido');
      return;
    }

    // Verificacion: Se supera saldo de cuenta corriente
    if (this.cuenta_corriente.saldo > 0 && (this.montoCuentaCorriente > this.cuenta_corriente.saldo)) {
      this.alertService.info('Se superó el saldo de cuenta corriente');
      return;
    }

    let montoCC = 0;

    // Adaptando monto cuenta corriente

    if(this.cuenta_corriente.saldo > 0) montoCC = this.cuenta_corriente.saldo;
    else montoCC = 0;
    
    if(this.cuenta_corriente.saldo > this.pedidoSeleccionado.precio_total) montoCC = this.pedidoSeleccionado.precio_total;
    
    this.alertService.question({ msg: 'Completando pedido', buttonText: 'Completar', cancelarText: 'Regresar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          const data = {
            fecha_pedido: this.fechaActualizar,
            estado: this.montoDeuda > 0 ? 'Deuda' : 'Completado',
            monto_cuenta_corriente: montoCC,
            monto_anticipo: this.montoDeuda >= 0 ? 0 : (this.montoDeuda * -1),
            monto_recibido: this.montoRecibido,
            deuda: this.montoDeuda > 0 ? true : false,
            deuda_monto: this.montoDeuda < 0 ? 0 : this.montoDeuda,
            usuario: this.authService.usuario.userId,
          }

          this.alertService.loading();

          this.ventasMayoristasService.completarVenta(this.pedidoSeleccionado._id, data).subscribe({
            next: () => {
              this.estadoPago = 'Total';
              this.montoRecibido = null;
              this.montoCuentaCorriente = 0;
              this.montoDeuda = null;
              this.flagCierreCompletar = true;
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
        window.open(`${base_url}/pdf/detalles_pedido.pdf`, '_blank');
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
        window.open(`${base_url}/pdf/productos_pendientes.pdf`, '_blank');
      }, error: ({ error }) => this.alertService.errorApi(error.message)
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
  filtrarParametro(parametro: string): void {
    this.paginaActual = 1;
    this.filtro.parametro = parametro;
  }

  // Eliminar producto
  eliminarProducto(): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar', cancelarText: 'Regresar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();

          // Se elimina el producto
          this.ventasMayoristasProductosService.eliminarProducto(this.productoSeleccionado._id).subscribe({
            next: ({ producto }) => {
              const nuevoPrecioPedido = this.pedidoSeleccionado.precio_total - this.productoSeleccionado.precio;
              this.productos = this.productos.filter(elemento => elemento._id !== producto._id);

              // Se actualiza el pedido
              this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, {
                precio_total: nuevoPrecioPedido,
                activo: true
              }).subscribe({
                next: () => {
                  this.pedidoSeleccionado.precio_total = nuevoPrecioPedido;

                  if(this.pedidoSeleccionado?.estado !== 'Pendiente'){
                    this.calculoMonto();
                    this.calcularDeuda();
                  }

                  this.listarPedidos();
                }, error: ({ error }) => {
                  this.alertService.errorApi(error.message);
                }
              })

            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Actualizar producto
  actualizarProducto(): void {

    if (!this.nuevaCantidad || this.nuevaCantidad < 0) {
      this.alertService.info('Debe colocar una cantidad valida');
      return;
    }

    this.alertService.question({ msg: 'Actualizar producto', buttonText: 'Actualizar', cancelarText: 'Regresar' })
      .then(({ isConfirmed }) => {
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
              this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, {
                precio_total: nuevoPrecioPedido,
                activo: true
              }).subscribe({

                next: () => {

                  this.pedidoSeleccionado.precio_total = nuevoPrecioPedido;

                  // Se actualizar el producto en la interfaz
                  this.productos.map(elemento => {
                    if (elemento._id === this.productoSeleccionado._id) {
                      elemento.precio = nuevoPrecio,
                        elemento.cantidad = this.nuevaCantidad
                    }
                  })

                  if(this.pedidoSeleccionado?.estado !== 'Pendiente'){
                    this.calculoMonto();
                    this.calcularDeuda();
                  }

                  this.listarPedidos();

                }, error: ({ error }) => this.alertService.errorApi(error.message)
              })

            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })

        }
      });
  }

  // Listado de productos
  listarProductosNuevos(): void {
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.productos = productos.filter(producto => producto.precio_mayorista);
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Abrir modal nuevoC producto
  abrirModalNuevoProducto(): void {
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.listaProductos = productos.filter(producto => producto.precio_mayorista);
        this.nuevoProductoSeleccionado = null;
        this.nuevoProductoCantidad = null;
        this.showModal = false;
        this.showModalCompletar = false;
        this.filtro.parametroProductos = '';
        this.showModalNuevoProducto = true;
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Agregar producto
  agregarProducto(): void {

    if (!this.nuevoProductoCantidad || this.nuevoProductoCantidad < 0) {
      this.alertService.info("Debe colocar una cantidad válida");
      return;
    }

    let repetido = false;

    // Verificacion: Producto repetido
    this.productos.find(elemento => {
      if (elemento.producto._id === this.nuevoProductoSeleccionado._id) {
        repetido = true;
      }
    });

    // Producto repetido
    if (repetido) {
      this.alertService.info('El producto ya se encuentra cargado');
      return;
    }

    // Se agrega si el producto no esta cargado en el carrito
    if (!repetido) {

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
        next: ({ producto }) => {

          this.productos.unshift(producto);

          // Calculo de precio
          let precioTMP = 0;
          this.productos.map(elemento => {
            precioTMP += elemento.precio;
          })

          this.pedidoSeleccionado.precio_total = precioTMP;

          if(this.pedidoSeleccionado?.estado !== 'Pendiente'){
            this.calculoMonto();
            this.calcularDeuda();
          }

          // Se actualizar el pedido
          this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, {
            precio_total: this.pedidoSeleccionado.precio_total,
            activo: true
          }).subscribe({
            next: () => {
              if(this.seccion === 'detalles'){
                this.showModalNuevoProducto = false;
                this.showModal = true;
              }else if(this.seccion === 'completar'){
                this.showModalNuevoProducto = false;
                this.showModalCompletar = true; 
              }
              this.listarPedidos();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })

    }

    this.filtro.parametro = '';

  }

  // Cerrar seleccion de nuevo producto
  cerrarSeleccionNuevoProducto(): void {
    if(this.seccion === 'detalles'){
      this.showModalNuevoProducto = false;
      this.showModal = true;
    }else if(this.seccion === 'completar'){
      this.showModalNuevoProducto = false;
      this.showModalCompletar = true;
    }
  }

  // Generar listado de preparacion
  generarListadoPreparacion(): void {

    this.alertService.loading();

    if (this.repartidorSeleccionado === '') {
      this.ventasMayoristasProductosService.generarPreparacionPedidosPDF().subscribe({
        next: () => {
          window.open(`${base_url}/pdf/productos_preparacion_pedidos.pdf`, '_blank');
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    } else {
      this.ventasMayoristasProductosService.generarPreparacionPedidosPorRepartidorPDF(this.repartidorSeleccionado).subscribe({
        next: () => {
          window.open(`${base_url}/pdf/productos_preparacion_pedidos_por_repartidor.pdf`, '_blank');
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    }

  }

  // Abrir preparacion pedidos
  abrirPreparacionPedidos(): void {
    this.alertService.loading();
    this.repartidorSeleccionado = '';
    this.usuariosService.listarUsuarios().subscribe({
      next: ({ usuarios }) => {
        this.repartidoresLista = usuarios.filter(usuario => usuario.role === 'DELIVERY_ROLE');
        this.showModalListadoPreparacion = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Calcular monto deuda
  calcularDeuda(): void {

    if(this.cuenta_corriente.saldo <= 0){
      this.montoDeuda = this.pedidoSeleccionado.precio_total - this.montoRecibido;
    }

    if(this.cuenta_corriente.saldo > 0 && (this.cuenta_corriente.saldo < this.pedidoSeleccionado.precio_total)){
      this.montoDeuda = this.pedidoSeleccionado.precio_total - (this.montoRecibido + this.montoCuentaCorriente);
    }

  }

  // Generar listado de deudas PDF
  generarListadoDeudas(): void {
    this.alertService.loading();
    this.ventasMayoristasService.detallesDeudasPDF().subscribe({
      next: () => {
        window.open(`${base_url}/pdf/deudas_mayoristas.pdf`, '_blank');
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar fecha
  actualizarFecha(): void {
    this.alertService.loading();
    this.ventasMayoristasService.actualizarVenta(this.pedidoSeleccionado._id, { fecha_pedido: this.fechaActualizar }).subscribe({
      next: () => {
        this.listarPedidos();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });
  }

  // Abrir envios masivos
  abrirEnviosMasivos(): void {
    this.showModalEnvioMasivo = true;
    this.envioMasivoRepartidor = 'todos';
  }

  // EnvioMasivo
  envioMasivo(): void {
    this.alertService.question({ msg: '¿Quieres realizar un envio masivo?', buttonText: 'Enviar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ventasMayoristasService.envioMasivo(this.envioMasivoRepartidor).subscribe({
            next: () => {
              this.flagEnvioMasivo = true;
              this.listarPedidos();
            }, error: ({error}) => this.alertService.errorApi(error.message)
          })
        }
      });    
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
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

