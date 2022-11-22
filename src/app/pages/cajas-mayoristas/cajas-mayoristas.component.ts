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

  // Caja
  public caja: any = {};
  public total_recibido = 0;

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
    gsap.from('.gsap-contenido', { y:100, opacity: 0, duration: .2 });
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
          next: ({ datos, gastos, ingresos, total_ingresos, total_gastos, total_recibido }) => {
            this.caja = datos;
            this.gastos = gastos;
            this.ingresos = ingresos;
            this.total_ingresos = total_ingresos;
            this.total_gastos = total_gastos;
            this.total_recibido = total_recibido;
            this.alertService.close();
          }, error: ({ error }) => this.alertService.errorApi(error.message)
        })
      }, error: ({ error }) => this.alertService.errorApi(error.message)
    })
  }

  // Nuevo gasto
  nuevoGasto(): void {

    // Verificacion: Tipo de gasto
    if(this.dataGasto.tipo_gasto.trim() === ''){
      this.alertService.info('Debe seleccionar un tipo de gasto');
      return;
    }

    // Verificacion: Repartidor
    if(this.dataGasto.repartidor.trim() === ''){
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
    if(this.dataIngreso.tipo_ingreso.trim() === ''){
      this.alertService.info('Debe seleccionar un tipo de ingreso');
      return;
    }

    // Verificacion: Repartidor
    if(this.dataIngreso.repartidor.trim() === ''){
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
      next: ({ datos, gastos, ingresos, total_ingresos, total_gastos, total_recibido }) => {
        this.caja = datos;
        this.gastos = gastos;
        this.ingresos = ingresos;
        this.total_ingresos = total_ingresos;
        this.total_gastos = total_gastos;
        this.total_recibido = total_recibido;
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

}
