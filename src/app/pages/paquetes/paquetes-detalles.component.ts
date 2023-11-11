import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { PaquetesService } from 'src/app/services/paquetes.service';
import { VentasMayoristasService } from 'src/app/services/ventas-mayoristas.service';
import gsap from 'gsap';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';
import { ProductosService } from 'src/app/services/productos.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import { format } from 'date-fns';
import { MayoristasGastosService } from 'src/app/services/mayoristas-gastos.service';
import { MayoristasIngresosService } from 'src/app/services/mayoristas-ingresos.service';
import { MayoristasTiposGastosService } from 'src/app/services/mayoristas-tipos-gastos.service';
import { MayoristasTiposIngresosService } from 'src/app/services/mayoristas-tipos-ingresos.service';
import { CobrosMayoristasService } from 'src/app/services/cobros-mayoristas.service';
import { CobrosPedidosService } from 'src/app/services/cobros-pedidos.service';
import { environment } from 'src/environments/environment';
import { UsuariosService } from 'src/app/services/usuarios.service';

const base_url = environment.base_url;

@Component({
  selector: 'app-paquetes-detalles',
  templateUrl: './paquetes-detalles.component.html',
  styles: [
  ]
})
export class PaquetesDetallesComponent implements OnInit {

  // Generales
  public urlRegreso: string = '';

  // Flag
  public inicio: boolean = true;
  public mostrarGastos: boolean = false;
  public mostrarIngresos: boolean = false;
  public mostrarCobros: boolean = false;
  public mostrarCobrosExternos: boolean = false;

  // Repartidores
  public repartidores: any[] = [];
  public repartidor: string = '';
  
  // Fecha de paquete
  public fecha = format(new Date(), 'yyyy-MM-dd');
  
  // Modal
  public showModalNuevoProducto: boolean = false;
  public showModalNuevoPedido: boolean = false;
  public showModalProductos: boolean = false;
  public showModalEnviar: boolean = false;
  public showModalNuevoGasto: boolean = false;
  public showModalNuevoIngreso: boolean = false;
  public showModalNuevoCobro: boolean = false;
  public showModalDetallesCobro: boolean = false;
  public showModalActualizarRepartidor: boolean = false;

  // Gastos
  public gastos: any[] = [];
  public tipos_gastos: any[] = [];
  public tipo_gasto: string = "";
  public monto_gasto: number = null;

  // Ingresos
  public ingresos: any[] = [];
  public tipos_ingresos: any[] = [];
  public tipo_ingreso: string = "";
  public monto_ingreso: number = null;

  // Cobros
  public cobros: any[] = [];
  public cobroSeleccionado: any;
  public cobros_pedidos: any[] = [];
  public cobros_externos: any[] = [];

  // Nuevo producto
  public nuevoProductoSeleccionado: any;
  public nuevoProductoCantidad: any = null;
  public listaProductos: any[] = [];

  // Paquete
  public idPaquete: string;
  public paquete: any;
  public pedidos: any;
  public pedidoSeleccionado: any;

  // Mayoristas
  public mayoristas: any[] = [];
  public mayorista: string = '';

  // Carrito
  public precioCarrito: number;
  public carrito: any[] = [];

  // Productos
  public productos: any[] = [];
  public productoSeleccionado: any;
  public cantidad: number = null;

  // Totales de cierre
  public total_deuda: number = 0;
  public total_anticipo: number = 0;
  public total_parcial: number = 0;
  public total_recibir: number = 0;
  public total_gastos: number = 0;
  public total_ingresos: number = 0;
  public total_cuenta_corriente: number = 0;
  public total_cobros: number = 0;

  // Cobros
  public montoRecibidoFijo: number = 0;
  public deudaTotalFijo: number = 0;
  public montoCobroTotal: number = 0;
  public montoCobro: number = null;
  public deudas: any[] = [];
  public mayoristaCobro: string = '';
  public mayoristaCobroSeleccionado: any;
  public deudaTotal: number = 0;
  public pedidosCancelados: number = 0;

  // Filtrado
  public filtro = {
    activo: 'true',
    parametro: '',
  }

  // Filtrado de pedidos
  public filtroPedido = {
    mayorista: '',
    parametro: '',
    estado: ''
  }

  constructor(
    public authService: AuthService,
    private usuarioService: UsuariosService,
    private mayoristasService: MayoristasService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private dataService: DataService,
    private paquetesService: PaquetesService,
    private pedidosService: VentasMayoristasService,
    private ventasMayoristasProductosService: VentasMayoristasProductosService,
    private cobrosMayoristasService: CobrosMayoristasService,
    private cobrosPedidosService: CobrosPedidosService,
    private productosService: ProductosService,
    private mayoristasGastosService: MayoristasGastosService,
    private mayoristasIngresosService: MayoristasIngresosService,
    private mayoristasTiposGastosService: MayoristasTiposGastosService,
    private mayoristasTiposIngresosService: MayoristasTiposIngresosService
  ) { }


  // Inicio del componente
  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = "Dashboard - Detalles de paquete";
    this.activatedRoute.params.subscribe({
      next: ({ id, origen }) => {
        this.idPaquete = id;
        this.alertService.loading();
        this.direccionRegreso(origen);
        this.getPaquete();
      }
    })
  }

  // Direccion de regreso
  direccionRegreso(origen: string): void {
    if (origen === 'listado-paquetes') {
      this.urlRegreso = '/dashboard/paquetes';
    } else if (origen === 'reportes-pedidos') {
      this.urlRegreso = '/dashboard/pedidos-reportes';
    } else if (origen === 'reportes-paquetes') {
      this.urlRegreso = '/dashboard/paquetes-reportes';
    } else if (origen === 'listado-ingresos') {
      this.urlRegreso = '/dashboard/pedidos-ingresos';
    } else if (origen === 'listado-gastos') {
      this.urlRegreso = '/dashboard/pedidos-gastos';
    }
  }

  // Detalles del paquete
  getPaquete(): void {
    this.paquetesService.getPaquete(this.idPaquete).subscribe({
      next: ({ paquete, ingresos, gastos, cobros, cobros_externos }) => {

        this.paquete = paquete;
        this.cobros = cobros;
        this.ingresos = ingresos;
        this.gastos = gastos;
        this.cobros_externos = cobros_externos;
        this.fecha = format(new Date(paquete.fecha_paquete), 'yyyy-MM-dd');
        this.repartidor = paquete.repartidor._id;

        // Listado de pedidos
        this.pedidosService.listarVentas(
          1,
          'mayorista.descripcion',
          0,
          1000,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          String(this.idPaquete)
        ).subscribe({
          next: ({ ventas }) => {

            this.pedidos = ventas;

            if (paquete.estado === 'Enviado') {

              ventas.map(venta => {

                venta.estado = 'Completado';
                venta.deuda_monto = 0;

                if (venta.cuenta_corriente.saldo > 0 && (venta.cuenta_corriente.saldo >= venta.precio_total)) {
                  venta.monto_recibido = 0;
                  venta.monto_cuenta_corriente = venta.precio_total;
                } else if (venta.cuenta_corriente.saldo > 0 && (venta.cuenta_corriente.saldo < venta.precio_total)) {
                  venta.monto_recibido = venta.precio_total - venta.cuenta_corriente.saldo;
                  venta.monto_cuenta_corriente = venta.cuenta_corriente.saldo;
                } else {
                  venta.monto_recibido = venta.precio_total;
                  venta.monto_cuenta_corriente = 0;
                }

              });
            }

            this.showModalNuevoPedido = false;
            this.showModalActualizarRepartidor = false;

            if (this.inicio) {
              this.mayoristasService.listarMayoristas().subscribe({
                next: ({ mayoristas }) => {
                  this.mayoristas = mayoristas.filter(mayorista => mayorista.activo);
                  this.inicio = false;
                  this.calcularTotalesCierre();
                  this.alertService.close();
                }, error: ({ error }) => this.alertService.errorApi(error.message)
              })
            } else {
              this.calcularTotalesCierre();
              this.alertService.close();
            }

          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar cantidad - Producto
  actualizarCantidadProducto(pedido: any, producto: any): void {

    // Verificacion: Cantidad
    if (!producto.cantidad || producto.cantidad <= 0) {
      this.alertService.info('Debe colocar una cantidad válida');
      return;
    }

    // Actualizacion precio de producto
    producto.precio = producto.cantidad * producto.precio_unitario;

    const data = {
      cantidad: producto.cantidad,
      precio: producto.precio
    }

    // Actualizacion de producto en backend
    this.alertService.loading();
    this.ventasMayoristasProductosService.actualizarProducto(producto._id, data).subscribe({
      next: () => {
        this.calcularTotalPedido(pedido);
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Eliminar paquete
  eliminarPaquete(): void {
    this.alertService.question({ msg: 'Eliminando paquete', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.paquetesService.eliminarPaquete(this.idPaquete).subscribe({
            next: () => {
              this.router.navigateByUrl('/dashboard/paquetes');
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        };
      });
  }

  // Eliminar producto
  eliminarProducto(pedido: any, producto: any): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ventasMayoristasProductosService.eliminarProducto(producto._id).subscribe({
            next: () => {
              pedido.productos = pedido.productos.filter(elemento => elemento._id !== producto._id);
              this.calcularTotalPedido(pedido);
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        };
      });
  }


  // Eliminar producto
  eliminarProductoNuevoPedido(producto: any): void {
    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.carrito = this.carrito.filter(elemento => elemento.producto._id !== producto.producto._id)
          this.calculoPrecio();
        };
      });
  }

  // Eliminar pedido
  eliminarPedido(pedido: any): void {
    this.alertService.question({ msg: 'Eliminando pedido', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.pedidosService.eliminarVenta(pedido._id).subscribe({
            next: () => {
              this.pedidos = this.pedidos.filter(elemento => elemento._id !== pedido._id);
              // this.calcularTotalPaquete();
              // this.alertService.close();
              this.getPaquete();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        };
      });
  }

  // Seleccionar nuevo producto
  seleccionarNuevoProducto(producto: any): void {
    this.nuevoProductoSeleccionado = producto;
    this.nuevoProductoCantidad = producto.cantidad;
  }

  // Caluclar totales de pedido
  calcularTotalPedido(pedido: any) {

    let totalTMP = 0;

    pedido.productos.map(producto => {
      totalTMP += producto.precio;
    })

    pedido.precio_total = totalTMP;

    this.calcularTotalPaquete();

    if (pedido.cuenta_corriente.saldo > 0 && (pedido.cuenta_corriente.saldo >= pedido.precio_total)) {
      pedido.monto_recibido = 0;
      pedido.monto_cuenta_corriente = pedido.precio_total;
    } else if (pedido.cuenta_corriente.saldo > 0 && (pedido.cuenta_corriente.saldo < pedido.precio_total)) {
      pedido.monto_recibido = pedido.precio_total - pedido.cuenta_corriente.saldo;
      pedido.monto_cuenta_corriente = pedido.cuenta_corriente.saldo;
    } else {
      pedido.monto_recibido = pedido.precio_total;
      pedido.monto_cuenta_corriente = 0;
    }
    this.calcularDeuda(pedido);

  }

  // Calcular totales de paquete
  calcularTotalPaquete(): void {
    let totalTMP = 0;
    this.pedidos.map(pedido => {
      totalTMP += pedido.precio_total;
    });
    this.paquete.precio_total = totalTMP;
  }

  // Cerrar seleccion de nuevo producto
  cerrarSeleccionNuevoProducto(): void {
    this.showModalNuevoProducto = false;
  }

  agregarNuevoProducto(): void {

    // Verificacion: Cantidad
    if (!this.nuevoProductoCantidad || this.nuevoProductoCantidad < 0) {
      this.alertService.info("Debe colocar una cantidad válida");
      return;
    }

    let repetido = false;

    // Verificacion: Producto repetido
    this.pedidoSeleccionado.productos.find(elemento => {
      if (elemento.producto === this.nuevoProductoSeleccionado._id || elemento.producto._id === this.nuevoProductoSeleccionado._id) {
        repetido = true;
      }
    });

    // Producto repetido
    if (repetido) {
      this.alertService.info('El producto ya se encuentra cargado en este pedido');
      return;
    }

    // Se agrega si el producto no esta cargado en el carrito
    if (!repetido) {

      this.alertService.loading();

      const dataProducto = {
        paquete: this.idPaquete,
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

      // Agregar producto
      this.ventasMayoristasProductosService.nuevoProducto(dataProducto).subscribe({
        next: ({ producto }) => {
          this.nuevoProductoSeleccionado = null;
          this.nuevoProductoCantidad = null;
          this.pedidoSeleccionado.productos.unshift(producto);
          this.ordenarProductos();
          this.calcularTotalPedido(this.pedidoSeleccionado);
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })

    }

    this.filtro.parametro = '';

  }

  // Agregar producto
  agregarProducto(): void {

    if (!this.cantidad || this.cantidad < 0) {
      this.alertService.info("Debe colocar una cantidad válida");
      return;
    }

    let repetido = false;

    // Verificacion: Producto repetido
    this.carrito.find(elemento => {
      if (elemento.producto._id === this.productoSeleccionado._id) {
        repetido = true;
        elemento.cantidad += this.dataService.redondear(this.cantidad, 2);
        elemento.precio += this.dataService.redondear(this.productoSeleccionado.precio_mayorista * this.cantidad, 2);
      }
    });

    // Se agrega si el producto no esta cargado en el carrito
    if (!repetido) this.carrito.unshift(
      {
        producto: this.productoSeleccionado,
        descripcion: this.productoSeleccionado.descripcion,
        precio_unitario: this.productoSeleccionado.precio_mayorista,
        repartido: this.authService.usuario.userId,
        precio: this.productoSeleccionado.precio_mayorista * this.cantidad,
        unidad_medida: this.productoSeleccionado.unidad_medida._id,
        entregado: true,
        unidad_medida_descripcion: this.productoSeleccionado.unidad_medida.descripcion,
        cantidad: this.cantidad,
        precio_total: this.dataService.redondear(this.productoSeleccionado.precio_mayorista * this.cantidad, 2),
        creatorUser: this.mayorista,
        updatorUser: this.mayorista
      }
    );

    this.filtro.parametro = '';
    this.ordenarProductosCarrito();
    this.calculoPrecio();
    this.cerrarSeleccion();

  }

  completarPedido(): void {

    // Verificacion: Mayorista
    if (this.mayorista === '') {
      this.alertService.info('Debe seleccionar un mayorista');
      return;
    }

    // Adaptando productos
    this.carrito.map(producto => {
      producto.paquete = this.idPaquete;
      producto.creatorUser = this.mayorista;
      producto.updatorUser = this.mayorista;
    });

    // Creando pedido
    this.alertService.question({ msg: 'Creando pedido', buttonText: 'Crear' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          const data = {
            pedido: {
              paquete: this.paquete._id,
              mayorista: this.mayorista,
              repartidor: String(this.authService.usuario.userId),
              deuda: false,
              deuda_monto: 0,
              estado: 'Pendiente',
              precio_total: this.precioCarrito,
              creatorUser: this.mayorista,
              updatorUser: this.mayorista
            },
            productos: this.carrito
          };

          this.pedidosService.nuevaVenta(data).subscribe({
            next: () => {
              this.mayorista = '';
              this.carrito = [];
              this.getPaquete();
            },
            error: ({ error }) => {
              this.alertService.errorApi(error.message);
            }
          })

        };
      });

  }

  // Abrir modal nuevo producto
  abrirModalNuevoProducto(pedido: any): void {
    this.pedidoSeleccionado = pedido;
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.listaProductos = productos.filter(producto => producto.precio_mayorista);
        this.nuevoProductoSeleccionado = null;
        this.nuevoProductoCantidad = null;
        this.filtro.parametro = '';
        this.showModalNuevoProducto = true;
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Abrir nuevo pedido
  abrirNuevoPedido(): void {
    this.showModalNuevoPedido = true;
  }

  // Abrir modal productos
  abrirModalProductos(): void {
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.productos = productos.filter(producto => producto.precio_mayorista);
        this.showModalProductos = true;
        this.showModalNuevoPedido = false;
        this.productoSeleccionado = null;
        this.alertService.close();
      },
      error: ({ error }) => {
        this.alertService.errorApi(error.message);
      }
    });
  }

  // Calculo precio
  calculoPrecio(): void {
    let precioTMP = 0;
    this.carrito.map(elemento => {
      precioTMP += elemento.precio;
    })
    this.precioCarrito = precioTMP;
  }

  // Enviar paquete
  enviarPaquete(): void {
    this.alertService.question({ msg: '¿Quieres enviar el paquete?', buttonText: 'Enviar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.paquetesService.enviarPaquete(this.paquete._id, this.fecha).subscribe({
            next: () => {
              this.paquete.estado = 'Enviado';
              this.showModalEnviar = false;
              this.getPaquete();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Actualizar fecha
  actualizarFecha(): void {

    // Verificacion: Fecha
    if (!this.fecha || this.fecha === '') {
      this.alertService.info('Debe colocar una fecha válida');
      return;
    }

    this.alertService.loading();
    this.paquetesService.actualizarPaquete(this.paquete._id, { fecha_paquete: this.fecha }).subscribe({
      next: () => {
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Calcular deuda
  calcularDeuda(pedido: any): void {
    
    if(this.paquete.estado !== 'Pendiente'){
      let diferencia = 0;
  
      diferencia = pedido.monto_recibido - pedido.precio_total + pedido.monto_cuenta_corriente;
  
      if (diferencia > 0) {
        pedido.deuda = false;
        pedido.estado = 'Completado',
          pedido.deuda_monto = 0;
        pedido.monto_anticipo = diferencia;
      } else if (diferencia === 0) {
        pedido.deuda = false;
        pedido.estado = 'Completado',
          pedido.deuda_monto = 0;
        pedido.monto_anticipo = 0;
      } else if (diferencia < 0) {
        pedido.deuda = true;
        pedido.estado = 'Deuda',
          pedido.deuda_monto = Math.abs(diferencia);
        pedido.monto_anticipo = 0;
      }
    }

    this.calcularTotalesCierre();

  }

  // Calculos de cierre de paquete
  calcularTotalesCierre(): void {

    let totalDeudaTMP = 0;
    let totalAnticipoTMP = 0;
    let totalCuentaCorrienteTMP = 0;
    let totalGastosTMP = 0;
    let totalIngresosTMP = 0;
    let totalCobrosTMP = 0;

    this.pedidos.map(pedido => {
      totalDeudaTMP += pedido.deuda_monto;
      totalAnticipoTMP += pedido.monto_anticipo;
      totalCuentaCorrienteTMP += pedido.monto_cuenta_corriente;
    });

    this.total_deuda = totalDeudaTMP;
    this.total_anticipo = totalAnticipoTMP;
    this.total_cuenta_corriente = totalCuentaCorrienteTMP;
    this.total_parcial = this.paquete.precio_total - this.total_deuda + this.total_anticipo - this.total_cuenta_corriente;

    this.gastos.map(gasto => {
      totalGastosTMP += gasto.monto;
    })

    this.ingresos.map(ingreso => {
      totalIngresosTMP += ingreso.monto;
    })

    this.cobros.map(cobro => {
      totalCobrosTMP += cobro.monto_total_recibido;
    })

    this.total_ingresos = totalIngresosTMP;
    this.total_gastos = totalGastosTMP;
    this.total_cobros = totalCobrosTMP;

    this.total_recibir = this.total_parcial - this.total_gastos + this.total_ingresos + this.total_cobros;

  }

  abrirNuevoGasto(): void {
    this.alertService.loading();
    this.mayoristasTiposGastosService.listarTipos().subscribe({
      next: ({ tipos }) => {
        this.tipos_gastos = tipos.filter(tipo => tipo.activo);
        this.tipo_gasto = '';
        this.monto_gasto = null;
        this.showModalNuevoGasto = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  abrirNuevoIngreso(): void {
    this.alertService.loading();
    this.mayoristasTiposIngresosService.listarTipos().subscribe({
      next: ({ tipos }) => {
        this.tipos_ingresos = tipos.filter(tipo => tipo.activo);
        this.tipo_ingreso = '';
        this.monto_ingreso = null;
        this.showModalNuevoIngreso = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  nuevoGasto(): void {

    // Verificacion: Tipo de gastos
    if (!this.tipo_gasto && this.tipo_gasto === '') {
      this.alertService.info('Debe seleccionar un tipo de gasto');
      return;
    }

    // Verificacion: Monto
    if (!this.monto_gasto && this.monto_gasto <= 0) {
      this.alertService.info('Debe colocar un monto válido');
      return;
    }

    this.alertService.loading();

    const data = {
      fecha_gasto: this.fecha,
      paquete: this.paquete._id,
      tipo_gasto: this.tipo_gasto,
      repartidor: this.paquete.repartidor._id,
      monto: this.monto_gasto,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId
    }

    this.mayoristasGastosService.nuevoGasto(data).subscribe({
      next: ({ gasto }) => {
        this.gastos.unshift(gasto);
        this.calcularTotalesCierre();
        this.mostrarGastos = true;
        this.showModalNuevoGasto = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  nuevoIngreso(): void {

    // Verificacion: Tipo de ingreso
    if (!this.tipo_ingreso && this.tipo_ingreso === '') {
      this.alertService.info('Debe seleccionar un tipo de ingreso');
      return;
    }

    // Verificacion: Monto
    if (!this.monto_ingreso && this.monto_ingreso <= 0) {
      this.alertService.info('Debe colocar un monto válido');
      return;
    }

    this.alertService.loading();

    const data = {
      fecha_ingreso: this.fecha,
      paquete: this.paquete._id,
      tipo_ingreso: this.tipo_ingreso,
      repartidor: this.paquete.repartidor._id,
      monto: this.monto_ingreso,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId
    }

    this.mayoristasIngresosService.nuevoIngreso(data).subscribe({
      next: ({ ingreso }) => {
        this.ingresos.unshift(ingreso);
        this.calcularTotalesCierre();
        this.mostrarIngresos = true;
        this.showModalNuevoIngreso = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Eliminar gasto
  eliminarGasto(gasto: any): void {
    this.alertService.question({ msg: 'Eliminando gasto', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.mayoristasGastosService.eliminarGasto(gasto._id).subscribe({
            next: () => {
              this.gastos = this.gastos.filter(elemento => elemento._id !== gasto._id);
              this.calcularTotalesCierre();
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        };
      });
  }

  // Eliminar ingreso
  eliminarIngreso(ingreso: any): void {
    this.alertService.question({ msg: 'Eliminando ingreso', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.mayoristasIngresosService.eliminarIngreso(ingreso._id).subscribe({
            next: () => {
              this.ingresos = this.ingresos.filter(elemento => elemento._id !== ingreso._id);
              this.calcularTotalesCierre();
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        };
      });
  }

  // Completar paquete
  completarPaquete(): void {
   
    this.alertService.question({ msg: 'Completando paquete', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          
          this.alertService.loading();

          // Ajustando datos de pedido
          
          let dataPedido = [];
          
          this.pedidos.map( pedido => {
            dataPedido.push(
              {
                _id: pedido._id,
                deuda: pedido.deuda,
                estado: pedido.estado,
                deuda_monto: pedido.deuda_monto,
                monto_recibido: pedido.monto_recibido,
                monto_anticipo: pedido.monto_anticipo,
                monto_cuenta_corriente: pedido.monto_cuenta_corriente,
                mayorista: pedido.mayorista._id
              }
            )
          });

          // Datos - Cerrar paquete

          const data = {
            dataPaquete: {
              fecha_paquete: this.fecha,
              total_deuda: this.total_deuda,
              total_anticipo: this.total_anticipo,
              total_parcial: this.total_parcial,
              total_gastos: this.total_gastos,
              total_ingresos: this.total_ingresos,
              total_cobros: this.total_cobros,
              total_cuenta_corriente: this.total_cuenta_corriente,
              total_recibir: this.total_recibir,
              estado: this.total_deuda > 0 ? 'Deuda' : 'Completado'
            },
            pedidos: dataPedido
          }

          this.paquetesService.cerrarPaquete(this.idPaquete, data).subscribe({
            next: () => {
              this.alertService.close();
              this.paquete.estado = this.total_deuda > 0 ? 'Deuda' : 'Completado';
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })

        };
      });
  }

  // Buscar deudas de mayorista
  buscarDeudas(): void {

    // Verificacion: mayorista
    if (this.mayoristaCobro === '') {
      this.alertService.info('Debe seleccionar un mayorista');
      return;
    }

    // Verificacion: Monto recibido
    if (!this.montoCobro || this.montoCobro <= 0) {
      this.alertService.info('Debe colocar un monto válido');
      return;
    }

    this.alertService.loading();

    this.pedidosService.listarVentas(
      1,
      'createdAt',
      0,
      1000,
      'Deuda',
      '',
      '',
      this.mayoristaCobro,
      '',
      ''
    ).subscribe({
      next: ({ ventas }) => {

        this.deudaTotal = 0;
        this.deudas = ventas;
        this.montoRecibidoFijo = this.montoCobro;
        this.montoCobroTotal = 0;
        this.deudaTotalFijo = 0;
        this.pedidosCancelados = 0;

        // Cobro automatico de deudas
        this.deudas.map(deuda => {

          this.deudaTotalFijo += deuda.deuda_monto;

          if (this.montoCobro >= deuda.deuda_monto) { // Deuda cobrada totalmente

            this.montoCobroTotal += deuda.deuda_monto;
            this.montoCobro -= deuda.deuda_monto;
            this.pedidosCancelados = this.pedidosCancelados + 1;
            deuda.seleccionado = true;
            deuda.montoCobro = deuda.deuda_monto;
            deuda.cancelado = true;
            deuda.parcial = false;
            deuda.estado = 'Completado';

          } else if ((deuda.deuda_monto > this.montoCobro) && (this.montoCobro > 0)) { // Deuda cobrada parcialmente

            this.montoCobroTotal += this.montoCobro;
            this.deudaTotal = this.deudaTotal + (deuda.deuda_monto - this.montoCobro);
            deuda.seleccionado = true;
            deuda.montoCobro = this.montoCobro;
            deuda.cancelado = false;
            deuda.parcial = true;
            deuda.estado = 'Deuda';
            this.montoCobro = 0;

          } else { // Deuda sin cobrar

            this.deudaTotal += deuda.deuda_monto;
            deuda.seleccionado = false;
            deuda.montoCobro = 0;
            deuda.cancelado = false;
            deuda.parcial = false;
            deuda.estado = 'Deuda';

          }

        })

        this.mayoristaCobroSeleccionado = this.mayoristas.find(mayorista => String(mayorista._id) === String(this.mayoristaCobro));

        // this.calcularDeudaTotal();
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Calcular deuda total
  // calcularDeudaTotal(): void {
  //   let deudaTotalTMP = 0;
  //   this.deudas.map( deuda => {
  //     deudaTotalTMP += deuda.deuda_monto;
  //   });

  //   this.deudaTotalFijo = deudaTotalTMP;
  //   this.deudaTotal = deudaTotalTMP;
  // }

  // Abrir nuevo cobro
  abrirNuevoCobro(mayorista: string = ''): void {
    this.mayoristaCobro = mayorista;
    this.montoCobro = null;
    this.mayoristaCobroSeleccionado = null;
    this.showModalNuevoCobro = true;
  }

  // Regresar a nuevo cobro
  regresarNuevoCobro(): void {
    this.montoCobro = null;
    this.mayoristaCobro = '';
    this.mayoristaCobroSeleccionado = null;
  }

  // Abrir envio de paquete
  abrirEnviarPaquete(): void {
    this.fecha = this.fecha;
    this.showModalEnviar = true;
  }

  // Cerrar modal productos
  cerrarModalProductos(): void {
    this.showModalProductos = false;
    this.showModalNuevoPedido = true;
  }

  // Producto seleccionado
  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
  }

  // Cerrar seleccion de producto
  cerrarSeleccion(): void {
    this.cantidad = null;
    this.productoSeleccionado = null;
  }

  // Seleccionar/Deseleccionar deuda
  seleccionarDeseleccionarDeuda(deuda: any, tipo: string): void {

    if (this.montoCobro === 0 && tipo === 'Cobrar') {
      this.alertService.info('Su saldo de cobro es cero');
      return;
    }

    if (tipo === 'Cobrar') { // Se cobra

      deuda.seleccionado = true;

      if (deuda.deuda_monto <= this.montoCobro) {  // Cobro total
        this.pedidosCancelados += 1;
        deuda.estado = 'Completado';
        deuda.montoCobro = deuda.deuda_monto;
        deuda.cancelado = true;
        deuda.parcial = false;
        this.montoCobroTotal += deuda.deuda_monto;
        this.deudaTotal -= deuda.deuda_monto;
        this.montoCobro -= deuda.deuda_monto;
      } else if (deuda.deuda_monto > this.montoCobro) { // Cobro parcial
        deuda.estado = 'Deuda';
        deuda.montoCobro = this.montoCobro;
        deuda.cancelado = false;
        deuda.parcial = true;
        this.montoCobroTotal += this.montoCobro;
        this.deudaTotal -= this.montoCobro;
        this.montoCobro = 0;
      }

    } else { // No se cobra

      if (deuda.estado === 'Completado') this.pedidosCancelados -= 1;
      deuda.seleccionado = false;
      deuda.estado = 'Deuda';
      this.montoCobroTotal -= deuda.montoCobro;
      this.deudaTotal += deuda.montoCobro;
      this.montoCobro += deuda.montoCobro;
      deuda.montoCobro = 0;
      deuda.completado = false;
      deuda.parcial = false;

    }

  }

  // Completar cobro
  completarCobro(): void {
    this.alertService.question({ msg: 'Completando cobro', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          // Se genera el carro de cobro

          let carroCobro: any[] = [];

          this.deudas.map(deuda => {

            if (deuda.seleccionado) {
              carroCobro.push({
                mayorista: this.mayoristaCobroSeleccionado._id,
                // cobro: '',
                pedido: deuda._id,
                cancelado: deuda.cancelado,
                monto_total: deuda.precio_total,
                paquete_cobro: this.idPaquete,
                paquete_pedido: deuda.paquete,
                monto_deuda: deuda.deuda_monto,
                monto_cobrado: deuda.montoCobro,
                creatorUser: this.authService.usuario.userId,
                updatorUser: this.authService.usuario.userId,
              });
            }

          });

          const data: any = {
            fecha_cobro: this.fecha,
            tipo: this.montoCobroTotal === 0 ? 'Anticipo' : 'Cobro',
            paquete: this.paquete._id,
            mayorista: this.mayoristaCobroSeleccionado._id,
            repartidor: this.paquete.repartidor._id,
            pedidos: carroCobro,
            monto_anticipo: this.montoCobro,
            monto_cancelar_deuda: this.montoCobroTotal,
            monto_total_recibido: this.montoRecibidoFijo,
            deuda_total: this.deudaTotalFijo,
            deuda_restante: this.deudaTotal,
            creatorUser: this.authService.usuario.userId,
            updatorUser: this.authService.usuario.userId
          };

          this.cobrosMayoristasService.nuevoCobro(data).subscribe({
            next: ({ cobro }) => {
              this.cobros.unshift(cobro);
              this.mostrarCobros = true;
              this.showModalNuevoCobro = false;
              this.calcularTotalesCierre();
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })

        };
      });
  }

  // Eliminar cobro
  eliminarCobro(cobro: any): void {
    this.alertService.question({ msg: 'Eliminando cobro', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.cobrosMayoristasService.eliminarCobro(cobro._id).subscribe({
            next: () => {
              this.cobros = this.cobros.filter(elemento => elemento._id !== cobro._id);
              this.alertService.close();
              this.calcularTotalesCierre();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        };
      });
  }

  abrirDetallesCobro(cobro): void {
    this.alertService.loading();
    this.cobrosMayoristasService.getCobro(cobro._id).subscribe({
      next: ({ cobro }) => {

        this.cobroSeleccionado = cobro;

        // Listado de pedidos afectados
        if (cobro.tipo !== 'Anticipo') {

          this.cobrosPedidosService.listarRelaciones(
            1,
            'createdAt',
            cobro._id
          ).subscribe({
            next: ({ relaciones }) => {
              this.cobros_pedidos = relaciones;
              this.showModalDetallesCobro = true;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })

        } else {
          this.cobroSeleccionado = cobro;
          this.showModalDetallesCobro = true;
          this.alertService.close();
        }

      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Imprimir detalles
  imprimirDetalles(pedido: any): void {
    this.alertService.question({ msg: 'Generando detalles', buttonText: 'Generar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.pedidosService.generarDetallesPDF(pedido._id).subscribe({
            next: () => {
              this.alertService.close();
              window.open(`${base_url}/pdf/detalles_pedido.pdf`, '_blank');
            },
            error: ({ error }) => this.alertService.errorApi(error.message)
          })
        };
      });
  }

  // Impresion masiva
  impresionMasiva(): void {
    this.alertService.question({ msg: '¿Quieres generar detalles de pedidos?', buttonText: 'Generar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.paquetesService.talonariosMasivosPDF(this.idPaquete).subscribe({
            next: () => {
              this.alertService.close();
              window.open(`${base_url}/pdf/talonarios_masivos.pdf`, '_blank');
            }, error: ({error}) => this.alertService.errorApi(error.message)
          })
        }
      });      
  }

  // Generar listado de preparacion
  generarListadoPreparacion(): void {
    this.alertService.question({ msg: '¿Quieres generar un listado de preparación?', buttonText: 'Generar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.paquetesService.generarPreparacionPedidosPDF(this.idPaquete).subscribe({
            next: () => {
              window.open(`${base_url}/pdf/productos_preparacion_pedidos.pdf`, '_blank');
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      }); 
  }

  // Abrir actualizar repartidor
  abrirActualizarRepartidor(): void {
    this.alertService.loading();
    this.usuarioService.listarUsuarios().subscribe({
      next: ({usuarios}) => {
        this.repartidores = usuarios.filter( usuario => usuario.role === 'DELIVERY_ROLE' );
        this.showModalActualizarRepartidor = true;
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar repartidor
  actualizarRepartidor(): void {
    this.alertService.loading();
    this.paquetesService.actualizarRepartidor(this.idPaquete, { repartidor: this.repartidor }).subscribe({
      next: () => {
        this.getPaquete();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  ordenarProductos(): void {
    this.pedidos.map(pedido => {
      pedido.productos.sort(function (a, b) {
        // A va primero que B
        if (a.descripcion < b.descripcion)
          return -1;
        // B va primero que A
        else if (a.descripcion > b.descripcion)
          return 1;
        // A y B son iguales
        else
          return 0;
      });
    })
  }

  ordenarProductosCarrito(): void {
    this.carrito.sort(function (a, b) {
      // A va primero que B
      if (a.descripcion < b.descripcion)
        return -1;
      // B va primero que A
      else if (a.descripcion > b.descripcion)
        return 1;
      // A y B son iguales
      else
        return 0;
    });
  }

}
