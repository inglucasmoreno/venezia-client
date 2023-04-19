import { Component, OnInit } from '@angular/core';
import { add, format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DataService } from 'src/app/services/data.service';
import { ReservasService } from 'src/app/services/reservas.service';
import gsap from 'gsap';
import { ProductosService } from 'src/app/services/productos.service';
import { environment } from 'src/environments/environment';
import { VentasService } from 'src/app/services/ventas.service';
import { VentasReservasService } from 'src/app/services/ventas-reservas.service';

const base_url = environment.base_url;

@Component({
  selector: 'app-nueva-reserva',
  templateUrl: './nueva-reserva.component.html',
  styles: [
  ]
})
export class NuevaReservaComponent implements OnInit {

  // ID Reserva
  public idReserva = '';

  // Flags
  public showModalCompletando = false;
  public showModalCliente = false;
  public showModalProductos = false;
  public showModalEditarProducto = false;
  public estadoFormulario = 'crear';

  // Venta
  public fechaVenta = format(new Date(), 'dd/MM/yyyy');
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

  // Productos
  public precio: number = 0;
  public productos: any = [];
  public productoSeleccionado: any = null;
  public productoSeleccionadoEdicion: any = null;
  public carro: any = [];
  public cantidad: number = null;

  // Buscador de clientes
  public identificacion_cliente = '';
  public clienteSeleccionado = null;

  // Datos de reserva
  public limite_adelanto = 0;
  public faltaPagar = 0;
  public fechaMuestra = '';
  public dataReserva = {
    cliente: '',
    fecha_reserva: format(new Date(), 'yyyy-MM-dd'),
    hora_entrega: '',
    fecha_entrega: '',
    fecha_alerta: '',
    horas_antes: '3',
    precio_total: 0,
    productos: [],
    adelanto: 0,
    observaciones: '',
    tipo_observaciones: 'General',
    torta_relleno1: '',
    torta_relleno2: '',
    torta_relleno3: '',
    torta_forma: '',
    torta_peso: null,
    torta_cobertura: '',
    torta_detalles: ''
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
    private ventasService: VentasService,
    private ventasReservasService: VentasReservasService,
    private dataService: DataService,
    public authService: AuthService,
    private clientesService: ClientesService,
    private reservasService: ReservasService,
    private productosService: ProductosService
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Nueva reserva';
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

  // Abrir modal - Completar reserva
  abrirCompletarReserva(): void {

    // Verificar rellenos
    if (this.dataReserva.tipo_observaciones === 'Torta' && this.dataReserva.torta_relleno1.trim() === '') {
      this.alertService.info('Debe colocar el primer relleno de la torta');
      return;
    }

    // Verificar forma
    if (this.dataReserva.tipo_observaciones === 'Torta' && this.dataReserva.torta_forma.trim() === '') {
      this.alertService.info('Debe colocar la forma de la torta');
      return;
    }

    // Verificar peso
    if (this.dataReserva.tipo_observaciones === 'Torta' && this.dataReserva.torta_peso <= 0) {
      this.alertService.info('Debe colocar el peso de la torta');
      return;
    }

    // Verificar cobertura
    if (this.dataReserva.tipo_observaciones === 'Torta' && this.dataReserva.torta_cobertura.trim() === '') {
      this.alertService.info('Debe colocar la cobertura de la torta');
      return;
    }

    this.fechaMuestra = format(add(new Date(this.dataReserva.fecha_reserva), { hours: 3 }), 'dd/MM/yyyy');
    this.dataReserva.horas_antes = '3';
    this.dataReserva.fecha_entrega = '';
    this.dataReserva.hora_entrega = '';
    this.limite_adelanto = this.dataService.redondear(this.dataReserva.precio_total * 0.5, 2);
    this.dataReserva.adelanto = this.limite_adelanto;
    this.calcularFaltaPagar();
    this.showModalCompletando = true;
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
    this.precio = producto.precio;
    this.cantidad = null;
    this.productoSeleccionado = producto;
  }

  // Agregar producto
  agregarProducto(): void {

    // Se verifica si el producto esta cargado en el carro
    let repetido = this.carro.find(producto => producto.producto === this.productoSeleccionado._id)

    if (!this.precio || this.precio < 0) {
      this.alertService.info('Debe colocar un precio válido');
      return;
    }

    if (repetido) {
      this.alertService.info('El producto ya se encuentra cargado');
      return;
    }

    // Verificacion de cantidad
    if (this.cantidad <= 0 || !this.cantidad) {
      this.alertService.info('Debe colocar una cantidad válida');
      return;
    }

    const dataProducto = {
      descripcion: this.productoSeleccionado.descripcion,
      balanza: this.productoSeleccionado.balanza,
      unidad_medida: this.productoSeleccionado.unidad_medida.descripcion,
      producto: this.productoSeleccionado._id,
      // precio: this.dataService.redondear(this.productoSeleccionado.precio * this.cantidad, 2),
      precio: this.dataService.redondear(this.precio * this.cantidad, 2),
      // precio_unitario: this.productoSeleccionado.precio,
      precio_unitario: this.precio,
      cantidad: this.cantidad,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.carro.push(dataProducto);

    this.productoSeleccionado = null;
    this.cantidad = null;

    this.calcularPrecioTotal();

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
          let productoSeleccionado = this.carro.find(elemento => elemento.producto === this.productoSeleccionadoEdicion.producto);
          productoSeleccionado.cantidad = this.cantidad;
          productoSeleccionado.precio = this.dataService.redondear(this.cantidad * productoSeleccionado.precio_unitario, 2);
          this.showModalEditarProducto = false;
          this.calcularPrecioTotal();
        }
      });
  }

  // Eliminar producto
  eliminarProducto(producto: any): void {
    this.alertService.question({ msg: '¿Quieres eliminar el producto?', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.carro = this.carro.filter(elemento => elemento.producto !== producto.producto);
          this.calcularPrecioTotal();
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

    this.ordenarProductos();

  }

  // Completar reserva
  completarReserva(): void {

    // Verificacion -> DATOS DE RESERVA

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

    // Verificar adelanto
    if (this.dataReserva.adelanto <= 0 || !this.dataReserva.adelanto) {
      this.alertService.info('Debe colocar un monto de adelanto válido');
      return;
    }

    // Verificar monto de adelanto
    if (this.dataReserva.adelanto > this.dataReserva.precio_total) {
      this.alertService.info('La seña no puede ser superior al precio total');
      return;
    }

    // Verificacion -> DATOS DE PAGO DE SEÑA

    // Verificacion - Formas de pago multiples
    if (this.multiples_formasPago && this.formasPago.length === 0) { // Seleccionar al menos una forma de pago (Multiples formas de pago)
      this.alertService.info('Debe seleccionar una forma de pago');
      return;
    }

    if (this.multiples_formasPago && this.diferenciaPago !== 0) {
      this.alertService.info('Debe cubrir el precio total de la seña');
      return;
    }

    // Verificacion - PedidosYa
    if ((this.formaPago === 'PedidosYa' || this.formaPago === 'PedidosYa - Efectivo') && this.pedidosya_comprobante.trim() === '') {
      this.alertService.info('Colocar número de comprobante de PedidosYa');
      return;
    }

    this.alertService.question({ msg: '¿Quieres generar la reserva?', buttonText: 'Generar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          this.alertService.loading();

          // Adaptando fecha de entrega
          let fechaEntregaCompleta = this.dataReserva.fecha_entrega + ':' + this.dataReserva.hora_entrega;
          // this.dataReserva.fecha_entrega = fechaEntregaCompleta;

          // Adaptando fecha de alerta
          this.dataReserva.fecha_alerta = format(add(new Date(fechaEntregaCompleta), { hours: -Number(this.dataReserva.horas_antes) }), 'yyyy-MM-dd:HH:mm');

          // Agregando datos de cliente
          this.dataReserva.cliente = this.clienteSeleccionado._id;

          // Agregando productos
          this.dataReserva.productos = this.carro;

          let data = {
            ...this.dataReserva,
            cliente_descripcion: this.clienteSeleccionado.descripcion,
            creatorUser: this.authService.usuario.userId,
            updatorUser: this.authService.usuario.userId,
          }

          // Si no es una torta se anulan las observaciones
          if (this.dataReserva.tipo_observaciones !== 'Torta') {
            data.torta_relleno1 = '';
            data.torta_relleno2 = '';
            data.torta_relleno3 = '';
            data.torta_forma = '';
            data.torta_peso = 0;
            data.torta_cobertura = '';
            data.torta_detalles = '';
          }

          this.reservasService.nuevaReserva(data).subscribe({
            next: ({ reserva }) => {
              this.idReserva = reserva._id;
              this.completarVenta();
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
      fecha_alerta: '',
      horas_antes: '3',
      precio_total: 0,
      productos: [],
      adelanto: 0,
      observaciones: '',
      tipo_observaciones: 'General',
      torta_relleno1: '',
      torta_relleno2: '',
      torta_relleno3: '',
      torta_forma: '',
      torta_peso: null,
      torta_cobertura: '',
      torta_detalles: ''
    }
  }

  // Abrir completar venta
  abrirCompletarVenta(): void {

    // Verificacion -> DATOS DE RESERVA

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

    // Verificar adelanto
    if (this.dataReserva.adelanto <= 0 || !this.dataReserva.adelanto) {
      this.alertService.info('Debe colocar un monto de adelanto válido');
      return;
    }

    // Verificar monto de adelanto
    if (this.dataReserva.adelanto > this.dataReserva.precio_total) {
      this.alertService.info('La seña no puede ser superior al precio total');
      return;
    }

    if (this.dataReserva.adelanto < this.limite_adelanto) {
      this.alertService.info(`La seña no puede ser inferior a $${this.limite_adelanto}`);
      return;
    }

    this.vuelto = 0;
    this.pagaCon = null;
    this.metodoPagoUnico()
    this.comprobante = 'Normal';
    this.precio_total = this.dataReserva.adelanto;
    this.precio_total_limpio = this.dataReserva.adelanto;
    this.showCompletarVenta = true;
    this.showModalCompletando = false;

  }

  // Regresar a completar reserva
  regresarCompletarReserva(): void {
    this.showCompletarVenta = false;
    this.showModalCompletando = true;
  }

  // ---------------------------- VENTAS ---------------------------------------

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

    // Precio sin adicionales ni descuentos
    this.precio_total_limpio = this.dataService.redondear(this.dataReserva.adelanto, 2);

    if (this.formasPago.length === 0) {  // Forma de pago unica
      // Con adicional por credito => precio total + 10% : Sin adicional por credito
      this.formaPago === 'Crédito'
        ? this.precio_total = this.dataService.redondear(this.dataReserva.adelanto * 1.10, 2)
        : this.precio_total = this.dataService.redondear(this.dataReserva.adelanto, 2);
    } else { }

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

  // Agregar forma de pago
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

  // Calcular diferencia - Metodos de pago multiples
  calcularDiferencia(): void {

    let precioTotalTMP = this.precio_total;
    for (const elemento of this.formasPago) {
      precioTotalTMP = precioTotalTMP - elemento.valor;
    }

    this.formaPagoMonto = this.dataService.redondear(precioTotalTMP, 2);
    this.diferenciaPago = this.dataService.redondear(precioTotalTMP, 2);

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

  // Completar reserva
  completarVenta(): void {

    // Verificacion - Formas de pago multiples
    if (this.multiples_formasPago && this.formasPago.length === 0) { // Seleccionar al menos una forma de pago (Multiples formas de pago)
      this.alertService.info('Debe seleccionar una forma de pago');
      return;
    }

    if (this.multiples_formasPago && this.diferenciaPago !== 0) {
      this.alertService.info('Debe cubrir el precio total de la seña');
      return;
    }

    // Verificacion - PedidosYa
    if ((this.formaPago === 'PedidosYa' || this.formaPago === 'PedidosYa - Efectivo') && this.pedidosya_comprobante.trim() === '') {
      this.alertService.info('Colocar número de comprobante de PedidosYa');
      return;
    }

    let forma_pago: any[];

    this.alertService.loading();

    if (!this.multiples_formasPago) forma_pago = [{ descripcion: this.formaPago, valor: this.precio_total }];
    else if (this.multiples_formasPago) forma_pago = this.formasPago;

    const data = {
      sena: true,
      productos: [],
      precio_total: this.precio_total,
      precio_total_limpio: this.precio_total_limpio,
      comprobante: this.comprobante,
      pedidosya_comprobante: (this.formaPago === 'PedidosYa' || this.formaPago === 'PedidosYa - Efectivo') ? this.pedidosya_comprobante : '',
      forma_pago,
      adicional_credito: this.formaPago === 'Crédito' ? this.precio_total_limpio * 0.10 : 0,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    };

    // Generando venta
    this.ventasService.nuevaVenta(data).subscribe({
      next: ({ venta }) => {
            
        // Generando Relacion Venta -> Reserva
        this.ventasReservasService.nuevaRelacion({
          venta: venta._id,
          reserva: this.idReserva,
          instancia: 'Adelanto',
          creatorUser: this.authService.usuario.userId,
          updatorUser: this.authService.usuario.userId,
        }).subscribe({
          next: () => {
            this.productoSeleccionado = null;
            this.precio_total = 0;
            this.precio_total_limpio = 0;
            this.comprobante = 'Normal',
            this.productos = [];
            this.pagaCon = null;
            this.formaPago = 'Efectivo';
            this.vuelto = 0;
            this.pedidosya_comprobante = '';
            this.reiniciarReserva();
            this.dataService.alertaReservas();
            this.showCompletarVenta = false;
            this.metodoPagoUnico();
            window.open(`${base_url}/pdf/comprobante_reserva.pdf`, '_blank');
            this.alertService.success('Reserva generada correctamente');
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      
      },
      error: ({ error }) => {
        this.reservasService.eliminarReserva(this.idReserva).subscribe({
          next: () => { this.alertService.errorApi(error.message) }
        })
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

}
