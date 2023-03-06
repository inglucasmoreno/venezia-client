import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ClientesService } from 'src/app/services/clientes.service';
import { DataService } from 'src/app/services/data.service';
import { ProductosService } from 'src/app/services/productos.service';
import { ReservasService } from 'src/app/services/reservas.service';
import gsap from 'gsap';
import { ReservasProductosService } from 'src/app/services/reservas-productos.service';

@Component({
  selector: 'app-detalles-reservas',
  templateUrl: './detalles-reservas.component.html',
  styles: [
  ]
})
export class DetallesReservasComponent implements OnInit {

  // Flags
  public showModalAdelanto = false;
  public showModalCompletando = false;
  public showModalCliente = false;
  public showModalProductos = false;
  public showModalEditarProducto = false;
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
  public reserva: any = null;
  public faltaPagar = 0;
  public adelantoTMP = 0;
  public dataReserva = {
    cliente: '',
    fecha_reserva: format(new Date(), 'yyyy-MM-dd'),
    hora_entrega: '',
    fecha_entrega: format(new Date(), 'yyyy-MM-dd'),
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
      this.reservasService.getReserva(this.idReserva).subscribe({
        next: ({ reserva, productos }) => {
          this.reserva = reserva;
          this.clienteSeleccionado = reserva.cliente;
          this.carro = productos;
          this.dataReserva = {
            cliente: reserva.cliente._id,
            fecha_reserva: format(new Date(reserva.fecha_reserva), 'yyyy-MM-dd'),
            hora_entrega: reserva.hora_entrega,
            fecha_entrega: format(new Date(reserva.fecha_entrega), 'yyyy-MM-dd'),
            precio_total: reserva.precio_total,
            productos: productos,
            adelanto: reserva.adelanto,
            observaciones: reserva.observaciones
          }
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    });
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
    this.dataReserva.adelanto = this.dataReserva.precio_total * 0.5;
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

    const dataProducto = {
      reserva: this.idReserva,
      descripcion: this.productoSeleccionado.descripcion,
      unidad_medida_descripcion: this.productoSeleccionado.unidad_medida.descripcion,
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
      }, error: ({error}) => this.alertService.errorApi(error.message) 
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
            }, error: ({error}) => this.alertService.errorApi(error.message)
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
            }, error: ({error}) => this.alertService.errorApi(error.message)
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
      }, error: ({error}) => this.alertService.errorApi(error.message)
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

          console.log(this.dataReserva);

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

  actualizarAdelanto(): void {

    // Verificacion: Monto de adelanto valido
    if(!this.adelantoTMP || this.adelantoTMP < 0){
      this.alertService.info('Debe colocar un monto válido');
      return;
    }

    // Verificacion: Monto de adelanto supera precio total
    if(this.adelantoTMP > this.dataReserva.precio_total){
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

  // Actualizar fecha de entrega
  actualizarFechaEntrega(): void {
    this.alertService.loading();
    this.reservasService.actualizarReserva(this.idReserva, { fecha_entrega: this.dataReserva.fecha_entrega }).subscribe({
      next: () => {
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Actualizar hora de entrega
  actualizarHoraEntrega(): void {
    this.alertService.loading();
    this.reservasService.actualizarReserva(this.idReserva, { hora_entrega: this.dataReserva.hora_entrega }).subscribe({
      next: () => {
        this.alertService.close();
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
              this.alertService.close();
            }, error: ({error}) => this.alertService.errorApi(error.message)
          })
        }
      });
  }


}
