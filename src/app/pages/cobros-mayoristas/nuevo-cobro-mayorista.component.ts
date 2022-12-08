import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CobrosMayoristasService } from 'src/app/services/cobros-mayoristas.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import { VentasMayoristasService } from 'src/app/services/ventas-mayoristas.service';
import gsap from 'gsap';
import { VentasMayoristasProductosService } from 'src/app/services/ventas-mayoristas-productos.service';
import { format } from 'date-fns';

@Component({
  selector: 'app-nuevo-cobro-mayorista',
  templateUrl: './nuevo-cobro-mayorista.component.html',
  styles: [
  ]
})
export class NuevoCobroMayoristaComponent implements OnInit {
  
  // Modal
  public showModalParcial = false;
  public showModalCompletarCobro = false;
  public showModalDetallesPedido = false;

  // Cobro parcial
  public montoParcial: number = null;

  // Pedidos
  public pedidos: any[] = [];
  public pedidoSeleccionado: any = null;
  public datosDeuda: any = null;
  public totalACobrar: number = 0;
  public carro_cobro: any[] = [];
  public productos: any[] = [];

  // Mayoristas
  public mayoristas: any[] = [];
  public mayorista: string = '';
  public mayoristaSeleccionado: any = null;

  // Repartidores
  public repartidores: any[] = [];
  public repartidor: string = '';

  // INPUTS
  public fechaCobro = format(new Date(), 'yyyy-MM-dd');
  public inputMontoACobrar = null;

  public filtro = {
    direccion: -1,
    columna: 'createdAt',
  }

  public paginacion = {
    desde: 0,
    registerpp: 1000000
  }

  constructor(
    private dataService: DataService,
    public authService: AuthService,
    private usuariosService: UsuariosService,
    private cobrosService: CobrosMayoristasService,
    public authServoce: AuthService,
    private alertService: AlertService,
    private mayoristasService: MayoristasService,
    private ventasMayoristasService: VentasMayoristasService, 
    private pedidosProductosService: VentasMayoristasProductosService
  ) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Generando cobro'
    this.alertService.loading();
    this.listarMayoristas();
  }

  // Listar mayoristas
  listarMayoristas(): void {
    this.mayoristasService.listarMayoristas().subscribe({
      next: ({ mayoristas }) => {
        this.mayoristas = mayoristas.filter( mayorista => mayorista.activo );
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })  
  }

  // Listar deuda del mayorista
  listarDeudas(): void {
    this.alertService.loading();
    this.ventasMayoristasService.listarVentas().subscribe({
      next: (respuesta) => {
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Seleccionar mayorista
  seleccionarMayorista(): void {
  
    // Verificacion: Seleccion de mayorista
    if(this.mayorista.trim() === ''){
      this.alertService.info('Debe seleccionar un mayorista');
      return;
    }
    
    this.alertService.loading();

    // Buscar datos de mayoristas
    this.mayoristasService.getMayorista(this.mayorista).subscribe({
      next: ({ mayorista }) => {
        this.mayoristaSeleccionado = mayorista;

        // Datos de deudas
        this.ventasMayoristasService.listarVentas(
          this.filtro.direccion,
          this.filtro.columna,
          this.paginacion.desde,
          this.paginacion.registerpp,
          'Deuda',
          '',
          '',
          mayorista._id,
          '',
          ''
        ).subscribe({
          next: (datosDeuda) => {
            this.pedidos = [];
            this.datosDeuda = datosDeuda;
            datosDeuda.ventas.map( venta => {
              venta.tipo_cobro = 'Nada';
              venta.monto_parcial = 0;
              this.pedidos.push(venta);  
            })
            this.alertService.close();
          }, error: ({error}) => this.alertService.errorApi(error.message)
        })
      }, error: ({error}) => this.alertService.errorApi(error.message) 
    })
  
  }

  // Calcular precio total
  calcularTotalACobrar(): void {
    let cobrarTMP = 0;
    this.pedidos.map( pedido => {
      if(pedido.tipo_cobro === 'Total') cobrarTMP += pedido.deuda_monto;
      if(pedido.tipo_cobro === 'Parcial') cobrarTMP += pedido.monto_parcial;
    })   
    this.totalACobrar = cobrarTMP;
  }

  // Seleccionar pedido
  seleccionarPedido(pedido: any, tipo, monto = 0): void {

    pedido.tipo_cobro = tipo;
    pedido.monto_parcial = monto;

    if(tipo === 'Nada') this.accionCarro(pedido, 'eliminar');
    else this.accionCarro(pedido, 'agregar');

    this.calcularTotalACobrar();

  }

  // Abrir cobro parcial
  abrirCobroParcial(pedido: any): void {
    this.pedidoSeleccionado = pedido;
    this.montoParcial = null;
    this.showModalParcial = true;
  }

  // Cobrar parcialmente
  cobroParcial(): void {
    
    // Verificacion - Monto válido
    if(this.montoParcial <= 0){
      this.alertService.info('Debe colocar un monto válido');
      return;
    }

    // Verificacion - Exceso de cobro
    if(this.pedidoSeleccionado.deuda_monto < this.montoParcial){
      this.alertService.info('No se puede exceder el monto de deuda');
      return;
    }

    if(this.montoParcial === this.pedidoSeleccionado.deuda_monto){
      this.pedidoSeleccionado.tipo_cobro = 'Total';
    }else{
      this.pedidoSeleccionado.tipo_cobro = 'Parcial';
      this.pedidoSeleccionado.monto_parcial = this.montoParcial;
    }

    this.accionCarro(this.pedidoSeleccionado, 'agregar');

    this.calcularTotalACobrar();
    this.showModalParcial = false;
  
  }

  // Regresar a mayoristas
  regresarMayoristas(): void {
    this.mayoristaSeleccionado = null;
  }

  // Abrir completar cobro
  abrirCompletarCobro(): void {

    this.fechaCobro = format(new Date(), 'yyyy-MM-dd');

    // Se listan los repartidores
    this.alertService.loading();
    this.usuariosService.listarUsuarios().subscribe({
      next: ({usuarios}) => {
        this.repartidores = usuarios.filter( usuario => usuario.role === 'DELIVERY_ROLE' );
        this.inputMontoACobrar = this.totalACobrar;
        this.showModalCompletarCobro = true;
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })

  }

  // Completar cobro
  completarCobro(): void {

    // Verificacion: Monto inválido
    if(!this.inputMontoACobrar){
      this.alertService.info('Debe colocar un monto válido');
      return;
    }

    // Verificacion: Monto a cobrar < Monto total
    if(this.inputMontoACobrar < this.totalACobrar){
      this.alertService.info('El monto a cobrar no puede ser inferior al total');
      return;
    }

    // Completar cobro
    this.alertService.question({ msg: 'Completando cobro', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          const data: any = {
            fecha_cobro: this.fechaCobro,
            tipo: this.totalACobrar === 0 ? 'Anticipo' : 'Cobro',
            mayorista: this.mayoristaSeleccionado._id,
            repartidor: this.repartidor,
            pedidos: this.totalACobrar === 0 ? [] : this.carro_cobro,
            anticipo: this.inputMontoACobrar - this.totalACobrar,
            monto: this.inputMontoACobrar,
            monto_total: this.totalACobrar,
            creatorUser: this.authService.usuario.userId,
            updatorUser: this.authService.usuario.userId
          };
          this.cobrosService.nuevoCobro(data).subscribe({
            next: () => {
              this.carro_cobro = [];
              this.pedidoSeleccionado = null;
              this.mayorista = '';
              this.mayoristaSeleccionado = null;
              this.totalACobrar = 0;
              this.showModalCompletarCobro = false;
              this.alertService.close();
            }, error: ({error}) => this.alertService.errorApi(error.message)
          })
        }
      });
  }

  // Carro de cobro
  accionCarro(pedido: any, accion: string): void {
    if(accion === 'agregar'){
      this.carro_cobro.push({
        mayorista: this.mayoristaSeleccionado._id,
        cobro: '',
        pedido: pedido._id,
        cancelado: pedido.tipo_cobro === 'Total' ? true : false,
        monto_total: pedido.precio_total,
        monto_deuda: pedido.deuda_monto,
        monto_cobrado: pedido.tipo_cobro === 'Total' ? pedido.deuda_monto : pedido.monto_parcial,
        creatorUser: this.authService.usuario.userId,
        updatorUser: this.authService.usuario.userId,
      });
    }else if(accion === 'eliminar'){
      this.carro_cobro = this.carro_cobro.filter( elemento => elemento.pedido !== pedido._id )
    }

  }

  // Abrir detalles de pedido
  abrirDetallesPedido(pedido: any): void {
    this.alertService.loading();
    this.pedidoSeleccionado = pedido;
    this.pedidosProductosService.listarProductos(1,'descripcion',this.pedidoSeleccionado._id).subscribe({
      next: ({productos}) => {
        this.productos = productos;
        this.showModalDetallesPedido = true;
        this.alertService.close();
      }, error: ({error}) => this.alertService.errorApi(error.message)
    })
  }

  // Cerrar detalles de pedido
  cerrarDetallesPedido(): void {
    this.showModalDetallesPedido = false;
  }


}
