import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { add, format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import { ReservasService } from 'src/app/services/reservas.service';
import gsap from 'gsap';
import { ReservasProductosService } from 'src/app/services/reservas-productos.service';
import { VentasService } from 'src/app/services/ventas.service';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Component({
  selector: 'app-detalles-reservas',
  templateUrl: './detalles-reservas.component.html',
  styles: [
  ]
})
export class DetallesReservasComponent implements OnInit {

  // Venta
  public showCompletarVenta = false;
  public precio_total: number = null;
  public precio_total_limpio: number = 0;
  public proximo_nro_factura: string = null;
  public comprobante = 'Normal';
  public imprimir: boolean = false;
  public vuelto: number = 0;
  public pagaCon: number = null;
  public formaPago: string = 'Efectivo';
  public formasPago: any[] = [];
  public multiples_formasPago = false;
  public formaPagoMonto: number = null;
  public pedidosya_comprobante: string = '';
  public diferenciaPago = 0;
  public productoActual: any;

  // Items formas de pago
  public itemsFormasPago: string[] = [
    'Efectivo',
    'Crédito',
    'Débito',
    'Mercado pago',
    'PedidosYa',
    'PedidosYa - Efectivo'
  ];

  // Flags
  public showModalAlerta = false;
  public showModalAdelanto = false;
  public showModalCompletando = false;
  public showModalCliente = false;
  public showModalProductos = false;
  public showModalEditarProducto = false;
  public showEditarObservacion = false;
  public estadoFormulario = 'crear';

  // Productos
  public productos: any = [];
  public productoSeleccionado: any = null;
  public productoSeleccionadoEdicion: any = null;
  public carro: any = [];
  public cantidad: number = null;

  // Buscador de clientes
  public identificacion_cliente = '';
  public clienteSeleccionado = null;

  // Datos de reserva
  public idReserva = '';
  public observaciones = '';
  public reserva: any = null;
  public faltaPagar = 0;
  public adelantoTMP = 0;
  public horasAntesFija: string = '';
  public dataReserva = {
    cliente: '',
    fecha_reserva: format(new Date(), 'yyyy-MM-dd'),
    hora_entrega: '',
    fecha_entrega: format(new Date(), 'yyyy-MM-dd'),
    horas_antes: '',
    precio_total: 0,
    productos: [],
    adelanto: 0,
    observaciones: ''
  }

  // Datos de cliente
  public dataCliente = {
    descripcion: '',
    tipo_identificacion: 'DNI',
    identificacion: '',
    direccion: '',
    telefono: '',
    email: ''
  }

  // Filtros
  public filtro = {
    parametroProductos: ''
  }

  constructor(
    private alertService: AlertService,
    private dataService: DataService,
    public authService: AuthService,
    private ventasService: VentasService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private clientesService: ClientesService,
    private reservasService: ReservasService,
    private reservasProductosService: ReservasProductosService,
    private productosService: ProductosService
  ) { }

  ngOnInit(): void {
    this.alertService.loading();
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Nueva reserva';
    this.inicializacion();
  }

  // Obteniendo valores iniciales
  inicializacion(): void {
    this.activatedRoute.params.subscribe(({ id }) => {
      this.idReserva = id;
      this.getReserva();
    });
  }

  // Obtener datos de reserva
  getReserva(): void {
    this.reservasService.getReserva(this.idReserva).subscribe({
      next: ({ reserva, productos }) => {
        this.precio_total = reserva.precio_total;
        this.precio_total_limpio = reserva.precio_total;
        this.reserva = reserva;
        this.clienteSeleccionado = reserva.cliente;
        this.horasAntesFija = reserva.horas_antes;
        this.carro = productos;
        this.dataReserva = {
          cliente: reserva.cliente._id,
          fecha_reserva: format(new Date(reserva.fecha_reserva), 'yyyy-MM-dd'),
          hora_entrega: reserva.hora_entrega,
          fecha_entrega: format(new Date(reserva.fecha_entrega), 'yyyy-MM-dd'),
          horas_antes: reserva.horas_antes,
          precio_total: reserva.precio_total,
          productos: productos,
          adelanto: reserva.adelanto,
          observaciones: reserva.observaciones
        }
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Buscar cliente
  buscarCliente(): void {

    // Verificacion -> Identificacion de cliente
    if (this.identificacion_cliente.trim() === '') {
      this.alertService.info('Debes colocar una identificación');
      return;
    }

    this.alertService.loading();

    this.clientesService.getClientePorIdentificacion(this.identificacion_cliente).subscribe({
      next: ({ cliente }) => {

        if (cliente) {    // El cliente esta registrado
          this.clienteSeleccionado = cliente;
          this.identificacion_cliente = '';
        } else {          // El cliente no esta registrado
          this.reiniciarCliente();
          this.estadoFormulario = 'crear';
          this.clienteSeleccionado = null;
          this.dataCliente.identificacion = this.identificacion_cliente;
          this.showModalCliente = true;
        }

        this.alertService.close();


      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Cambiar cliente
  cambiarCliente(): void {
    this.clienteSeleccionado = null;
    this.identificacion_cliente = '';
  }

  // Nuevo cliente
  nuevoCliente(): void {

    // Verificacion: Descripción vacia
    if (this.dataCliente.descripcion.trim() === "") {
      this.alertService.info('Debes colocar un Apellido y Nombre / Razon social');
      return;
    }

    // Verificacion: Tipo de identificacion
    if (this.dataCliente.tipo_identificacion.trim() === "") {
      this.alertService.info('Debes colocar un tipo de identificacion');
      return;
    }

    // Verificacion: Identificacion
    if (this.dataCliente.identificacion.trim() === "") {
      this.alertService.info('Debes colocar una identificacion');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.dataCliente.descripcion.toUpperCase(),
      tipo_identificacion: this.dataCliente.tipo_identificacion,
      identificacion: this.dataCliente.identificacion,
      direccion: this.dataCliente.direccion.toLocaleUpperCase(),
      telefono: this.dataCliente.telefono,
      email: this.dataCliente.email.toLowerCase(),
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.clientesService.nuevoCliente(data).subscribe(({ cliente }) => {
      this.showModalCliente = false;
      this.clienteSeleccionado = cliente;
      this.alertService.close();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });

  }

  // Actualizar cliente
  actualizarCliente(): void {

    // Verificacion: Descripción vacia
    if (this.dataCliente.descripcion.trim() === "") {
      this.alertService.info('Debes colocar un Apellido y Nombre / Razon social');
      return;
    }

    // Verificacion: Tipo de identificacion
    if (this.dataCliente.tipo_identificacion.trim() === "") {
      this.alertService.info('Debes colocar un tipo de identificacion');
      return;
    }

    // Verificacion: Identificacion
    if (this.dataCliente.identificacion.trim() === "") {
      this.alertService.info('Debes colocar una identificacion');
      return;
    }

    this.alertService.loading();

    const data = {
      descripcion: this.dataCliente.descripcion.toUpperCase(),
      tipo_identificacion: this.dataCliente.tipo_identificacion,
      identificacion: this.dataCliente.identificacion,
      direccion: this.dataCliente.direccion.toLocaleUpperCase(),
      telefono: this.dataCliente.telefono,
      email: this.dataCliente.email.toLowerCase(),
      updatorUser: this.authService.usuario.userId,
    }

    this.clientesService.actualizarCliente(this.clienteSeleccionado._id, data).subscribe(({ cliente }) => {
      this.clienteSeleccionado = cliente;
      this.showModalCliente = false;
      this.alertService.close();
    }, ({ error }) => {
      this.alertService.errorApi(error.message);
    });
  }

  // Abrir modal - Editar cliente
  abrirEditarCliente(): void {
    this.dataCliente = this.clienteSeleccionado;
    this.estadoFormulario = 'editar';
    this.showModalCliente = true;
  }

  // Abrir modal - Editar producto
  abrirEditarProducto(producto: any): void {
    this.cantidad = producto.cantidad;
    this.productoSeleccionadoEdicion = producto;
    this.showModalEditarProducto = true;
  }

  // Abrir modal - Productos
  abrirProductos(): void {
    this.alertService.loading();
    this.productosService.listarProductos().subscribe({
      next: ({ productos }) => {
        this.filtro.parametroProductos = '';
        this.productos = productos;
        this.productoSeleccionado = null;
        this.showModalProductos = true;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Seleccionar producto
  seleccionarProducto(producto: any): void {
    this.cantidad = null;
    this.productoSeleccionado = producto;
  }

  // Agregar producto
  agregarProducto(): void {

    // Se verifica si el producto esta cargado en el carro
    let repetido = this.carro.find(producto => producto.producto === this.productoSeleccionado._id)

    if (repetido) {
      this.alertService.info('El producto ya se encuentra cargado');
      return;
    }

    // Verificacion de cantidad
    if (this.cantidad <= 0 || !this.cantidad) {
      this.alertService.info('Debe colocar una cantidad válida');
      return;
    }

    this.alertService.loading();

    // balanza - unidad_medida

    const dataProducto = {
      reserva: this.idReserva,
      balanza: this.productoSeleccionado.balanza,
      descripcion: this.productoSeleccionado.descripcion,
      unidad_medida: this.productoSeleccionado.unidad_medida.descripcion,
      producto: this.productoSeleccionado._id,
      precio: this.dataService.redondear(this.productoSeleccionado.precio * this.cantidad, 2),
      precio_unitario: this.productoSeleccionado.precio,
      cantidad: this.cantidad,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.carro.push(dataProducto);

    this.reservasProductosService.nuevoProducto(dataProducto).subscribe({
      next: () => {
        this.productoSeleccionado = null;
        this.cantidad = null;
        this.calcularPrecioTotal();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar producto
  actualizarProducto(): void {

    // Verificacion de cantidad
    if (this.cantidad <= 0 || !this.cantidad) {
      this.alertService.info('Debe colocar una cantidad válida');
      return;
    }

    this.alertService.question({ msg: '¿Quieres actualizar el producto?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();
          let productoSeleccionado = this.carro.find(elemento => elemento.producto === this.productoSeleccionadoEdicion.producto);
          let nuevoPrecio = this.dataService.redondear(this.cantidad * productoSeleccionado.precio_unitario, 2);
          productoSeleccionado.cantidad = this.cantidad;
          productoSeleccionado.precio = nuevoPrecio;

          this.reservasProductosService.actualizarProducto(this.productoSeleccionadoEdicion._id, {
            cantidad: this.cantidad,
            precio: nuevoPrecio
          }).subscribe({
            next: () => {
              this.showModalEditarProducto = false;
              this.calcularPrecioTotal();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })

        }
      });
  }

  // Eliminar producto
  eliminarProducto(producto: any): void {
    this.alertService.question({ msg: '¿Quieres eliminar el producto?', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.carro = this.carro.filter(elemento => elemento.producto !== producto.producto);
          this.reservasProductosService.eliminarProducto(producto._id).subscribe({
            next: () => {
              this.calcularPrecioTotal();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Calculando falta pagar
  calcularFaltaPagar(): void {
    if (this.dataReserva.adelanto > 0) {
      this.faltaPagar = this.dataService.redondear(this.dataReserva.precio_total - this.dataReserva.adelanto, 2);
    } else {
      this.faltaPagar = 0;
    }
  }

  // Ordenar productos
  ordenarProductos(): void {
    this.carro.sort(function (a, b) {
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

  // Calcular precio total
  calcularPrecioTotal(): void {

    let precioTotalTMP = 0;

    this.carro.map((producto: any) => {
      precioTotalTMP += producto.precio;
    });

    this.dataReserva.precio_total = precioTotalTMP;

    this.reservasService.actualizarReserva(this.idReserva, { precio_total: this.dataReserva.precio_total }).subscribe({
      next: () => {
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

    this.ordenarProductos();

  }

  // Completar reserva
  completarReserva(): void {

    // Verificar cliente
    if (!this.clienteSeleccionado) {
      this.alertService.info('Debe seleccionar un cliente');
      return;
    }

    // Verificar cantidad de productos
    if (this.carro.length <= 0) {
      this.alertService.info('Debe colocar al menos un producto');
      return;
    }

    // Verificar adelanto
    if (this.dataReserva.adelanto <= 0 || !this.dataReserva.adelanto) {
      this.alertService.info('Debe colocar un monto de adelanto válido');
      return;
    }

    // Verificar colocar una fecha de reserva válida
    if (!this.dataReserva.fecha_reserva || this.dataReserva.fecha_reserva === '') {
      this.alertService.info('Debe colocar una fecha de reserva válida');
      return;
    }

    // Verificar colocar una fecha de entrega válida
    if (!this.dataReserva.fecha_entrega || this.dataReserva.fecha_entrega === '') {
      this.alertService.info('Debe colocar una fecha de entrega válida');
      return;
    }

    // Verificar colocar una hora de entrega válida
    if (!this.dataReserva.hora_entrega || this.dataReserva.hora_entrega === '') {
      this.alertService.info('Debe colocar una hora de entrega válida');
      return;
    }

    this.alertService.question({ msg: '¿Quieres generar la reserva?', buttonText: 'Generar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          // Adaptando fecha de entrega
          let fechaEntregaCompleta = this.dataReserva.fecha_entrega + ':' + this.dataReserva.hora_entrega;
          this.dataReserva.fecha_entrega = fechaEntregaCompleta;

          // Agregando datos de cliente
          this.dataReserva.cliente = this.clienteSeleccionado._id;

          // Agregando productos
          this.dataReserva.productos = this.carro;

          let data = {
            ...this.dataReserva,
            creatorUser: this.authService.usuario.userId,
            updatorUser: this.authService.usuario.userId,
          }

          this.reservasService.nuevaReserva(data).subscribe({
            next: () => {
              this.showModalCompletando = false;
              this.reiniciarReserva();
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });

  }

  // Reiniciar datos de cliente
  reiniciarCliente(): void {
    this.dataCliente = {
      descripcion: '',
      tipo_identificacion: 'DNI',
      identificacion: '',
      direccion: '',
      telefono: '',
      email: ''
    }
  }

  // Reiniciar datos de reserva
  reiniciarReserva(): void {
    this.carro = [];
    this.clienteSeleccionado = null;
    this.dataReserva = {
      cliente: '',
      fecha_reserva: format(new Date(), 'yyyy-MM-dd'),
      hora_entrega: '',
      fecha_entrega: format(new Date(), 'yyyy-MM-dd'),
      horas_antes: '',
      precio_total: 0,
      productos: [],
      adelanto: 0,
      observaciones: ''
    }
  }

  // -------------------

  // Abrir actualizar adelanto
  abrirActualizarAdelanto(): void {
    this.adelantoTMP = this.dataReserva.adelanto;
    this.showModalAdelanto = true;
  }

  // Abrir actualizar alerta
  abrirActualizarAlerta(): void {
    this.dataReserva.horas_antes = this.horasAntesFija;
    this.showModalAlerta = true;
  }

  // Abrir modal - Completar venta
  abrirCompletarVenta(): void {
    this.proximo_nro_factura = null;
    this.showCompletarVenta = true;
  }

  // Abrir editar observaciones
  abrirEditarObservacion(): void {
    this.observaciones = this.dataReserva.observaciones;
    console.log(this.dataReserva.observaciones);
    this.showEditarObservacion = true;
  }

  // Cerrar actualizar alerta
  cerrarActualizarAlerta(): void {
    this.dataReserva.horas_antes = this.horasAntesFija;
    this.showModalAlerta = false;
  }

  actualizarAdelanto(): void {

    // Verificacion: Monto de adelanto valido
    if (!this.adelantoTMP || this.adelantoTMP < 0) {
      this.alertService.info('Debe colocar un monto válido');
      return;
    }

    // Verificacion: Monto de adelanto supera precio total
    if (this.adelantoTMP > this.dataReserva.precio_total) {
      this.alertService.info('La seña no puede ser superior al precio total');
      return;
    }

    this.alertService.loading();
    this.reservasService.actualizarReserva(this.idReserva, { adelanto: this.adelantoTMP }).subscribe({
      next: () => {
        this.dataReserva.adelanto = this.adelantoTMP;
        this.showModalAdelanto = false;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })

  }

  // Actualizar fecha de reserva
  actualizarFechaReserva(): void {
    this.alertService.loading();
    this.reservasService.actualizarReserva(this.idReserva, { fecha_reserva: this.dataReserva.fecha_reserva }).subscribe({
      next: () => {
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar alerta
  actualizarFechasHoras(): void {

    this.alertService.loading();

    let fechaEntregaCompleta = this.dataReserva.fecha_entrega + ':' + this.dataReserva.hora_entrega;

    const data = {
      fecha_entrega: fechaEntregaCompleta,
      hora_entrega: this.dataReserva.hora_entrega,
      horas_antes: this.dataReserva.horas_antes,
      fecha_alerta: format(add(new Date(fechaEntregaCompleta), { hours: -Number(this.dataReserva.horas_antes) }), 'yyyy-MM-dd:HH:mm'),
    }

    this.reservasService.actualizarReserva(this.idReserva, data).subscribe({
      next: () => {
        this.horasAntesFija = this.dataReserva.horas_antes;
        this.showModalAlerta = false;
        this.dataService.alertaReservas();
        this.alertService.close();
        this.getReserva();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Eliminar reserva
  eliminarReserva(): void {
    this.alertService.question({ msg: '¿Quieres eliminar la reserva?', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.reservasService.eliminarReserva(this.idReserva).subscribe({
            next: () => {
              this.router.navigateByUrl('/dashboard/reservas')
              this.dataService.alertaReservas();
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // ---------------------- VENTAS ----------------------

  // Proximo numero de factura
  proximoNroFactura(): void {
    this.alertService.loading();
    this.ventasService.proximoNroFactura('B').subscribe({
      next: ({ nro_factura }) => {
        this.proximo_nro_factura = nro_factura;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  cambiarImprimir(): void {
    this.imprimir = !this.imprimir;
  }

  // Calcular vuelto
  calcularVuelto(): void {
    this.vuelto = this.pagaCon - this.precio_total;
    localStorage.setItem('vuelto', JSON.stringify(this.vuelto));
    localStorage.setItem('pagaCon', JSON.stringify(this.pagaCon));
  }

  // Seleccionando forma de pago
  seleccionarFormaPago(): void {

    if (!this.multiples_formasPago && (this.formaPago === 'Crédito' || this.formaPago === 'Débito' || this.formaPago === 'Mercado pago')) {
      this.comprobante = 'Fiscal';
    }

    this.pedidosya_comprobante = '';
    this.calcularPrecio();
  }

  // Calcular precio de venta
  calcularPrecio(): void {

    let precioTMP = 0;
    this.carro.map(producto => {
      precioTMP += producto.precio;
    })

    // Precio sin adicionales ni descuentos
    this.precio_total_limpio = this.dataService.redondear(precioTMP, 2);

    if (this.formasPago.length === 0) { // Forma de pago unica
      // Con adicional por credito => precio total + 10% : Sin adicional por credito
      this.formaPago === 'Crédito'
        ? this.precio_total = this.dataService.redondear(precioTMP * 1.10, 2)
        : this.precio_total = this.dataService.redondear(precioTMP, 2);
    } else {
    }

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

  // Calcular diferencia - Metodos de pago multiples
  calcularDiferencia(): void {

    let precioTotalTMP = this.precio_total;
    for (const elemento of this.formasPago) {
      precioTotalTMP = precioTotalTMP - elemento.valor;
    }

    this.formaPagoMonto = this.dataService.redondear(precioTotalTMP, 2);
    this.diferenciaPago = this.dataService.redondear(precioTotalTMP, 2);

  }

  // Agregar forma de pago
  agregarFormaPago(): void {

    console.log(this.diferenciaPago);


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

  // Regresar a metodo de pago unico
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

  // Completar venta
  completarVenta(): void {

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

          if (!this.multiples_formasPago) forma_pago = [{ descripcion: this.formaPago, valor: this.precio_total }];
          else if (this.multiples_formasPago) forma_pago = this.formasPago;

          const data = {
            productos: this.carro,
            precio_total: this.precio_total,
            precio_total_limpio: this.precio_total_limpio,
            comprobante: this.comprobante,
            pedidosya_comprobante: (this.formaPago === 'PedidosYa' || this.formaPago === 'PedidosYa - Efectivo') ? this.pedidosya_comprobante : '',
            forma_pago,
            adicional_credito: this.formaPago === 'Crédito' ? this.precio_total_limpio * 0.10 : 0,
            creatorUser: this.authService.usuario.userId,
            updatorUser: this.authService.usuario.userId,
          };

          this.ventasService.nuevaVenta(data).subscribe({
            next: ({ venta }) => {

              this.productoSeleccionado = null;
              this.precio_total = 0;
              this.precio_total_limpio = 0;
              this.comprobante = 'Normal',
              this.productos = [];
              this.pagaCon = null;
              this.formaPago = 'Efectivo';
              this.vuelto = 0;
              this.pedidosya_comprobante = '';

              this.metodoPagoUnico();

              // Completando reserva
              this.reservasService.actualizarReserva(this.idReserva, { estado: 'Completada' }).subscribe({
                next: () => {

                  this.reserva.estado = 'Completada';

                  // Imprimir comprobante
                  if (this.imprimir) {
                    this.ventasService.getComprobante(venta._id).subscribe({
                      next: () => {
                        window.open(`${base_url}/pdf/comprobante.pdf`, '_blank');
                        this.alertService.success('Venta completada');
                      }, error: (error) => this.alertService.errorApi(error.message)
                    })
                  } else {
                    this.alertService.success('Venta completada');
                  }

                  this.showCompletarVenta = false;

                }, error: ({ error }) => this.alertService.errorApi(error.message)
              })
            },
            error: ({ error }) => this.alertService.errorApi(error.message)
          });

        }
      });
  }


  // Eliminar forma de pago
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

  // Reiniciar Metodos de pago
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

  // No se retiro la reserva
  sinRetirar(): void {
    this.alertService.question({ msg: '¿Quieres marcar la reserva como no recibida?', buttonText: 'Aceptar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.reservasService.actualizarReserva(this.idReserva, { estado: 'No retirada' }).subscribe({
            next: () => {
              this.reserva.estado = 'No retirada';
              this.showCompletarVenta = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Recuperar la reserva
  recuperarReserva(): void {
    this.alertService.question({ msg: '¿Quieres recuperar la reserva?', buttonText: 'Recuperar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.reservasService.actualizarReserva(this.idReserva, { estado: 'Pendiente' }).subscribe({
            next: () => {
              this.reserva.estado = 'Pendiente';
              this.showCompletarVenta = false;
              this.alertService.close();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Actualizar observacion
  actualizarObservacion(): void {
    this.alertService.loading();
    this.reservasService.actualizarReserva(this.idReserva, { observaciones: this.observaciones }).subscribe({
      next: () => {
        this.dataReserva.observaciones = this.observaciones.toUpperCase().trim();
        this.showEditarObservacion = false;
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

}
