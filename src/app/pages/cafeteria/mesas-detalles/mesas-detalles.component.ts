import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MesasService } from 'src/app/services/mesas.service';
import { AlertService } from 'src/app/services/alert.service';
import { ProductosService } from 'src/app/services/productos.service';
import { MesasPedidosService } from 'src/app/services/mesas-pedidos.service';
import { MesasPedidosProductosService } from 'src/app/services/mesas-pedidos-productos.service';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import { VentasService } from 'src/app/services/ventas.service';

const base_url = environment.base_url;

@Component({
  selector: 'app-mesas-detalles',
  templateUrl: './mesas-detalles.component.html',
  styles: []
})
export class MesasDetallesComponent implements OnInit {

  // Permisos
  public permiso_escritura: string[] = ['CAFETERIA_ALL'];

  // Mesa
  public mesa: any;
  public formActualizarMesa = {
    descripcion: ''
  }

  // Productos
  public productos: any[] = [];
  public actualizandoDatos: boolean = false;
  public filtroProductos = {
    parametro: ''
  }

  // Pedidos
  public pedido: any;
  public productosCarrito: any[] = [];

  // Modals
  public showModalActualizarMesa: boolean = false;
  public showModalProductos: boolean = false;

  // Producto seleccionado
  public productoSeleccionado: any;
  public cantidad: number = 1;

  // Loadings
  public cargandoProductos: boolean = false;

  // Completando venta
  public imprimir: boolean = true;
  public showModalVenta = false;
  public fecha = new Date();
  public comprobante = 'Normal';
  public precioTotal = 0;
  public precio_total_limpio: number = 0;
  public vuelto: number = 0;
  public pagaCon: number = null;
  public formaPago: string = 'Efectivo';
  public formasPago: any[] = [];
  public multiples_formasPago = false;
  public formaPagoMonto: number = null;
  public diferenciaPago = 0;
  public proximo_nro_factura: string = null;

  public contribuyente: any = null;
  public cuitContribuyente: string = '';

  public pedidosya_comprobante: string = '';

  public itemsFormasPago: string[] = [
    'Efectivo',
    'Crédito',
    'Débito',
    'Mercado pago',
    'PedidosYa',
    'PedidosYa - Efectivo'
  ];

  constructor(
    private dataService: DataService,
    public authService: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private mesasService: MesasService,
    private ventasService: VentasService,
    private mesasPedidosService: MesasPedidosService,
    private mesasPedidosProductosService: MesasPedidosProductosService,
    private alertService: AlertService,
    private productosService: ProductosService,
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Detalles de mesa';
    this.alertService.loading();
    this.recuperarLocalStorage();
    this.listarProductos();
    this.activatedRoute.params.subscribe({
      next: ({ id }) => {

        this.mesasPedidosService.getPedidoPorMesa(id).subscribe({
          next: ({ pedido }) => {
            this.mesa = pedido.mesa;
            this.pedido = pedido;
            this.mesasPedidosProductosService.listarRelaciones(-1, 'descripcion', pedido.mesa._id).subscribe({
              next: ({ relaciones }) => {

                // Productos carrito
                this.productosCarrito = relaciones;
                this.calcularPrecioTotal();

                this.alertService.close();
              }, error: ({ error }) => this.alertService.errorApi(error.message)
            })
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })

      }
    });
  }

  recuperarLocalStorage(): void {
    const imprimir = localStorage.getItem('imprimir-cafeteria');
    if (imprimir) this.imprimir = JSON.parse(imprimir);
  }

  abrirActualizarMesa(): void {
    this.formActualizarMesa.descripcion = this.mesa.descripcion;
    this.showModalActualizarMesa = true;
  }

  actualizarMesa(): void {

    // Verificar si no esta vacio
    if (this.formActualizarMesa.descripcion.trim() === '') {
      this.alertService.info('El nombre de la mesa no puede estar vacío');
    }

    this.alertService.loading();
    this.mesasService.actualizarMesa(this.mesa._id, this.formActualizarMesa).subscribe({
      next: () => {
        this.mesa.descripcion = this.formActualizarMesa.descripcion;
        this.showModalActualizarMesa = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  listarProductos(): void {
    this.cargandoProductos = true;
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.productos = productos;
        this.cargandoProductos = false;
      }, error: ({ error }) => {
        this.alertService.errorApi(error.message);
        this.cargandoProductos = false;
      }
    })
  }

  abrirListadoProductos(): void {
    this.productoSeleccionado = null;
    this.cantidad = 1;
    this.showModalProductos = true;
  }

  agregarProducto(): void {

    // Determinar si el producto ya se encuentra cargado
    const productoExistente = this.productosCarrito.find(({ producto }) => producto._id === this.productoSeleccionado._id);
    if (productoExistente) return this.alertService.info('El producto ya se encuentra cargado');

    this.alertService.loading();

    const data = {
      cantidad: this.cantidad,
      mesa: this.mesa._id,
      pedido: this.pedido._id,
      precio: this.productoSeleccionado.precio,
      precioTotal: this.cantidad * this.productoSeleccionado.precio,
      producto: this.productoSeleccionado._id,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };

    this.mesasPedidosProductosService.nuevoRelacion(data).subscribe({
      next: ({ relacion }) => {
        this.productosCarrito.push(relacion);
        this.ordenarPorDescripcion();
        this.calcularPrecioTotal();
        this.showModalProductos = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  eliminarProducto(relacion: any): void {

    // Verificar si es el ultimo producto
    if (this.productosCarrito.length === 1) {
      this.alertService.info('El pedido no puede quedar sin productos');
      return;
    }

    this.alertService.question({ msg: 'Eliminando producto', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.mesasPedidosProductosService.eliminarRelacion(relacion._id).subscribe({
            next: () => {
              this.productosCarrito = this.productosCarrito.filter(({ _id }) => _id !== relacion._id);
              this.calcularPrecioTotal();
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          });
        }
      });

  }

  cancelarPedido(): void {
    this.alertService.question({ msg: '¿Desea cancelar el pedido?', buttonText: 'Aceptar' }).then(({ isConfirmed }) => {
      if (isConfirmed) {
        this.alertService.loading();
        this.mesasPedidosService.cancelarPedido(this.mesa._id).subscribe({
          next: () => {
            this.router.navigateByUrl('/dashboard/cafeteria');
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      }
    })
  }

  seleccionarProducto(producto: any): void {
    this.productoSeleccionado = producto;
    this.cantidad = 1;
  }

  deseleccionarProducto(): void {
    this.productoSeleccionado = null;
    this.filtroProductos.parametro = '';
  }

  calcularPrecioTotal(): void {

    let precioTMP = 0;

    this.precioTotal = 0;
    this.ordenarPorDescripcion();
    this.productosCarrito.map(({ precioTotal }) => {
      precioTMP = precioTMP + precioTotal;
      this.precioTotal += precioTotal;
    });

    // Precio sin adicionales ni descuentos
    this.precio_total_limpio = this.dataService.redondear(precioTMP, 2);

    if (this.formasPago.length === 0) { // Forma de pago unica
      // Con adicional por credito => precio total + 10% : Sin adicional por credito
      this.formaPago === 'Crédito'
        ? this.precioTotal = this.dataService.redondear(precioTMP * 1.10, 2)
        : this.precioTotal = this.dataService.redondear(precioTMP, 2);
    }

    // Se actualiza el vuelto
    this.calcularVuelto();

  }

  // Ordenar carrito por descripcion
  ordenarPorDescripcion(): void {
    this.productosCarrito.sort((a, b) => a.producto.descripcion.localeCompare(b.producto.descripcion));
  }

  incrementarCantidad(elemento: any): void {

    this.actualizandoDatos = true;
    let cantidadTMP = elemento.cantidad;
    let precioTotalTMP = elemento.precioTotal;
    elemento.cantidad += 1;
    elemento.precioTotal = elemento.cantidad * elemento.precio;
    this.calcularPrecioTotal();
    this.mesasPedidosProductosService.actualizarRelacion(elemento._id, {
      cantidad: elemento.cantidad,
      precio: elemento.precio,
      precioTotal: elemento.precioTotal,
      updatorUser: this.authService.usuario.userId
    }).subscribe({
      next: () => {
        this.actualizandoDatos = false;
      }, error: ({ error }) => {
        this.actualizandoDatos = false;
        elemento.cantidad = cantidadTMP;
        elemento.precioTotal = precioTotalTMP;
        this.calcularPrecioTotal();
        this.alertService.errorApi(error.message)
      }
    });

  }

  decrementarCantidad(elemento: any): void {

    if (elemento.cantidad === 1) return;
    this.actualizandoDatos = true;

    let cantidadTMP = elemento.cantidad;
    let precioTotalTMP = elemento.precioTotal;

    elemento.cantidad -= 1;
    elemento.precioTotal = elemento.cantidad * elemento.precio;
    this.calcularPrecioTotal();

    this.mesasPedidosProductosService.actualizarRelacion(elemento._id, {
      cantidad: elemento.cantidad,
      precio: elemento.precio,
      precioTotal: elemento.precioTotal,
      updatorUser: this.authService.usuario.userId
    }).subscribe({
      next: () => {
        this.actualizandoDatos = false;
      }, error: ({ error }) => {
        this.actualizandoDatos = false;
        elemento.cantidad = cantidadTMP;
        elemento.precioTotal = precioTotalTMP;
        this.calcularPrecioTotal();
        this.alertService.errorApi(error.message)
      }
    });

  }

  actualizarCantidad(elemento: any): void {
    this.actualizandoDatos = true;
    let cantidadTMP = elemento.cantidad;
    let precioTotalTMP = elemento.precioTotal;
    if (elemento.cantidad <= 0) elemento.cantidad = 1;
    elemento.precio = elemento.producto.precio;
    elemento.precioTotal = elemento.producto.precio * elemento.cantidad;
    this.calcularPrecioTotal();
    this.mesasPedidosProductosService.actualizarRelacion(elemento._id, {
      cantidad: elemento.cantidad,
      precio: elemento.precio,
      precioTotal: elemento.precioTotal,
      updatorUser: this.authService.usuario.userId
    }).subscribe({
      next: () => {
        this.actualizandoDatos = false;
      }, error: ({ error }) => {
        this.actualizandoDatos = false;
        elemento.cantidad = cantidadTMP;
        elemento.precioTotal = precioTotalTMP;
        this.calcularPrecioTotal();
        this.alertService.errorApi(error.message)
      }
    })
  }

  // Generacion de PDF - Imprimir detalles de pedido
  imprimirDetallesPedido(): void {
    this.alertService.loading();
    this.mesasPedidosService.imprimirDetallesPedido(this.mesa._id).subscribe({
      next: () => {
        window.open(`${base_url}/pdf/cafeteria_detalles_pedido.pdf`, '_blank');
        this.alertService.close();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // -- COMPLETANDO VENTA --

  cambiarTipoComprobante(): void {
    this.proximo_nro_factura = '';
    this.eliminarContribuyente();
  }

  // Eliminar contribuyente
  eliminarContribuyente(): void {
    this.contribuyente = null;
    this.cuitContribuyente = '';
  }

  // Proximo numero de factura B
  proximoNroFactura(comprobante: string): void {
    this.alertService.loading();
    this.ventasService.proximoNroFactura(comprobante).subscribe({
      next: ({ nro_factura }) => {
        this.proximo_nro_factura = nro_factura;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  cambiarImprimir(): void {
    this.imprimir = !this.imprimir;
    this.almacenamientoLocalStorage();
  }

  // Datos de contribuyente
  getContribuyente(): void {

    if (this.cuitContribuyente.trim() === '') {
      this.alertService.info('Debe colocar un CUIT');
      return;
    }

    this.alertService.loading();

    this.ventasService.getContribuyente(this.cuitContribuyente).subscribe({
      next: ({ contribuyente }) => {
        this.contribuyente = contribuyente;
        console.log(this.contribuyente)
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    });

  }

  // Calcular vuelto
  calcularVuelto(): void {
    this.vuelto = this.pagaCon - this.precioTotal;
    localStorage.setItem('vuelto', JSON.stringify(this.vuelto));
    localStorage.setItem('pagaCon', JSON.stringify(this.pagaCon));
  }

  // Seleccionando forma de pago
  seleccionarFormaPago(): void {

    if (!this.multiples_formasPago && (this.formaPago === 'Crédito' || this.formaPago === 'Débito' || this.formaPago === 'Mercado pago')) {
      this.comprobante = 'Fiscal';
    }

    this.pedidosya_comprobante = '';
    this.calcularPrecioTotal();

  }

  metodoPagoMultiple(): void {
    this.itemsFormasPago = [
      'Efectivo',
      'Débito',
      'Mercado pago',
    ];
    this.formaPago = 'Efectivo';
    this.multiples_formasPago = true;
    this.calcularDiferencia();
  }

  calcularDiferencia(): void {
    let precioTotalTMP = this.precioTotal;
    for (const elemento of this.formasPago) {
      precioTotalTMP = precioTotalTMP - elemento.valor;
    }

    this.formaPagoMonto = this.dataService.redondear(precioTotalTMP, 2);
    this.diferenciaPago = this.dataService.redondear(precioTotalTMP, 2);

  }

  agregarFormaPago(): void {

    // Verificacion de valores ingresados
    if (!this.formaPagoMonto || this.formaPagoMonto <= 0) {
      this.alertService.info('Valores inválidos');
      return;
    }

    if (this.formaPagoMonto > this.diferenciaPago) {
      this.alertService.info('No se puede superar el monto de la venta');
      return;
    }

    this.formasPago.push({ descripcion: this.formaPago, valor: this.formaPagoMonto });

    // Se elimina el elemento
    this.itemsFormasPago = this.itemsFormasPago.filter(elemento => elemento !== this.formaPago);

    this.formaPago = this.itemsFormasPago[0];

    // this.formaPagoMonto = null;
    this.calcularDiferencia();

  }

  metodoPagoUnico(): void {
    this.itemsFormasPago = [
      'Efectivo',
      'Crédito',
      'Débito',
      'Mercado pago',
      'PedidosYa',
      'PedidosYa - Efectivo'
    ];
    this.reiniciarMetodosPago();
    this.multiples_formasPago = false;
  }

  reiniciarMetodosPago(): void {
    this.itemsFormasPago = [
      'Efectivo',
      'Crédito',
      'Débito',
      'Mercado pago',
      'PedidosYa',
      'PedidosYa - Efectivo'
    ]
    this.formaPago = 'Efectivo';
    this.formaPagoMonto = null;
    this.formasPago = [];
  }

  eliminarFormaPago(formaPago: any): void {

    this.formasPago = this.formasPago.filter(elemento => elemento.descripcion !== formaPago.descripcion);

    this.itemsFormasPago = [];

    let efectivo = false;
    let debito = false;
    let mercadoPago = false;

    for (const elemento of this.formasPago) {
      const elementoTMP: any = elemento;
      if (elementoTMP.descripcion === 'Efectivo') efectivo = true;
      else if (elementoTMP.descripcion === 'Débito') debito = true;
      else if (elementoTMP.descripcion === 'Mercado pago') mercadoPago = true;
    }

    this.itemsFormasPago = [];

    if (!efectivo) this.itemsFormasPago.push('Efectivo');
    if (!debito) this.itemsFormasPago.push('Débito');
    if (!mercadoPago) this.itemsFormasPago.push('Mercado pago');

    this.formaPago = this.itemsFormasPago[0];

    this.calcularDiferencia();

  }

  completarVenta(): void {

    // Verificacion - Si el comprobante es factura A y no se coloco un contribuyente
    if (this.comprobante === 'Factura A' && !this.contribuyente) {
      this.alertService.info('Debe seleccionar un cliente');
      return;
    }

    // Verificacion - Formas de pago multiples
    if (this.multiples_formasPago && this.formasPago.length === 0) { // Seleccionar al menos una forma de pago (Multiples formas de pago)
      this.alertService.info('Debe seleccionar una forma de pago');
      return;
    }

    if (this.multiples_formasPago && this.diferenciaPago !== 0) {
      this.alertService.info('Debe cubrir el precio total de la venta');
      return;
    }

    // Verificacion - PedidosYa
    if ((this.formaPago === 'PedidosYa' || this.formaPago === 'PedidosYa - Efectivo') && this.pedidosya_comprobante.trim() === '') {
      this.alertService.info('Colocar número de comprobante de PedidosYa');
      return;
    }

    this.alertService.question({ msg: 'Completando venta', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          let forma_pago: any[];

          this.alertService.loading();

          if (!this.multiples_formasPago) forma_pago = [{ descripcion: this.formaPago, valor: this.precioTotal }];
          else if (this.multiples_formasPago) forma_pago = this.formasPago;

          // Armamos la razonSocial
          let razonSocial = '';
          if (this.contribuyente) {
            if (this.contribuyente.tipoPersona === 'FISICA') razonSocial = `${this.contribuyente.apellido} ${this.contribuyente.nombre}`;
            else if (this.contribuyente.tipoPersona === 'JURIDICA') razonSocial = this.contribuyente.razonSocial;
          }

          // Adaptando productos
          const productosTMP = this.productosCarrito.map(({ producto, cantidad, precioTotal }) => {
            return {
              alicuota: producto.alicuota,
              balanza: producto.balanza,
              cantidad,
              creatorUser: this.authService.usuario.userId,
              descripcion: producto.descripcion,
              precio_unitario: producto.precio,
              precio: precioTotal,
              producto: producto._id,
              unidad_medida: producto.unidad_medida.descripcion,
              updatorUser: this.authService.usuario.userId,
            }
          });

          const data = {
            productos: productosTMP,
            precio_total: this.precioTotal,
            precio_total_limpio: this.precio_total_limpio,
            contribuyente: {
              razonSocial: this.contribuyente ? razonSocial : '',
              tipoPersona: this.contribuyente ? this.contribuyente.tipoPersona : '',
              tipoIdentificacion: this.contribuyente ? this.contribuyente.tipoClave : '',
              identificacion: this.contribuyente ? this.contribuyente.idPersona : ''
            },
            comprobante: this.comprobante,
            pedidosya_comprobante: (this.formaPago === 'PedidosYa' || this.formaPago === 'PedidosYa - Efectivo') ? this.pedidosya_comprobante : '',
            forma_pago,
            adicional_credito: this.formaPago === 'Crédito' ? this.precio_total_limpio * 0.10 : 0,
            creatorUser: this.authService.usuario.userId,
            updatorUser: this.authService.usuario.userId,
          };

          this.ventasService.nuevaVenta(data).subscribe({
            next: ({ venta }) => {

              this.precioTotal = 0;
              this.precio_total_limpio = 0;
              this.comprobante = 'Normal',
                this.productos = [];
              this.showModalVenta = false;
              this.pagaCon = null;
              this.formaPago = 'Efectivo';
              this.vuelto = 0;
              this.pedidosya_comprobante = '';

              this.metodoPagoUnico();

              // Imprimir comprobante
              if (this.imprimir) {
                this.ventasService.getComprobante(venta._id).subscribe({
                  next: () => {
                    this.mesasPedidosService.cancelarPedido(this.mesa._id).subscribe({
                      next: () => {
                        window.open(`${base_url}/pdf/comprobante.pdf`, '_blank');
                        this.router.navigateByUrl('/dashboard/cafeteria');
                        this.alertService.close();
                      }, error: ({ error }) => this.alertService.errorApi(error.message)
                    })
                  }, error: (error) => this.alertService.errorApi(error.message)
                })
              } else {
                this.mesasPedidosService.cancelarPedido(this.mesa._id).subscribe({
                  next: () => {
                    this.router.navigateByUrl('/dashboard/cafeteria');
                    this.alertService.close();
                  }, error: ({ error }) => this.alertService.errorApi(error.message)
                })
              }

            },
            error: ({ error }) => this.alertService.errorApi(error.message)
          });

        }
      });
  }

  // Abrir modal - Completar venta
  abrirModalVenta(): void {
    this.proximo_nro_factura = null;
    this.showModalVenta = true;
  }

  almacenamientoLocalStorage(): void {
    localStorage.setItem('imprimir-cafeteria', JSON.stringify(this.imprimir));
  }


}
