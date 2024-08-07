import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { VentasReservasService } from 'src/app/services/ventas-reservas.service';
import { VentasService } from 'src/app/services/ventas.service';
import { environment } from 'src/environments/environment';

const base_url = environment.base_url;

@Component({
  selector: 'app-ventas-activas',
  templateUrl: './ventas-activas.component.html',
  styles: [
  ]
})
export class VentasActivasComponent implements OnInit {

  // Items limitados
  public itemsFormaPagoLimitada: string[] = [
    'Efectivo',
    'Débito',
    'Mercado pago',
  ]

  public itemsFormaPagoCompleta: string[] = [
    'Efectivo',
    'Crédito',
    'Débito',
    'Mercado pago',
    'PedidosYa',
    'PedidosYa - Efectivo'
  ]

  // Items formas de pago
  public itemsFormasPago: string[] = [];

  public nuevaForma: string = 'Efectivo';
  public nuevoNroComprobante: string = '';

  // Modals
  public showModalDetalle = false;
  public showModalEditarFormasPago = false;

  // Permisos de usuarios login
  public permisos = { all: false };

  // Venta
  public idVenta: string = '';
  public ventas: any = [];
  public ventaSeleccionada: any;
  public descripcion: string = '';
  public montoTotal: number = 0;
  public montoTotalFacturado: number = 0;
  public montoTotalPedidosYa: number = 0;
  public montoTotalPedidosYaEfectivo: number = 0;
  public montoTotalPedidosYaApp: number = 0;
  public productos: any[] = [];

  // Relacion venta -> reserva
  public ventaReserva: any = null;

  // Formas de pago - Edicion
  public formaPagoSeleccionada: any = {};

  // Paginacion
  public totalItems: number;
  public desde: number = 0;
  public paginaActual: number = 1;
  public cantidadItems: number = 10;

  // Filtrado
  public filtro = {
    facturacion: '',
    pedidosYa: '',
    parametro: '',
  }

  // Ordenar
  public ordenar = {
    direccion: -1,  // Asc (1) | Desc (-1)
    columna: 'createdAt'
  }

  constructor(
    private ventasService: VentasService,
    private ventasReservasService: VentasReservasService,
    public authService: AuthService,
    private alertService: AlertService,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.dataService.ubicacionActual = 'Dashboard - Ventas activas';
    this.permisos.all = this.permisosUsuarioLogin();
    this.alertService.loading();
    this.listarVentas();
  }

  // Asignar permisos de usuario login
  permisosUsuarioLogin(): boolean {
    return this.authService.usuario.permisos.includes('VENTAS_HISTORIAL_ALL') || this.authService.usuario.role === 'ADMIN_ROLE';
  }

  // Listar ventas
  listarVentas(): void {
    this.ventasService.listarVentas(
      this.ordenar.direccion,
      this.ordenar.columna,
      this.desde,
      this.cantidadItems,
      'true',
      this.filtro.parametro,
      '',
      '',
      this.filtro.facturacion,
      this.filtro.pedidosYa
    )
      .subscribe(({
        ventas,
        totalItems,
        totalVentas,
        totalFacturado,
        totalPedidosYa,
        totalPedidosYaOnline,
        totalPedidosYaEfectivo
      }) => {
        this.ventas = ventas;
        console.log(this.ventas);
        this.montoTotalPedidosYa = totalPedidosYa,
          this.totalItems = totalItems;
        this.montoTotalFacturado = totalFacturado;
        this.montoTotal = totalVentas;
        this.montoTotalPedidosYaApp = totalPedidosYaOnline;
        this.montoTotalPedidosYaEfectivo = totalPedidosYaEfectivo;
        this.showModalDetalle = false;
        // this.calculoMontoTotal();
        this.alertService.close();
      }, (({ error }) => {
        this.alertService.errorApi(error.msg);
      }));
  }


  // Actualizar estado Activo/Inactivo
  actualizarEstado(venta: any): void {

    const { _id, activo } = venta;

    if (!this.permisos.all) return this.alertService.info('Usted no tiene permiso para realizar esta acción');

    this.alertService.question({ msg: '¿Quieres actualizar el estado?', buttonText: 'Actualizar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.ventasService.actualizarVenta(_id, { activo: !activo }).subscribe(() => {
            this.alertService.loading();
            this.listarVentas();
          }, ({ error }) => {
            this.alertService.close();
            this.alertService.errorApi(error.message);
          });
        }
      });

  }

  // Facturacion electronica
  facturacionElectronica(): void {
    this.alertService.question({ msg: 'Facturación electrónica', buttonText: 'Facturar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          const { _id, precio_total } = this.ventaSeleccionada;
          this.alertService.loading();
          this.ventasService.actualizarFacturacion(_id, { precio_total, updatorUser: this.authService.usuario.userId }).subscribe({
            next: () => {
              this.listarVentas();
            },
            error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Calculo de monto total
  // calculoMontoTotal(): void {
  //   let montoTotalTMP = 0;
  //   let montoTotalFacturadoTMP = 0;
  //   let montoTotalPedidosYaTMP = 0;
  //   let montoTotalPedidosYaEfectivoTMP = 0;
  //   let montoTotalPedidosYaAppTMP = 0;
  //   this.ventas.map((venta: any) => {
  //     montoTotalTMP += venta.precio_total;
  //     if(venta.comprobante === 'Fiscal') montoTotalFacturadoTMP += venta.precio_total;
  //     if(venta.forma_pago[0].descripcion === 'PedidosYa' || venta.forma_pago[0].descripcion === 'PedidosYa - Efectivo') montoTotalPedidosYaTMP += venta.precio_total;
  //     if(venta.forma_pago[0].descripcion === 'PedidosYa') montoTotalPedidosYaAppTMP += venta.precio_total;
  //     if(venta.forma_pago[0].descripcion === 'PedidosYa - Efectivo') montoTotalPedidosYaEfectivoTMP += venta.precio_total;
  //   });
  //   this.montoTotal = montoTotalTMP;
  //   this.montoTotalFacturado = montoTotalFacturadoTMP;
  //   this.montoTotalPedidosYa = montoTotalPedidosYaTMP;
  //   this.montoTotalPedidosYaEfectivo = montoTotalPedidosYaEfectivoTMP;
  //   this.montoTotalPedidosYaApp = montoTotalPedidosYaAppTMP;
  // }

  // Abrir modal - Editar formas de pago
  abrirEditarFormasPago(formaPago): void {
    if(this.ventaSeleccionada.forma_pago.length > 1) this.itemsFormasPago = this.itemsFormaPagoLimitada;
    else this.itemsFormasPago = this.itemsFormaPagoCompleta;
    this.nuevaForma = 'Efectivo';
    this.nuevoNroComprobante = '';
    this.formaPagoSeleccionada = formaPago;
    this.showModalEditarFormasPago = true;
    this.showModalDetalle = false;
  }

  // Cerrar modal - Editar formas de pago
  cerrarEditarFormasPago(): void {
    this.showModalEditarFormasPago = false;
    this.showModalDetalle = true;
  }

  // Actualizando forma de pago
  actualizandoFormaPago(): void {

    let error = false;

    // Verificacion: Forma de pago cargada
    this.ventaSeleccionada.forma_pago.map( elemento => {
      if(elemento.descripcion === this.nuevaForma && elemento.descripcion !== this.formaPagoSeleccionada.descripcion) error = true;
    } );

    if(error){
      this.alertService.info('La forma de pago ya se encuentra cargada');
      return;
    }

    // Verificacion: Falta numero de comprobante
    if((this.nuevaForma === 'PedidosYa' || this.nuevaForma === 'PedidosYa - Efectivo') && this.nuevoNroComprobante === ''){
      this.alertService.info('Debe colocar un número de comprobante');
      return;
    }

    this.formaPagoSeleccionada.descripcion = this.nuevaForma;

    let data = {};

    // Data de modificacion
    if(this.nuevaForma === 'PedidosYa' || this.nuevaForma === 'PedidosYa - Efectivo'){
      data = { forma_pago: this.ventaSeleccionada.forma_pago, pedidosya_comprobante: this.nuevoNroComprobante };
      this.ventaSeleccionada.pedidosya_comprobante = this.nuevoNroComprobante;
    }else{
      data = { forma_pago: this.ventaSeleccionada.forma_pago, pedidosya_comprobante: this.nuevoNroComprobante };
      this.ventaSeleccionada.pedidosya_comprobante = '';
    }

    this.alertService.loading();
    this.ventasService.actualizarVenta(this.ventaSeleccionada._id, data).subscribe({
      next: () => {
        this.showModalEditarFormasPago = false;
        this.showModalDetalle = true;
        this.listarVentas();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Abrir modal - Detalles de venta
  abrirModalDetalles(venta: any): void {
    this.ventaReserva = null;
    this.alertService.loading();
    this.ventasService.getVenta(venta._id).subscribe(({ venta, productos }) => {
      this.ventasReservasService.getRelacionPorVenta(venta._id).subscribe({
        next: ({ relacion }) => {
          this.ventaReserva = relacion;
          this.ventaSeleccionada = venta;
          this.productos = productos;
          this.showModalDetalle = true;
          this.alertService.close();
        }, error: ({ error }) => this.alertService.errorApi(error.message)
      })
    }, ({ error }) => {
      this.alertService.errorApi(error);
    });
  }

  // Generacion de PDF
  comprobanteElectronico(venta: any): void {
    this.alertService.loading();
    this.ventasService.getComprobante(venta._id).subscribe({
      next: () => {
        window.open(`${base_url}/pdf/comprobante.pdf`, '_blank');
        this.alertService.close();
      },
      error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Ordenar por columna
  ordenarPorColumna(columna: string) {
    this.ordenar.columna = columna;
    this.ordenar.direccion = this.ordenar.direccion == 1 ? -1 : 1;
    this.alertService.loading();
    this.listarVentas();
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
    this.listarVentas();
  }

}
