import { Component, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { CajasMayoristasService } from 'src/app/services/cajas-mayoristas.service';
import { DataService } from 'src/app/services/data.service';
import { MayoristasGastosService } from 'src/app/services/mayoristas-gastos.service';
import { MayoristasIngresosService } from 'src/app/services/mayoristas-ingresos.service';
import { MayoristasTiposGastosService } from 'src/app/services/mayoristas-tipos-gastos.service';
import { MayoristasTiposIngresosService } from 'src/app/services/mayoristas-tipos-ingresos.service';
import { UsuariosService } from 'src/app/services/usuarios.service';
import gsap from 'gsap';

@Component({
  selector: 'app-cajas-mayoristas',
  templateUrl: './cajas-mayoristas.component.html',
  styleUrls: []
})
export class CajasMayoristasComponent implements OnInit {

  // Fecha caja
  public fecha_caja = format(new Date(), 'yyyy-MM-dd');

  // Modals
  public showModalGasto: boolean = false;
  public showModalIngreso: boolean = false;

  // Repartidores
  public repartidores: any[] = [];
  public repartidor: any = '';

  // Elemento -> Gasto
  public dataGasto: any = {
    tipo_gasto: '',
    repartidor: '',
    monto: null,
    creatorUser: this.authService.usuario.userId,
    updatorUser: this.authService.usuario.userId,
  }

  // Elemento -> Ingreso
  public dataIngreso: any = {
    tipo_ingreso: '',
    repartidor: '',
    monto: null,
    creatorUser: this.authService.usuario.userId,
    updatorUser: this.authService.usuario.userId,
  }

  // Gastos
  public tipos_gastos: any[] = [];
  public gastos: any[] = [];
  public total_gastos: number = 0;

  // Ingresos
  public tipos_ingresos: any[] = [];
  public ingresos: any[] = [];
  public total_ingresos: number = 0;

  // Cobros
  public cobros: any[] = [];

  // Caja
  public caja: any = {};
  public total_recibido = 0;
  public montoReal = null;
  public diferencia = 0;
  public montoCintia = null;
  public total_final = 0;
  public total_cobros = 0;

  constructor(
    public authService: AuthService,
    private dataService: DataService,
    private alertService: AlertService,
    private tiposGastosService: MayoristasTiposGastosService,
    private tiposIngresosService: MayoristasTiposIngresosService,
    private mayoristasGastosService: MayoristasGastosService,
    private mayoristasIngresosService: MayoristasIngresosService,
    private cajasMayoristasService: CajasMayoristasService,
    private usuariosService: UsuariosService
  ) { }

  // Inicio de componente
  ngOnInit(): void {
    gsap.from('.gsap-contenido', { y: 100, opacity: 0, duration: .2 });
    this.dataService.ubicacionActual = 'Dashboard - Cajas mayoristas';
    this.alertService.loading();
    this.calculosIniciales();
  }

  // Calculos iniciales
  calculosIniciales(): void {
    this.usuariosService.listarUsuarios().subscribe({
      next: ({ usuarios }) => {
        this.repartidores = usuarios.filter(usuario => usuario.role === 'DELIVERY_ROLE');
        this.cajasMayoristasService.calculosIniciales(this.repartidor).subscribe({
          next: ({ datos, gastos, ingresos, total_ingresos, total_gastos, total_recibido, cobros, total_cobros }) => {
            this.caja = datos;
            this.gastos = gastos;
            this.ingresos = ingresos;
            this.total_ingresos = total_ingresos;
            this.total_gastos = total_gastos;
            this.total_recibido = total_recibido;
            this.cobros = cobros;
            this.total_cobros = total_cobros;
            console.log(total_cobros);
            console.log(cobros);
            this.calculos();
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nuevo gasto
  nuevoGasto(): void {

    // Verificacion: Tipo de gasto
    if (this.dataGasto.tipo_gasto.trim() === '') {
      this.alertService.info('Debe seleccionar un tipo de gasto');
      return;
    }

    // Verificacion: Monto invalido
    if (this.dataGasto.monto === null || this.dataGasto.monto < 0) {
      this.alertService.info('Debe colocar un monto válido');
      return;
    }

    // Verificacion: Repartidor
    if (this.dataGasto.repartidor.trim() === '') {
      this.alertService.info('Debe seleccionar un repartidor');
      return;
    }

    this.alertService.loading();
    this.mayoristasGastosService.nuevoGasto(this.dataGasto).subscribe({
      next: () => {
        this.showModalGasto = false;
        this.dataGasto = {
          tipo_gasto: '',
          repartidor: '',
          monto: null,
          creatorUser: this.authService.usuario.userId,
          updatorUser: this.authService.usuario.userId
        }
        this.calculosIniciales();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nuevo ingreso
  nuevoIngreso(): void {

    // Verificacion: Tipo de ingreso
    if (this.dataIngreso.tipo_ingreso.trim() === '') {
      this.alertService.info('Debe seleccionar un tipo de ingreso');
      return;
    }

    // Verificacion: Monto invalido
    if (this.dataIngreso.monto === null || this.dataIngreso.monto < 0) {
      this.alertService.info('Debe colocar un monto válido');
      return;
    }

    // Verificacion: Repartidor
    if (this.dataIngreso.repartidor.trim() === '') {
      this.alertService.info('Debe seleccionar un repartidor');
      return;
    }

    this.alertService.loading();
    this.mayoristasIngresosService.nuevoIngreso(this.dataIngreso).subscribe({
      next: () => {
        this.showModalIngreso = false;
        this.calculosIniciales();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Abrir modal -> Nuevo gasto
  abrirNuevoGasto(): void {
    this.alertService.loading();
    this.tiposGastosService.listarTipos().subscribe({
      next: ({ tipos }) => {
        this.tipos_gastos = tipos.filter(tipo => tipo.activo);
        this.showModalGasto = true;
        this.dataGasto = {
          tipo_gasto: '',
          repartidor: '',
          monto: null,
          creatorUser: this.authService.usuario.userId,
          updatorUser: this.authService.usuario.userId
        }
        this.alertService.close()
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Abrir modal -> Nuevo ingreso
  abrirNuevoIngreso(): void {
    this.alertService.loading();
    this.tiposIngresosService.listarTipos().subscribe({
      next: ({ tipos }) => {
        this.tipos_ingresos = tipos.filter(tipo => tipo.activo);
        this.dataIngreso = {
          tipo_ingreso: '',
          repartidor: '',
          monto: null,
          creatorUser: this.authService.usuario.userId,
          updatorUser: this.authService.usuario.userId
        }
        this.showModalIngreso = true;
        this.alertService.close()
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Cargar datos de caja
  cargarDatosCaja(): void {
    this.alertService.loading();
    this.cajasMayoristasService.calculosIniciales(this.repartidor).subscribe({
      next: ({ datos, gastos, ingresos, total_ingresos, total_gastos, total_recibido, cobros, total_cobros }) => {
        this.caja = datos;
        this.gastos = gastos;
        this.ingresos = ingresos;
        this.total_ingresos = total_ingresos;
        this.total_gastos = total_gastos;
        this.total_recibido = total_recibido;
        this.cobros = cobros;
        this.total_cobros = total_cobros;
        this.alertService.close();
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Eliminar gasto
  eliminarGasto(idGasto): void {
    this.alertService.question({ msg: 'Eliminando gasto', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.mayoristasGastosService.eliminarGasto(idGasto).subscribe(() => {
            this.alertService.loading();
            this.calculosIniciales();
          }, ({ error }) => this.alertService.errorApi(error.message));
        }
      });
  }

  // Eliminar ingreso
  eliminarIngreso(idIngreso): void {
    this.alertService.question({ msg: 'Eliminando ingreso', buttonText: 'Eliminar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.mayoristasIngresosService.eliminarIngreso(idIngreso).subscribe(() => {
            this.alertService.loading();
            this.calculosIniciales();
          }, ({ error }) => this.alertService.errorApi(error.message));
        }
      });
  }

  // Calcular diferencia
  calculos(): void {
    this.diferencia = this.montoReal - this.total_recibido;
    this.total_final = this.montoReal - this.montoCintia;
  }

  // Cerrar caja
  cerrarCaja(): void {

    // Verificacion: Fecha de caja
    if (!this.fecha_caja) {
      this.alertService.info('Debe colocar un fecha válida para la caja');
      return;
    }

    // Verificacion: Total real recibido
    if (this.montoReal === null || this.montoReal < 0) {
      this.alertService.info('Debe colocar un total real válido');
      return;
    }

    // Verificacion: Monto cintia
    if (this.montoCintia === null || this.montoCintia < 0) {
      this.alertService.info('Debe colocar un monto cintia válido');
      return;
    }

    // Se arma la data de cierre de caja

    // Adaptando gastos

    let gastosTMP = [];

    this.gastos.map(gasto => {

      gastosTMP.push({
        tipo: gasto.tipo_gasto.descripcion,
        monto: gasto.monto,
        repartidor: `${gasto.repartidor.apellido} ${gasto.repartidor._id !== '000000000000000000000000' ? gasto.repartidor.nombre : ''}`.trim()
      })
    })

    // Adaptando ingresos

    let ingresosTMP = [];

    this.ingresos.map(ingreso => {
      ingresosTMP.push({
        tipo: ingreso.tipo_ingreso.descripcion,
        monto: ingreso.monto,
        repartidor: `${ingreso.repartidor.apellido} ${ingreso.repartidor._id !== '000000000000000000000000' ? ingreso.repartidor.nombre : ''}`.trim()
      })
    })

    this.cobros.map(cobro => {
      ingresosTMP.push({
        tipo: `COBRO NRO ${cobro.nro}`,
        monto: cobro.monto,
        repartidor: `${cobro.repartidor.apellido} ${cobro.repartidor._id !== '000000000000000000000000' ? cobro.repartidor.nombre : ''}`.trim()
      })
    })

    const data = {
      fecha_caja: this.fecha_caja,
      cantidad_ventas: this.caja.cantidad_pedidos,
      total_ventas: this.caja.total_pedidos,
      total_anticipos: this.caja.total_anticipos,
      total_cuentas_corrientes: this.caja.total_cuentas_corrientes,
      total_deuda: this.caja.total_deuda,
      monto_a_recibir: this.caja.total_recibido,
      total_otros_ingresos: this.total_ingresos,
      total_otros_gastos: this.total_gastos,
      ingresos: ingresosTMP,
      gastos: gastosTMP,
      total_recibido: this.total_recibido,
      total_recibido_real: this.montoReal,
      monto_cintia: this.montoCintia,
      diferencia: this.diferencia,
      total_final: this.total_final,
      creatorUser: this.authService.usuario.userId,
      updatorUser: this.authService.usuario.userId
    }

    // Cerrando caja
    this.alertService.question({ msg: 'Cerrando caja', buttonText: 'Cerrar' })
      .then(({ isConfirmed }) => {
        if (isConfirmed) {
          this.alertService.loading();
          this.cajasMayoristasService.nuevaCaja(data).subscribe({
            next: () => {
              this.montoReal = null;
              this.montoCintia = null;
              this.calculosIniciales();
            }, error: ({ error }) => this.alertService.errorApi(error.message)
          })
        }
      });

  }

}
