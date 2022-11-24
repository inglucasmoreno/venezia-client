import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasService } from 'src/app/services/mayoristas.service';
import { VentasMayoristasService } from 'src/app/services/ventas-mayoristas.service';

@Component({
  selector: 'app-nuevo-cobro-mayorista',
  templateUrl: './nuevo-cobro-mayorista.component.html',
  styles: [
  ]
})
export class NuevoCobroMayoristaComponent implements OnInit {
  
  // Modal
  public showModalParcial = false;

  // Cobro parcial
  public montoParcial: number = null;

  // Pedidos
  public pedidos: any[] = [];
  public pedidoSeleccionado: any = null;
  public datosDeuda: any = null;
  public totalACobrar: number = 0;

  // Mayoristas
  public mayoristas: any[] = [];
  public mayorista: string = '';
  public mayoristaSeleccionado: any = null;

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
    public authServoce: AuthService,
    private alertService: AlertService,
    private mayoristasService: MayoristasService,
    private ventasMayoristasService: VentasMayoristasService 
  ) { }

  ngOnInit(): void {
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
        console.log(respuesta);
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
            console.log(datosDeuda);
            console.log(this.pedidos);
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
      if(pedido.tipo_cobro === 'Total') cobrarTMP = pedido.deuda_monto;
      if(pedido.tipo_cobro === 'Parcial') cobrarTMP = pedido.monto_parcial;
    })   
    this.totalACobrar = cobrarTMP;
  }

  // Seleccionar pedido
  seleccionarPedido(pedido: any, tipo, monto = 0): void {
    pedido.tipo_cobro = tipo;
    pedido.monto_parcial = monto;
    // pedido.seleccionado ? pedido.seleccionado = false : pedido.seleccionado = true;
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

    this.calcularTotalACobrar();
    this.showModalParcial = false;
  
  }

  // Regresar a mayoristas
  regresarMayoristas(): void {
    this.mayoristaSeleccionado = null;
  }

  // Completar cobro
  completarCobro(): void {
    this.alertService.question({ msg: 'Completando cobro', buttonText: 'Completar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {

          // Completar cobro

        }
      });
  }

}
