import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import gsap from 'gsap';
import { CajasService } from 'src/app/services/cajas.service';
import { AlertService } from 'src/app/services/alert.service';
import { IngresosGastosService } from 'src/app/services/ingresos-gastos.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styles: [
  ]
})
export class CajaComponent implements OnInit {

  // Flag
  public flagCajaCerrada: boolean = false;

  // Caja
  public valoresCaja: any;
  public efectivoEnCaja: number = 0;
  public efectivoEnCajaReal: number = null;
  public diferencia: number = 0;
  public tesoreria: number = null;
  public total_facturado: number = 0;
  public total_pedidosYa: number = 0;
  public cantidad_ventas: number = 0;
  
  // Shows - Flag mostrar
  public showFacturado: boolean = false;
  public showPostnet: boolean = false;
  public showModalSaldoInicial: boolean = false;
  public showModalIngresosGastos = false;

  // Saldo inicial de caja
  public saldoInicial: number = 0;
  public nuevoSaldo: number = 0;
  public saldoProximaCaja: number = 0;

  // Gastos/Ingresos
  public ingresos: any[] = [];
  public gastos: any[] = [];
  public totalIngresos: number = 0;
  public totalGastos: number = 0;
  public formIngresosGastos = {
    tipo: 'ingreso',
    descripcion: '',
    monto: null
  };


  constructor(private dataService: DataService,
              public authService: AuthService,
              private ingresosGastosService: IngresosGastosService,
              private alertService: AlertService,
              private cajasService: CajasService) { }

  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = "Dashboard - Cierre de caja";
    this.calculosIniciales();
  }

  // Calculos de valores de caja
  calculosIniciales(): void {
    this.alertService.loading();
    this.cajasService.calculosIniciales().subscribe({
      next: ({ valores }) => {
        const {
          total_ventas,
          total_postnet,
          totalGastos,
          totalIngresos,
          total_pedidosYa,
          cantidad_ventas,
          ingresos,
          gastos,
          saldoInicial,
          total_facturado
        } = valores;
        this.saldoInicial = saldoInicial;

        this.efectivoEnCaja = saldoInicial + total_ventas + totalIngresos  - total_postnet - totalGastos - total_pedidosYa;
        this.total_facturado = total_facturado,
        this.valoresCaja = valores;
        this.total_pedidosYa = total_pedidosYa,
        this.ingresos = ingresos;
        this.cantidad_ventas = cantidad_ventas;
        this.gastos = gastos;
        this.totalGastos = totalGastos;
        this.totalIngresos = totalIngresos;
        this.showModalSaldoInicial = false;
        this.showModalIngresosGastos = false;
        this.calculosFinales();
      
        if(this.flagCajaCerrada){
          this.flagCajaCerrada = false;
          this.alertService.success('Cierre de caja correcto');
        }else{
          this.alertService.close();
        }
      
      },
      error: ({error}) => this.alertService.errorApi(error.message)
    });
  }

  // Cierre de caja
  cierreDeCaja(): void {

    // Verficacion de monto real en caja
    if(this.efectivoEnCajaReal === null || this.efectivoEnCajaReal <= 0){
      this.alertService.info('Debe colocar un monto real en caja');
      return;
    }

    // Valor a tesoreria
    if(this.tesoreria < 0){
      this.alertService.info('Debe colocar un monto correcto para tesoreria');
      return;
    }

    // Cierre de caja
    this.alertService.question({ msg: 'Generando cierre de caja', buttonText: 'Completar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {

            this.alertService.loading();

            // Generacion de datos finales
            const data = {
              saldo_inicial: this.saldoInicial,
              saldo_proxima_caja: this.dataService.redondear(this.saldoProximaCaja, 2),
              total_ventas: this.valoresCaja.total_ventas,
              total_efectivo_en_caja: this.efectivoEnCaja,
              total_efectivo_en_caja_real: this.efectivoEnCajaReal,
              total_facturado: this.total_facturado,
              total_balanza: this.valoresCaja.total_balanza,
              total_no_balanza: this.valoresCaja.total_no_balanza,
              otros_ingresos: this.totalIngresos,
              otros_gastos: this.totalGastos,
              total_credito: this.valoresCaja.total_credito,
              total_mercadopago: this.valoresCaja.total_mercadopago,
              cantidad_ventas: this.cantidad_ventas,
              total_debito: this.valoresCaja.total_debito,
              total_efectivo: this.valoresCaja.total_efectivo,
              total_adicional_credito: this.valoresCaja.total_adicional_credito,
              total_pedidosYa: this.total_pedidosYa,
              tesoreria: this.tesoreria === null ? 0 : this.tesoreria, 
              diferencia: this.diferencia,
              gastos: this.gastos,
              ingresos: this.ingresos,
              creatorUser: this.authService.usuario.userId,
              updatorUser: this.authService.usuario.userId,
            }

            this.cajasService.nuevaCaja(data).subscribe({
              next: () => {
                this.efectivoEnCajaReal = null;
                this.tesoreria = null;
                this.flagCajaCerrada = true;
                this.calculosIniciales();
              },
              error: ({error}) => this.alertService.errorApi(error.message)
            }) 
          }

        });

  }

  // Abrir modal: Ingresos y Gastos
  abrirModalIngresosGastos(tipo: string): void {
    window.scrollTo(0,0);
    if(tipo === 'crear'){
      this.formIngresosGastos.monto = null;
      this.formIngresosGastos.descripcion = '';
      this.formIngresosGastos.tipo = 'ingreso';
    }else{

    }
    this.showModalIngresosGastos = true;
  }

  // Nuevo Ingreso/Gasto
  nuevoIngresoGasto(): void {

    const { descripcion, monto } = this.formIngresosGastos;

    if(descripcion.trim() === '' || monto === null){
      this.alertService.info('Completar los campos obligatorios');
      return;
    }

    this.alertService.loading();

    const data = {
      ...this.formIngresosGastos,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId,
    }

    this.ingresosGastosService.nuevoIngresoGasto(data).subscribe({
      next: () => this.calculosIniciales(),
      error: ({error}) => this.alertService.errorApi(error.message) 
    });
  }

  // Eliminar Ingreso/Gasto
  eliminarIngresoGasto(ingreso: any): void {
    this.alertService.question({ msg: 'Eliminando elemento', buttonText: 'Eliminar' })
        .then(({isConfirmed}) => {  
          if (isConfirmed) {
            this.alertService.loading();
            this.ingresosGastosService.eliminarIngresoGasto(ingreso._id).subscribe({
              next: () => this.calculosIniciales(),
              error: ({error}) => this.ingresosGastosService.eliminarIngresoGasto(error.message)
            }); 
          }
        });
  }

  // Abrir modal: Actualizar saldo inicial
  abrirModalSaldoInicial(): void {
    window.scrollTo(0,0);
    this.nuevoSaldo = this.saldoInicial;
    this.showModalSaldoInicial = true;
  }

  // Actualizar saldo inicial de caja
  actualizarSaldoInicial(): void {

    if(this.nuevoSaldo === null || this.nuevoSaldo < 0){
      this.alertService.info('Debe colocar un monto correcto');
      return;
    }

    this.alertService.loading();

    const data = {
      monto: this.nuevoSaldo,
      updatorUser: this.authService.usuario.userId
    }

    this.cajasService.actualizarSaldoInicial(data).subscribe({
      next: () => this.calculosIniciales(),
      error: ({error}) => this.alertService.errorApi(error.message)
    
    });           

  }

  calculosFinales(): void {
    this.diferencia = this.efectivoEnCajaReal - this.efectivoEnCaja; 
    this.saldoProximaCaja = this.efectivoEnCajaReal - this.tesoreria;
  }

}
